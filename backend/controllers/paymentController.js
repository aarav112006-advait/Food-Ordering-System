const Order = require('../models/Order');
const { emitOrderStatusUpdated } = require('../sockets/trackingSocket');

// Initialize Stripe instance lazily or with environment key
const getStripe = () => {
  const secretKey = process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder_key_for_dev_mode';
  return require('stripe')(secretKey);
};

/**
 * @desc    Create Stripe Checkout Session for order
 * @route   POST /api/payments/checkout-session
 * @access  Private
 */
const createCheckoutSession = async (req, res, next) => {
  try {
    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: 'orderId is required'
      });
    }

    const order = await Order.findById(orderId).populate('restaurant', 'name');
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to pay for this order'
      });
    }

    if (order.paymentStatus === 'paid') {
      return res.status(400).json({
        success: false,
        message: 'This order is already paid'
      });
    }

    const stripe = getStripe();
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';

    // Build Stripe Line Items
    const line_items = order.items.map(item => ({
      price_data: {
        currency: process.env.STRIPE_CURRENCY || 'usd',
        product_data: {
          name: item.name,
          description: `Prepared by ${order.restaurant.name}`
        },
        unit_amount: Math.round(item.price * 100) // Cents
      },
      quantity: item.quantity
    }));

    // Add Delivery Fee
    if (order.deliveryFee > 0) {
      line_items.push({
        price_data: {
          currency: process.env.STRIPE_CURRENCY || 'usd',
          product_data: {
            name: 'Delivery Fee'
          },
          unit_amount: Math.round(order.deliveryFee * 100)
        },
        quantity: 1
      });
    }

    // Add Taxes
    if (order.tax > 0) {
      line_items.push({
        price_data: {
          currency: process.env.STRIPE_CURRENCY || 'usd',
          product_data: {
            name: 'Estimated Tax'
          },
          unit_amount: Math.round(order.tax * 100)
        },
        quantity: 1
      });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items,
      customer_email: req.user.email,
      client_reference_id: order._id.toString(),
      metadata: {
        orderId: order._id.toString(),
        userId: req.user._id.toString()
      },
      success_url: `${clientUrl}/orders/${order._id}?payment_success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${clientUrl}/orders/${order._id}?payment_cancelled=true`
    });

    order.paymentDetails.stripeSessionId = session.id;
    await order.save();

    res.status(200).json({
      success: true,
      sessionId: session.id,
      sessionUrl: session.url
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create Stripe PaymentIntent for in-app / mobile checkout
 * @route   POST /api/payments/create-payment-intent
 * @access  Private
 */
const createPaymentIntent = async (req, res, next) => {
  try {
    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: 'orderId is required'
      });
    }

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
        message: 'Not authorized to pay for this order'
      });
    }

    const stripe = getStripe();
    const amountInCents = Math.round(order.totalAmount * 100);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: process.env.STRIPE_CURRENCY || 'usd',
      metadata: {
        orderId: order._id.toString(),
        userId: req.user._id.toString()
      },
      automatic_payment_methods: {
        enabled: true
      }
    });

    order.paymentDetails.stripePaymentIntentId = paymentIntent.id;
    await order.save();

    res.status(200).json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Stripe Webhook handler to verify and confirm orders
 * @route   POST /api/payments/webhook
 * @access  Public (Signature verified via Stripe-Signature header)
 */
const handleWebhook = async (req, res, next) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const stripe = getStripe();

  let event;

  try {
    if (webhookSecret && sig) {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } else {
      // In development mode without webhook signing secret, parse body
      event = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    }
  } catch (err) {
    console.error(`[Webhook Error] Signature verification failed: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const orderId = session.metadata?.orderId || session.client_reference_id;

        if (orderId) {
          const order = await Order.findById(orderId);
          if (order) {
            order.paymentStatus = 'paid';
            if (order.status === 'placed') {
              order.status = 'confirmed';
            }
            order.paymentDetails.stripeSessionId = session.id;
            order.paymentDetails.stripePaymentIntentId = session.payment_intent;
            order.trackingTimeline.push({
              status: order.status,
              timestamp: new Date(),
              note: `Payment confirmed via Stripe Checkout ($${(session.amount_total / 100).toFixed(2)})`
            });
            await order.save();
            emitOrderStatusUpdated(order._id.toString(), order);
          }
        }
        break;
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object;
        const orderId = paymentIntent.metadata?.orderId;

        if (orderId) {
          const order = await Order.findById(orderId);
          if (order) {
            order.paymentStatus = 'paid';
            if (order.status === 'placed') {
              order.status = 'confirmed';
            }
            order.paymentDetails.stripePaymentIntentId = paymentIntent.id;
            order.trackingTimeline.push({
              status: order.status,
              timestamp: new Date(),
              note: `Payment confirmed via Stripe PaymentIntent ($${(paymentIntent.amount / 100).toFixed(2)})`
            });
            await order.save();
            emitOrderStatusUpdated(order._id.toString(), order);
          }
        }
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object;
        const orderId = paymentIntent.metadata?.orderId;

        if (orderId) {
          const order = await Order.findById(orderId);
          if (order) {
            order.paymentStatus = 'failed';
            order.trackingTimeline.push({
              status: order.status,
              timestamp: new Date(),
              note: `Payment failed: ${paymentIntent.last_payment_error?.message || 'Card declined'}`
            });
            await order.save();
            emitOrderStatusUpdated(order._id.toString(), order);
          }
        }
        break;
      }

      default:
        console.log(`[Stripe Webhook] Unhandled event type: ${event.type}`);
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error(`[Webhook Processing Error] ${error.message}`);
    res.status(500).json({ error: 'Webhook processing error' });
  }
};

module.exports = {
  createCheckoutSession,
  createPaymentIntent,
  handleWebhook
};
