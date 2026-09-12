const express = require('express');
const router = express.Router();
const {
  createOrder,
  getUserOrders,
  getOrderById,
  updateOrderStatus,
  assignDriver
} = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect); // All order endpoints require authentication

router.post('/', createOrder);
router.get('/', getUserOrders);
router.get('/:id', getOrderById);
router.patch('/:id/status', authorize('restaurant_owner', 'driver', 'admin'), updateOrderStatus);
router.patch('/:id/driver', authorize('driver', 'admin'), assignDriver);

module.exports = router;
