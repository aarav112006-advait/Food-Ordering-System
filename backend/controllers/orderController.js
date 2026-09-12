const Order = require('../models/Order');
const Restaurant = require('../models/Restaurant');
const MenuItem = require('../models/MenuItem');
const User = require('../models/User');
const { emitOrderStatusUpdated } = require('../sockets/trackingSocket');

/**
 * @desc    Create a new order
 * @route   POST /api/orders
 * @access  Private
 */
const createOrder = async (req, res, next) => {
  try {
    const {
      restaurantId,
      items,
      deliveryAddress,
      paymentMethod = 'stripe'
    } = req.body;

    if (!restaurantId || !items || !items.length || !deliveryAddress) {
      return res.status(400).json({
        success: false,
        message: 'Restaurant ID, order items, and delivery address are required'
      });
    }

    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }

    if (!restaurant.isAvailable) {
      return res.status(400).json({
        success: false,
        message: `'${restaurant.name}' is currently not accepting new orders`
      });
    }

    // Validate menu items & calculate subtotal
    const itemIds = items.map(i => i.menuItemId);
    const menuItems = await MenuItem.find({ _id: { $in: itemIds }, restaurant: restaurantId });

    if (menuItems.length !== items.length) {
      return res.status(400).json({
        success: false,
        message: 'One or more items are invalid or do not belong to this restaurant'
      });
    }

    let subtotal = 0;
    const validatedItems = [];

    for (const item of items) {
      const menuItem = menuItems.find(m => m._id.toString() === item.menuItemId);
      if (!menuItem.isAvailable) {
        return res.status(400).json({
          success: false,
          message: `Dish '${menuItem.name}' is currently sold out`
        });
      }

      const quantity = Math.max(1, parseInt(item.quantity || 1, 10));
      const itemSubtotal = menuItem.price * quantity;
      subtotal += itemSubtotal;

      validatedItems.push({
        menuItem: menuItem._id,
        name: menuItem.name,
        price: menuItem.price,
        quantity,
        specialInstructions: item.specialInstructions || ''
      });
    }

    // Minimum order check
    if (subtotal < restaurant.minimumOrder) {
      return res.status(400).json({
        success: false,
        message: `Minimum order amount for this restaurant is $${restaurant.minimumOrder.toFixed(2)}. Current subtotal: $${subtotal.toFixed(2)}`
      });
    }

    // Standard calculations
    const tax = Math.round(subtotal * 0.08 * 100) / 100; // 8% tax
    const deliveryFee = Number(restaurant.deliveryFee || 2.99);
    const totalAmount = Math.round((subtotal + tax + deliveryFee) * 100) / 100;

    // Estimated delivery time
    const maxMinutes = restaurant.deliveryTimeMinutes?.max || 45;
    const estimatedDeliveryTime = new Date(Date.now() + maxMinutes * 60 * 1000);

    const initialStatus = paymentMethod === 'cash_on_delivery' ? 'confirmed' : 'placed';

    const order = await Order.create({
      user: req.user._id,
      restaurant: restaurant._id,
      items: validatedItems,
      subtotal: Math.round(subtotal * 100) / 100,
      tax,
      deliveryFee,
      totalAmount,
      deliveryAddress,
      paymentMethod,
      paymentStatus: paymentMethod === 'cash_on_delivery' ? 'pending' : 'pending',
      status: initialStatus,
      estimatedDeliveryTime,
      trackingTimeline: [
        {
          status: 'placed',
          timestamp: new Date(),
          note: 'Order created by customer'
        },
        ...(paymentMethod === 'cash_on_delivery' ? [{
          status: 'confirmed',
          timestamp: new Date(),
          note: 'Cash on delivery order confirmed automatically'
        }] : [])
      ]
    });

    // Update user order history
    await User.findByIdAndUpdate(req.user._id, {
      $push: { orderHistory: order._id }
    });

    // Notify connected clients via WebSocket
    emitOrderStatusUpdated(order._id.toString(), order);

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: order
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get orders for logged in user
 * @route   GET /api/orders
 * @access  Private
 */
const getUserOrders = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    const filter = { user: req.user._id };
    if (status) {
      filter.status = status;
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, Math.min(50, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const total = await Order.countDocuments(filter);
    const orders = await Order.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .populate('restaurant', 'name bannerImage logo address deliveryTimeMinutes cuisineTypes')
      .populate('driver.user', 'name phone');

    res.status(200).json({
      success: true,
      count: orders.length,
      total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      data: orders
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get order by ID with details
 * @route   GET /api/orders/:id
 * @access  Private
 */
const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('restaurant', 'name address phone bannerImage logo')
      .populate('user', 'name email phone')
      .populate('driver.user', 'name phone');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Permission check: order customer, restaurant owner, driver, or admin
    const isCustomer = order.user._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    const isDriver = order.driver?.user?.toString() === req.user._id.toString() || req.user.role === 'driver';

    if (!isCustomer && !isAdmin && !isDriver) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this order'
      });
    }

    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update order status lifecycle
 * @route   PATCH /api/orders/:id/status
 * @access  Private (restaurant_owner, driver, admin)
 */
const updateOrderStatus = async (req, res, next) => {
  try {
    const { status, note } = req.body;

    const allowedStatuses = [
      'placed',
      'confirmed',
      'preparing',
      'ready_for_pickup',
      'out_for_delivery',
      'delivered',
      'cancelled'
    ];

    if (!status || !allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Allowed values: ${allowedStatuses.join(', ')}`
      });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (order.status === 'delivered' || order.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: `Cannot change status of an order that is already ${order.status}`
      });
    }

    order.status = status;
    order.trackingTimeline.push({
      status,
      timestamp: new Date(),
      note: note || `Order transitioned to ${status}`
    });

    const updatedOrder = await order.save();

    // Broadcast update to real-time room subscribers
    emitOrderStatusUpdated(updatedOrder._id.toString(), updatedOrder);

    res.status(200).json({
      success: true,
      message: `Order status successfully updated to ${status}`,
      data: updatedOrder
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Assign driver to order
 * @route   PATCH /api/orders/:id/driver
 * @access  Private (driver, admin)
 */
const assignDriver = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    const driverUser = req.user;
    order.driver = {
      user: driverUser._id,
      name: driverUser.name,
      phone: driverUser.phone || '',
      currentLocation: {
        lat: req.body.lat || 0,
        lng: req.body.lng || 0,
        updatedAt: new Date()
      }
    };

    if (order.status === 'ready_for_pickup') {
      order.status = 'out_for_delivery';
      order.trackingTimeline.push({
        status: 'out_for_delivery',
        timestamp: new Date(),
        note: `Driver ${driverUser.name} picked up the order and is on the way`
      });
    }

    const updatedOrder = await order.save();
    emitOrderStatusUpdated(updatedOrder._id.toString(), updatedOrder);

    res.status(200).json({
      success: true,
      message: 'Driver assigned successfully',
      data: updatedOrder
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrder,
  getUserOrders,
  getOrderById,
  updateOrderStatus,
  assignDriver
};
