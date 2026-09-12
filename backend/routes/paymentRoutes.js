const express = require('express');
const router = express.Router();
const {
  createCheckoutSession,
  createPaymentIntent,
  handleWebhook
} = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

// Webhook endpoint (Public, Stripe signature verified)
router.post('/webhook', handleWebhook);

// Protected payment endpoints
router.post('/checkout-session', protect, createCheckoutSession);
router.post('/create-payment-intent', protect, createPaymentIntent);

module.exports = router;
