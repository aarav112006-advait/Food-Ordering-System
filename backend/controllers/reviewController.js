const Review = require('../models/Review');
const Order = require('../models/Order');
const Restaurant = require('../models/Restaurant');

/**
 * @desc    Add a review for restaurant or dish from a completed order
 * @route   POST /api/reviews
 * @access  Private
 */
const addReview = async (req, res, next) => {
  try {
    const { orderId, restaurantId, menuItemId, rating, comment } = req.body;

    if (!orderId || !restaurantId || !rating) {
      return res.status(400).json({
        success: false,
        message: 'orderId, restaurantId, and rating (1-5) are required'
      });
    }

    // Verify order exists, belongs to user, and is delivered
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only review orders that you placed'
      });
    }

    if (order.status !== 'delivered') {
      return res.status(400).json({
        success: false,
        message: 'You can only review an order once it has been delivered'
      });
    }

    // Check if review already submitted for this order
    const existingReview = await Review.findOne({ user: req.user._id, order: orderId });
    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this order'
      });
    }

    const review = await Review.create({
      user: req.user._id,
      restaurant: restaurantId,
      menuItem: menuItemId || undefined,
      order: orderId,
      rating: Number(rating),
      comment: comment || ''
    });

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully',
      data: review
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get reviews for a restaurant with rating summary
 * @route   GET /api/reviews/restaurant/:restaurantId
 * @access  Public
 */
const getRestaurantReviews = async (req, res, next) => {
  try {
    const { restaurantId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, Math.min(50, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const total = await Review.countDocuments({ restaurant: restaurantId });
    const reviews = await Review.find({ restaurant: restaurantId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .populate('user', 'name')
      .populate('menuItem', 'name');

    // Compute star distribution breakdown
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    const allRatings = await Review.find({ restaurant: restaurantId }).select('rating');
    allRatings.forEach(r => {
      if (distribution[r.rating] !== undefined) {
        distribution[r.rating]++;
      }
    });

    res.status(200).json({
      success: true,
      count: reviews.length,
      total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      ratingBreakdown: distribution,
      data: reviews
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get reviews for a specific menu item / dish
 * @route   GET /api/reviews/dish/:dishId
 * @access  Public
 */
const getMenuItemReviews = async (req, res, next) => {
  try {
    const { dishId } = req.params;
    const reviews = await Review.find({ menuItem: dishId })
      .sort({ createdAt: -1 })
      .populate('user', 'name');

    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addReview,
  getRestaurantReviews,
  getMenuItemReviews
};
