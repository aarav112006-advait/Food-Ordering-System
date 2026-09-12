const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  menuItem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MenuItem',
    required: true
  },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Quantity must be at least 1']
  },
  specialInstructions: { type: String, default: '' }
}, { _id: false });

const trackingEventSchema = new mongoose.Schema({
  status: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  note: {
    type: String,
    default: ''
  }
}, { _id: false });

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  restaurant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: true,
    index: true
  },
  items: {
    type: [orderItemSchema],
    validate: [val => val.length > 0, 'Order must contain at least one item']
  },
  subtotal: {
    type: Number,
    required: true,
    min: 0
  },
  tax: {
    type: Number,
    required: true,
    default: 0
  },
  deliveryFee: {
    type: Number,
    required: true,
    default: 0
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  deliveryAddress: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, default: '' },
    postalCode: { type: String, required: true },
    country: { type: String, default: 'US' },
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  status: {
    type: String,
    enum: [
      'placed',
      'confirmed',
      'preparing',
      'ready_for_pickup',
      'out_for_delivery',
      'delivered',
      'cancelled'
    ],
    default: 'placed',
    index: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending',
    index: true
  },
  paymentMethod: {
    type: String,
    enum: ['stripe', 'cash_on_delivery', 'wallet'],
    default: 'stripe'
  },
  paymentDetails: {
    stripePaymentIntentId: { type: String },
    stripeSessionId: { type: String },
    receiptUrl: { type: String }
  },
  driver: {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: { type: String },
    phone: { type: String },
    currentLocation: {
      lat: { type: Number },
      lng: { type: Number },
      updatedAt: { type: Date }
    }
  },
  estimatedDeliveryTime: {
    type: Date
  },
  trackingTimeline: [trackingEventSchema]
}, {
  timestamps: true
});

module.exports = mongoose.model('Order', orderSchema);
