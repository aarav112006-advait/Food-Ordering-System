const express = require('express');
const router = express.Router();
const {
  getRestaurants,
  getRestaurantById,
  getRestaurantMenu,
  searchRestaurantsAndDishes,
  createRestaurant,
  addMenuItem
} = require('../controllers/restaurantController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', getRestaurants);
router.get('/search', searchRestaurantsAndDishes);
router.get('/:id', getRestaurantById);
router.get('/:id/menu', getRestaurantMenu);

// Protected routes for restaurant owners and admins
router.post('/', protect, authorize('restaurant_owner', 'admin'), createRestaurant);
router.post('/:id/menu', protect, authorize('restaurant_owner', 'admin'), addMenuItem);

module.exports = router;
