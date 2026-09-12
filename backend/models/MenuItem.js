const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
  restaurant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: [true, 'Associated restaurant is required'],
    index: true
  },
  name: {
    type: String,
    required: [true, 'Dish name is required'],
    trim: true,
    maxlength: [100, 'Dish name cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true,
    index: true
  },
  imageUrl: {
    type: String,
    default: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c'
  },
  isVegetarian: {
    type: Boolean,
    default: false
  },
  isVegan: {
    type: Boolean,
    default: false
  },
  isGlutenFree: {
    type: Boolean,
    default: false
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  spicyLevel: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  preparationTimeMinutes: {
    type: Number,
    default: 15
  }
}, {
  timestamps: true
});

menuItemSchema.index({ name: 'text', description: 'text', tags: 'text' });

module.exports = mongoose.model('MenuItem', menuItemSchema);
