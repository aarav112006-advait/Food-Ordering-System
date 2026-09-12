import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Star, Clock, Plus, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { recommendationsApi } from '../services/api';
import { useCart } from '../context/CartContext';

const Recommendations = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addedItemIds, setAddedItemIds] = useState(new Set());
  const carouselRef = useRef(null);
  const { addItem } = useCart();

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      try {
        const data = await recommendationsApi.get();
        if (isMounted) setRecommendations(data);
      } catch (err) {
        console.error('Failed to load recommendations', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    load();
    return () => {
      isMounted = false;
    };
  }, []);

  const scroll = (direction) => {
    if (carouselRef.current) {
      const scrollAmount = direction === 'left' ? -340 : 340;
      carouselRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const handleQuickAdd = (rec) => {
    const item = {
      id: rec.id,
      name: rec.dishName,
      price: rec.price,
      quantity: 1,
      image: rec.image,
    };
    const restInfo = {
      id: rec.restaurantId,
      name: rec.restaurantName,
      deliveryFee: 1.99,
    };

    addItem(item, restInfo);

    setAddedItemIds((prev) => new Set(prev).add(rec.id));
    setTimeout(() => {
      setAddedItemIds((prev) => {
        const next = new Set(prev);
        next.delete(rec.id);
        return next;
      });
    }, 1800);
  };

  if (loading) {
    return (
      <div className="recommendations-container loading-state">
        <div className="rec-skeleton-header" />
        <div className="rec-skeleton-grid">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="rec-skeleton-card" />
          ))}
        </div>
      </div>
    );
  }

  if (recommendations.length === 0) return null;

  return (
    <section className="recommendations-section">
      <div className="rec-header">
        <div className="rec-title-group">
          <div className="rec-badge">
            <Sparkles size={16} className="sparkle-gold" />
            <span>AI Smart Recommendations</span>
          </div>
          <h2 className="rec-heading">Curated Just For Your Taste</h2>
          <p className="rec-subheading">
            Trained on trending neighborhood favorites, dietary selections, and your ordering history.
          </p>
        </div>

        {/* Carousel Navigation Buttons */}
        <div className="carousel-controls">
          <button
            className="carousel-arrow"
            onClick={() => scroll('left')}
            aria-label="Scroll left"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            className="carousel-arrow"
            onClick={() => scroll('right')}
            aria-label="Scroll right"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Horizontal Carousel Track */}
      <div className="rec-carousel" ref={carouselRef}>
        {recommendations.map((rec) => {
          const isRecentlyAdded = addedItemIds.has(rec.id);
          return (
            <div key={rec.id} className="rec-card">
              <div className="rec-card-image-wrap">
                <img src={rec.image} alt={rec.dishName} className="rec-image" loading="lazy" />
                <span className="rec-ai-badge">{rec.aiBadge}</span>
              </div>

              <div className="rec-card-body">
                <div className="rec-rest-row">
                  <Link to={`/restaurant/${rec.restaurantId}`} className="rec-restaurant-link">
                    {rec.restaurantName}
                  </Link>
                  <div className="rec-rating">
                    <Star size={13} className="star-icon-filled" />
                    <span>{rec.rating}</span>
                  </div>
                </div>

                <h3 className="rec-dish-title">{rec.dishName}</h3>
                <p className="rec-reason">{rec.reason}</p>

                <div className="rec-footer">
                  <div className="rec-price-meta">
                    <span className="rec-price">${rec.price.toFixed(2)}</span>
                    <span className="rec-eta">
                      <Clock size={12} /> {rec.deliveryTimeMinutes} mins
                    </span>
                  </div>

                  <button
                    className={`rec-add-btn ${isRecentlyAdded ? 'added' : ''}`}
                    onClick={() => handleQuickAdd(rec)}
                    aria-label={`Add ${rec.dishName} to cart`}
                  >
                    {isRecentlyAdded ? (
                      <>
                        <Check size={16} /> Added
                      </>
                    ) : (
                      <>
                        <Plus size={16} /> Add
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default Recommendations;
