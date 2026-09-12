const Restaurant = require('../models/Restaurant');
const MenuItem = require('../models/MenuItem');

/**
 * @desc    Get all restaurants with filters, search, geospatial distance, and pagination
 * @route   GET /api/restaurants
 * @access  Public
 */
const getRestaurants = async (req, res, next) => {
  try {
    const {
      search,
      cuisine,
      minRating,
      maxDeliveryFee,
      maxDeliveryTime,
      isAvailable,
      lat,
      lng,
      maxDistanceKm = 20,
      sortBy = 'rating',
      order = 'desc',
      page = 1,
      limit = 10
    } = req.query;

    const query = {};

    // Availability filter
    if (isAvailable !== undefined) {
      query.isAvailable = isAvailable === 'true';
    }

    // Cuisine filter
    if (cuisine) {
      const cuisineList = cuisine.split(',').map(c => c.trim());
      query.cuisineTypes = { $in: cuisineList.map(c => new RegExp(c, 'i')) };
    }

    // Rating filter
    if (minRating) {
      query.rating = { $gte: Number(minRating) };
    }

    // Delivery fee filter
    if (maxDeliveryFee) {
      query.deliveryFee = { $lte: Number(maxDeliveryFee) };
    }

    // Delivery time filter
    if (maxDeliveryTime) {
      query['deliveryTimeMinutes.max'] = { $lte: Number(maxDeliveryTime) };
    }

    // Text search filter
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { cuisineTypes: { $elemMatch: { $regex: search, $options: 'i' } } }
      ];
    }

    // Geospatial filter if coordinates provided
    if (lat && lng) {
      const longitude = parseFloat(lng);
      const latitude = parseFloat(lat);
      const radiusInMeters = parseFloat(maxDistanceKm) * 1000;

      query.location = {
        $nearSphere: {
          $geometry: {
            type: 'Point',
            coordinates: [longitude, latitude]
          },
          $maxDistance: radiusInMeters
        }
      };
    }

    // Sorting
    let sortOption = {};
    const sortDirection = order.toLowerCase() === 'asc' ? 1 : -1;

    if (sortBy === 'rating') {
      sortOption = { rating: sortDirection, numReviews: -1 };
    } else if (sortBy === 'deliveryFee') {
      sortOption = { deliveryFee: sortDirection };
    } else if (sortBy === 'deliveryTime') {
      sortOption = { 'deliveryTimeMinutes.min': sortDirection };
    } else if (sortBy === 'name') {
      sortOption = { name: sortDirection };
    } else {
      sortOption = { createdAt: -1 };
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, Math.min(50, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const total = await Restaurant.countDocuments(query);
    const restaurants = await Restaurant.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(limitNum)
      .populate('owner', 'name email');

    res.status(200).json({
      success: true,
      count: restaurants.length,
      total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      data: restaurants
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single restaurant by ID with its menu items
 * @route   GET /api/restaurants/:id
 * @access  Public
 */
const getRestaurantById = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id)
      .populate('owner', 'name email');

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }

    const menuItems = await MenuItem.find({ restaurant: restaurant._id, isAvailable: true });

    res.status(200).json({
      success: true,
      data: {
        ...restaurant.toObject(),
        menuItems
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get menu of a restaurant grouped by categories
 * @route   GET /api/restaurants/:id/menu
 * @access  Public
 */
const getRestaurantMenu = async (req, res, next) => {
  try {
    const { category, isVegetarian, isVegan, isGlutenFree } = req.query;

    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }

    const filter = { restaurant: restaurant._id };
    if (category) filter.category = category;
    if (isVegetarian === 'true') filter.isVegetarian = true;
    if (isVegan === 'true') filter.isVegan = true;
    if (isGlutenFree === 'true') filter.isGlutenFree = true;

    const items = await MenuItem.find(filter).sort({ category: 1, price: 1 });

    // Group items by category
    const categorizedMenu = items.reduce((acc, item) => {
      const cat = item.category || 'Other';
      if (!acc[cat]) {
        acc[cat] = [];
      }
      acc[cat].push(item);
      return acc;
    }, {});

    res.status(200).json({
      success: true,
      restaurantId: restaurant._id,
      restaurantName: restaurant.name,
      totalItems: items.length,
      categories: Object.keys(categorizedMenu),
      menuByCategory: categorizedMenu,
      items
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Unified search across restaurants, cuisines, and menu items
 * @route   GET /api/restaurants/search
 * @access  Public
 */
const searchRestaurantsAndDishes = async (req, res, next) => {
  try {
    const { q, limit = 10 } = req.query;

    if (!q || q.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Please provide a search keyword with query parameter ?q='
      });
    }

    const searchRegex = new RegExp(q.trim(), 'i');
    const limitNum = Math.max(1, Math.min(30, parseInt(limit, 10)));

    // Search restaurants by name, description, or cuisine
    const restaurants = await Restaurant.find({
      $or: [
        { name: searchRegex },
        { description: searchRegex },
        { cuisineTypes: searchRegex }
      ]
    }).limit(limitNum);

    // Search dishes by name, description, tags, or category
    const dishes = await MenuItem.find({
      $or: [
        { name: searchRegex },
        { description: searchRegex },
        { category: searchRegex },
        { tags: searchRegex }
      ]
    })
      .populate('restaurant', 'name rating deliveryTimeMinutes deliveryFee bannerImage')
      .limit(limitNum);

    res.status(200).json({
      success: true,
      query: q,
      results: {
        restaurantsCount: restaurants.length,
        restaurants,
        dishesCount: dishes.length,
        dishes
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new restaurant (owners/admins)
 * @route   POST /api/restaurants
 * @access  Private (restaurant_owner, admin)
 */
const createRestaurant = async (req, res, next) => {
  try {
    const {
      name,
      description,
      cuisineTypes,
      address,
      coordinates, // [lng, lat]
      deliveryTimeMinutes,
      deliveryFee,
      minimumOrder,
      openingHours,
      bannerImage,
      logo
    } = req.body;

    if (!name || !cuisineTypes || !address || !coordinates) {
      return res.status(400).json({
        success: false,
        message: 'Name, cuisineTypes, address, and coordinates [lng, lat] are required'
      });
    }

    const restaurant = await Restaurant.create({
      name,
      description,
      owner: req.user._id,
      cuisineTypes: Array.isArray(cuisineTypes) ? cuisineTypes : [cuisineTypes],
      address,
      location: {
        type: 'Point',
        coordinates: [Number(coordinates[0]), Number(coordinates[1])]
      },
      deliveryTimeMinutes: deliveryTimeMinutes || { min: 20, max: 40 },
      deliveryFee: deliveryFee !== undefined ? Number(deliveryFee) : 2.99,
      minimumOrder: minimumOrder !== undefined ? Number(minimumOrder) : 10.0,
      openingHours: openingHours || { open: '09:00', close: '22:00' },
      bannerImage,
      logo
    });

    res.status(201).json({
      success: true,
      message: 'Restaurant created successfully',
      data: restaurant
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Add a menu item to a restaurant
 * @route   POST /api/restaurants/:id/menu
 * @access  Private (restaurant_owner, admin)
 */
const addMenuItem = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }

    // Check ownership unless admin
    if (restaurant.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to add menu items to this restaurant'
      });
    }

    const {
      name,
      description,
      price,
      category,
      imageUrl,
      isVegetarian,
      isVegan,
      isGlutenFree,
      tags,
      spicyLevel,
      preparationTimeMinutes
    } = req.body;

    if (!name || price === undefined || !category) {
      return res.status(400).json({
        success: false,
        message: 'Name, price, and category are required'
      });
    }

    const menuItem = await MenuItem.create({
      restaurant: restaurant._id,
      name,
      description,
      price: Number(price),
      category,
      imageUrl,
      isVegetarian: Boolean(isVegetarian),
      isVegan: Boolean(isVegan),
      isGlutenFree: Boolean(isGlutenFree),
      tags: Array.isArray(tags) ? tags : [],
      spicyLevel: Number(spicyLevel || 0),
      preparationTimeMinutes: Number(preparationTimeMinutes || 15)
    });

    res.status(201).json({
      success: true,
      message: 'Menu item added successfully',
      data: menuItem
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getRestaurants,
  getRestaurantById,
  getRestaurantMenu,
  searchRestaurantsAndDishes,
  createRestaurant,
  addMenuItem
};
