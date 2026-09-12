const Order = require('../models/Order');
const Restaurant = require('../models/Restaurant');
const MenuItem = require('../models/MenuItem');
const User = require('../models/User');

/**
 * @desc    Get hybrid personalized recommendations (Content-Based & Collaborative Filtering)
 * @route   GET /api/recommendations
 * @access  Private
 */
const getPersonalizedRecommendations = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // 1. Fetch user data & order history
    const user = await User.findById(userId);
    const userOrders = await Order.find({ user: userId, status: { $ne: 'cancelled' } })
      .sort({ createdAt: -1 })
      .limit(30)
      .populate('restaurant', 'name cuisineTypes rating location');

    // Track ordered item IDs and frequency
    const orderedItemCount = {};
    const orderedRestaurantIds = new Set();
    const cuisineScoreMap = {};

    // Seed with user's explicitly chosen favorite cuisines
    (user.favoriteCuisines || []).forEach(c => {
      const norm = c.trim().toLowerCase();
      cuisineScoreMap[norm] = (cuisineScoreMap[norm] || 0) + 5; // high weight for explicit preference
    });

    // Extract historical implicit behavior
    userOrders.forEach(order => {
      if (order.restaurant) {
        orderedRestaurantIds.add(order.restaurant._id.toString());
        (order.restaurant.cuisineTypes || []).forEach(c => {
          const norm = c.trim().toLowerCase();
          cuisineScoreMap[norm] = (cuisineScoreMap[norm] || 0) + 2;
        });
      }

      (order.items || []).forEach(item => {
        const idStr = item.menuItem.toString();
        orderedItemCount[idStr] = (orderedItemCount[idStr] || 0) + item.quantity;
      });
    });

    // Top preferred cuisines sorted by affinity score
    const topCuisines = Object.entries(cuisineScoreMap)
      .sort((a, b) => b[1] - a[1])
      .map(([cuisine]) => cuisine);

    // 2. Collaborative Filtering: Find peers who ordered from the same restaurants
    let collaborativeDishRecommendations = [];
    if (orderedRestaurantIds.size > 0) {
      // Find other orders at these same restaurants from different users
      const peerOrders = await Order.find({
        restaurant: { $in: Array.from(orderedRestaurantIds) },
        user: { $ne: userId },
        status: 'delivered'
      })
        .limit(100)
        .select('items user');

      const peerItemScores = {};
      peerOrders.forEach(order => {
        order.items.forEach(item => {
          const idStr = item.menuItem.toString();
          // Filter out items the user has already frequently ordered
          if (!orderedItemCount[idStr]) {
            peerItemScores[idStr] = (peerItemScores[idStr] || 0) + item.quantity;
          }
        });
      });

      const topPeerItemIds = Object.entries(peerItemScores)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8)
        .map(([id]) => id);

      if (topPeerItemIds.length > 0) {
        collaborativeDishRecommendations = await MenuItem.find({
          _id: { $in: topPeerItemIds },
          isAvailable: true
        }).populate('restaurant', 'name cuisineTypes rating deliveryTimeMinutes deliveryFee bannerImage');
      }
    }

    // 3. Content-Based Filtering: High-rated dishes matching user top cuisines
    let contentBasedDishRecommendations = [];
    let recommendedRestaurants = [];

    if (topCuisines.length > 0) {
      const cuisineRegexes = topCuisines.slice(0, 4).map(c => new RegExp(`^${c}$`, 'i'));

      // Recommended restaurants matching user affinity
      recommendedRestaurants = await Restaurant.find({
        cuisineTypes: { $in: cuisineRegexes },
        isAvailable: true
      })
        .sort({ rating: -1, numReviews: -1 })
        .limit(6);

      const matchingRestaurantIds = recommendedRestaurants.map(r => r._id);

      contentBasedDishRecommendations = await MenuItem.find({
        restaurant: { $in: matchingRestaurantIds },
        _id: { $nin: Object.keys(orderedItemCount) },
        isAvailable: true
      })
        .limit(8)
        .populate('restaurant', 'name cuisineTypes rating deliveryTimeMinutes deliveryFee bannerImage');
    }

    // 4. Fallback / Cold Start handling: Trending items
    let trendingDishes = [];
    if (contentBasedDishRecommendations.length === 0 && collaborativeDishRecommendations.length === 0) {
      trendingDishes = await MenuItem.find({ isAvailable: true })
        .sort({ price: 1 })
        .limit(10)
        .populate('restaurant', 'name cuisineTypes rating deliveryTimeMinutes deliveryFee bannerImage');

      recommendedRestaurants = await Restaurant.find({ isAvailable: true })
        .sort({ rating: -1 })
        .limit(6);
    }

    // 5. Frequently Ordered Again (Reorder Favorites)
    const reorderItemIds = Object.entries(orderedItemCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([id]) => id);

    const reorderFavorites = await MenuItem.find({
      _id: { $in: reorderItemIds },
      isAvailable: true
    }).populate('restaurant', 'name cuisineTypes rating deliveryTimeMinutes deliveryFee bannerImage');

    // Format recommendations with transparent reasoning tags
    const dishes = [
      ...collaborativeDishRecommendations.map(dish => ({
        ...dish.toObject(),
        recommendationType: 'collaborative_filtering',
        reason: 'Popular among foodies who love similar restaurants'
      })),
      ...contentBasedDishRecommendations.map(dish => ({
        ...dish.toObject(),
        recommendationType: 'content_based',
        reason: `Matches your love for ${(dish.restaurant?.cuisineTypes || []).join(', ') || 'good food'}`
      })),
      ...trendingDishes.map(dish => ({
        ...dish.toObject(),
        recommendationType: 'trending',
        reason: 'Top rated on our platform right now'
      }))
    ];

    res.status(200).json({
      success: true,
      userPreferences: {
        explicitFavorites: user.favoriteCuisines,
        detectedTopCuisines: topCuisines.slice(0, 5),
        totalOrdersAnalyzed: userOrders.length
      },
      data: {
        recommendedDishes: dishes,
        recommendedRestaurants,
        reorderFavorites
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get trending restaurants and dishes (public cold start)
 * @route   GET /api/recommendations/trending
 * @access  Public
 */
const getTrendingRecommendations = async (req, res, next) => {
  try {
    const trendingRestaurants = await Restaurant.find({ isAvailable: true })
      .sort({ rating: -1, numReviews: -1 })
      .limit(8);

    const restaurantIds = trendingRestaurants.map(r => r._id);

    const trendingDishes = await MenuItem.find({
      restaurant: { $in: restaurantIds },
      isAvailable: true
    })
      .limit(12)
      .populate('restaurant', 'name cuisineTypes rating deliveryTimeMinutes deliveryFee bannerImage');

    res.status(200).json({
      success: true,
      data: {
        trendingRestaurants,
        trendingDishes
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPersonalizedRecommendations,
  getTrendingRecommendations
};
