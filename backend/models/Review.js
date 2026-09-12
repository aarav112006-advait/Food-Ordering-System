const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
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
  menuItem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MenuItem'
  },
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot exceed 5']
  },
  comment: {
    type: String,
    trim: true,
    maxlength: [1000, 'Comment cannot exceed 1000 characters'],
    default: ''
  }
}, {
  timestamps: true
});

// Prevent duplicate review for the same order by the same user
reviewSchema.index({ user: 1, order: 1 }, { unique: true });

// Static method to recalculate average rating for a restaurant
reviewSchema.statics.calculateAverageRating = async function (restaurantId) {
  const stats = await this.aggregate([
    { $match: { restaurant: new mongoose.Types.ObjectId(restaurantId) } },
    {
      $group: {
        _id: '$restaurant',
        numReviews: { $sum: 1 },
        avgRating: { $avg: '$rating' }
      }
    }
  ]);

  try {
    const Restaurant = mongoose.model('Restaurant');
    if (stats.length > 0) {
      await Restaurant.findByIdAndUpdate(restaurantId, {
        rating: Math.round(stats[0].avgRating * 10) / 10,
        numReviews: stats[0].numReviews
      });
    } else {
      await Restaurant.findByIdAndUpdate(restaurantId, {
        rating: 0,
        numReviews: 0
      });
    }
  } catch (err) {
    console.error('[Review Error] Failed to update restaurant rating stats:', err);
  }
};

// Post-save hook to update restaurant rating
reviewSchema.post('save', function () {
  this.constructor.calculateAverageRating(this.restaurant);
});

// Post-findOneAndDelete or remove
reviewSchema.post('findOneAndDelete', function (doc) {
  if (doc) {
    doc.constructor.calculateAverageRating(doc.restaurant);
  }
});

module.exports = mongoose.model('Review', reviewSchema);
