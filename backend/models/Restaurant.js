const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Restaurant name is required'],
    trim: true,
    maxlength: [120, 'Name cannot exceed 120 characters']
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  cuisineTypes: [{
    type: String,
    trim: true,
    required: true
  }],
  address: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, default: '' },
    postalCode: { type: String, required: true },
    country: { type: String, default: 'US' }
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true,
      index: '2dsphere'
    }
  },
  rating: {
    type: Number,
    default: 0,
    min: [0, 'Rating cannot be less than 0'],
    max: [5, 'Rating cannot exceed 5']
  },
  numReviews: {
    type: Number,
    default: 0
  },
  deliveryTimeMinutes: {
    min: { type: Number, default: 25 },
    max: { type: Number, default: 45 }
  },
  deliveryFee: {
    type: Number,
    default: 2.99,
    min: [0, 'Delivery fee cannot be negative']
  },
  minimumOrder: {
    type: Number,
    default: 10.00,
    min: [0, 'Minimum order cannot be negative']
  },
  openingHours: {
    open: { type: String, default: '09:00' },
    close: { type: String, default: '22:00' }
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  bannerImage: {
    type: String,
    default: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4'
  },
  logo: {
    type: String,
    default: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Text index for search
restaurantSchema.index({ name: 'text', description: 'text', cuisineTypes: 'text' });

// Virtual to populate menu items
restaurantSchema.virtual('menuItems', {
  ref: 'MenuItem',
  localField: '_id',
  foreignField: 'restaurant'
});

module.exports = mongoose.model('Restaurant', restaurantSchema);
