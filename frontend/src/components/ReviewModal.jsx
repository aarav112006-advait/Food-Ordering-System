import React, { useState } from 'react';
import {
  X,
  Star,
  ThumbsUp,
  Camera,
  CheckCircle2,
  Sparkles,
  MessageSquareQuote,
} from 'lucide-react';
import { reviewsApi } from '../services/api';

const REVIEW_TAGS = [
  '🔥 Hot & Fresh',
  '⚡ Super Fast Delivery',
  '🍕 Crispy & Flavorful',
  '🥗 Generous Portions',
  '📦 Eco-Friendly Packaging',
  '🎯 100% Accurate Order',
  '🛵 Polite & Friendly Courier',
  '💰 Great Value',
];

const RATING_DESCRIPTIONS = {
  1: 'Disappointing',
  2: 'Fair / Could be better',
  3: 'Good experience',
  4: 'Great food & service',
  5: 'Exceptional & delicious!',
};

const ReviewModal = ({ isOpen, onClose, order, restaurantName = 'the restaurant' }) => {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [selectedTags, setSelectedTags] = useState(new Set(['🔥 Hot & Fresh', '⚡ Super Fast Delivery']));
  const [reviewText, setReviewText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen) return null;

  const toggleTag = (tag) => {
    setSelectedTags((prev) => {
      const updated = new Set(prev);
      if (updated.has(tag)) updated.delete(tag);
      else updated.add(tag);
      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await reviewsApi.submit({
        orderId: order?.id,
        restaurantId: order?.restaurant?.id,
        rating,
        tags: Array.from(selectedTags),
        comment: reviewText,
        submittedAt: new Date().toISOString(),
      });

      setIsSubmitted(true);
      setTimeout(() => {
        setIsSubmitted(false);
        onClose();
      }, 2000);
    } catch (err) {
      console.error('Review submission error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop review-modal-backdrop" onClick={onClose}>
      <div className="modal-card review-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-wrap">
            <MessageSquareQuote size={22} className="review-header-icon" />
            <h3 className="modal-title">Rate Your Order</h3>
          </div>
          <button className="close-icon-btn" onClick={onClose} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        {isSubmitted ? (
          <div className="review-success-view">
            <CheckCircle2 size={54} className="success-icon-large" />
            <h3>Thank you for your review!</h3>
            <p>Your feedback helps {restaurantName} and fellow food lovers.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="review-modal-form">
            <p className="review-intro">
              How was your meal from <strong>{restaurantName}</strong>?
            </p>

            {/* Star Rating Selection */}
            <div className="star-rating-block">
              <div className="stars-row">
                {[1, 2, 3, 4, 5].map((star) => {
                  const filled = (hoverRating || rating) >= star;
                  return (
                    <button
                      key={star}
                      type="button"
                      className="star-interactive-btn"
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setRating(star)}
                      aria-label={`Rate ${star} star`}
                    >
                      <Star
                        size={32}
                        className={filled ? 'star-gold-fill' : 'star-gold-empty'}
                        fill={filled ? '#FBBF24' : 'none'}
                        color={filled ? '#FBBF24' : '#D1D5DB'}
                      />
                    </button>
                  );
                })}
              </div>
              <span className="rating-desc-text">
                {RATING_DESCRIPTIONS[hoverRating || rating]}
              </span>
            </div>

            {/* Dish & Service Tags */}
            <div className="review-tags-section">
              <label className="section-small-label">What stood out most?</label>
              <div className="tags-flex-wrap">
                {REVIEW_TAGS.map((tag) => {
                  const isSelected = selectedTags.has(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      className={`review-tag-chip ${isSelected ? 'selected' : ''}`}
                      onClick={() => toggleTag(tag)}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Written Comment */}
            <div className="form-group">
              <label className="section-small-label">Share more details (Optional):</label>
              <textarea
                className="review-textarea"
                rows={3}
                placeholder="Tell others what you loved about the food, delivery, or packaging..."
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                maxLength={500}
              />
              <div className="char-counter">{reviewText.length} / 500</div>
            </div>

            {/* Photo Mock Placeholder */}
            <div className="review-photo-strip">
              <button type="button" className="btn-add-photo-placeholder">
                <Camera size={16} />
                <span>Add Photos</span>
              </button>
              <span className="photo-hint">Optional: Show off your hot meal!</span>
            </div>

            {/* Actions */}
            <div className="review-actions-footer">
              <button type="button" className="btn-outline" onClick={onClose}>
                Skip for now
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Review'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ReviewModal;
