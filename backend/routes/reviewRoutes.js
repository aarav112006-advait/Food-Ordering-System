const express = require('express');
const router = express.Router();
const {
  addReview,
  getRestaurantReviews,
  getMenuItemReviews
} = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, addReview);
router.get('/restaurant/:restaurantId', getRestaurantReviews);
router.get('/dish/:dishId', getMenuItemReviews);

module.exports = router;
