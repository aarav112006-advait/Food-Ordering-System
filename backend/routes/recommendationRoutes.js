const express = require('express');
const router = express.Router();
const {
  getPersonalizedRecommendations,
  getTrendingRecommendations
} = require('../controllers/recommendationController');
const { protect } = require('../middleware/authMiddleware');

// Public cold-start endpoint
router.get('/trending', getTrendingRecommendations);

// Personalized recommendation for authenticated users
router.get('/', protect, getPersonalizedRecommendations);

module.exports = router;
