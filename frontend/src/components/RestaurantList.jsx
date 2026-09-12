import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Star,
  Clock,
  Bike,
  Heart,
  SlidersHorizontal,
  Flame,
  Search,
  BadgePercent,
  CheckCircle2,
} from 'lucide-react';
import { restaurantsApi } from '../services/api';
import Recommendations from './Recommendations';

const FILTER_CATEGORIES = [
  'All',
  'Pizza',
  'Burgers',
  'Sushi',
  'Indian',
  'Healthy',
  'Mexican',
  'Under 30 mins',
  'Free Delivery',
  'Top Rated 4.8+',
];

const RestaurantList = ({ initialSearch = '' }) => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [sortBy, setSortBy] = useState('recommended');
  const [favorites, setFavorites] = useState(new Set());
  const navigate = useNavigate();

  useEffect(() => {
    setSearchQuery(initialSearch);
  }, [initialSearch]);

  useEffect(() => {
    let isMounted = true;
    const fetchRestaurants = async () => {
      setLoading(true);
      try {
        const data = await restaurantsApi.getAll({ search: searchQuery });
        if (isMounted) setRestaurants(data);
      } catch (err) {
        console.error('Error fetching restaurants', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchRestaurants();
    return () => {
      isMounted = false;
    };
  }, [searchQuery]);

  const toggleFavorite = (e, id) => {
    e.stopPropagation();
    setFavorites((prev) => {
      const updated = new Set(prev);
      if (updated.has(id)) updated.delete(id);
      else updated.add(id);
      return updated;
    });
  };

  // Filter & Sort Pipeline
  const filteredAndSortedRestaurants = useMemo(() => {
    let list = [...restaurants];

    // Category & Quick Filter chips
    if (activeCategory !== 'All') {
      if (activeCategory === 'Under 30 mins') {
        list = list.filter((r) => {
          const maxTime = parseInt(r.deliveryTimeMinutes.split('-')[1] || '30', 10);
          return maxTime <= 30;
        });
      } else if (activeCategory === 'Free Delivery') {
        list = list.filter((r) => r.deliveryFee === 0 || r.discountText?.toLowerCase().includes('free delivery'));
      } else if (activeCategory === 'Top Rated 4.8+') {
        list = list.filter((r) => r.rating >= 4.8);
      } else {
        list = list.filter((r) =>
          r.cuisine.some((c) => c.toLowerCase() === activeCategory.toLowerCase())
        );
      }
    }

    // Sort
    switch (sortBy) {
      case 'rating':
        list.sort((a, b) => b.rating - a.rating);
        break;
      case 'deliveryTime':
        list.sort((a, b) => {
          const timeA = parseInt(a.deliveryTimeMinutes.split('-')[0], 10);
          const timeB = parseInt(b.deliveryTimeMinutes.split('-')[0], 10);
          return timeA - timeB;
        });
        break;
      case 'deliveryFee':
        list.sort((a, b) => a.deliveryFee - b.deliveryFee);
        break;
      default:
        // 'recommended' prioritizes promoted and rating
        list.sort((a, b) => (b.isPromoted ? 1 : 0) - (a.isPromoted ? 1 : 0) || b.rating - a.rating);
        break;
    }

    return list;
  }, [restaurants, activeCategory, sortBy]);

  return (
    <div className="restaurant-list-page">
      {/* Hero Promotional Banner */}
      <section className="hero-banner">
        <div className="hero-content">
          <div className="hero-tag">
            <Flame size={16} className="hero-tag-icon" />
            <span>Fast, Hot & Curated Meals</span>
          </div>
          <h1 className="hero-title">Delicious Dining Delivered to Your Doorstep</h1>
          <p className="hero-desc">
            Explore 100+ local culinary gems, wood-fired artisanal pizzas, gourmet burgers, and fresh sushi with live real-time GPS tracking.
          </p>

          <div className="hero-perks">
            <div className="perk-item">
              <CheckCircle2 size={16} className="perk-icon" />
              <span>Live Order Tracking</span>
            </div>
            <div className="perk-item">
              <CheckCircle2 size={16} className="perk-icon" />
              <span>No Minimums on Select Items</span>
            </div>
            <div className="perk-item">
              <CheckCircle2 size={16} className="perk-icon" />
              <span>Secure Stripe Payments</span>
            </div>
          </div>
        </div>
      </section>

      {/* AI Recommendations Section */}
      <Recommendations />

      {/* Main Filter & Restaurants Grid */}
      <section className="restaurants-section">
        <div className="section-toolbar">
          <div className="filter-chips-scroll">
            {FILTER_CATEGORIES.map((cat) => (
              <button
                key={cat}
                className={`filter-chip ${activeCategory === cat ? 'active' : ''}`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="sort-wrapper">
            <SlidersHorizontal size={16} className="sort-icon" />
            <select
              className="sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              aria-label="Sort restaurants by"
            >
              <option value="recommended">Sort by: Recommended</option>
              <option value="rating">Highest Rated</option>
              <option value="deliveryTime">Fastest Delivery</option>
              <option value="deliveryFee">Lowest Delivery Fee</option>
            </select>
          </div>
        </div>

        {/* Results Count / Search feedback */}
        <div className="results-meta-bar">
          <span className="results-count">
            Showing <strong>{filteredAndSortedRestaurants.length}</strong> restaurants
          </span>
          {searchQuery && (
            <span className="search-active-pill">
              Search: "{searchQuery}"
              <button onClick={() => setSearchQuery('')} className="pill-clear-btn">
                ✕
              </button>
            </span>
          )}
        </div>

        {/* Restaurants Grid */}
        {loading ? (
          <div className="restaurant-grid loading-grid">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="restaurant-skeleton-card" />
            ))}
          </div>
        ) : filteredAndSortedRestaurants.length === 0 ? (
          <div className="empty-results-box">
            <Search size={48} className="empty-icon" />
            <h3>No restaurants found</h3>
            <p>We couldn't find matches for your current category and search criteria.</p>
            <button
              className="btn-primary"
              onClick={() => {
                setActiveCategory('All');
                setSearchQuery('');
              }}
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="restaurant-grid">
            {filteredAndSortedRestaurants.map((restaurant) => {
              const isFav = favorites.has(restaurant.id);
              return (
                <article
                  key={restaurant.id}
                  className="restaurant-card"
                  onClick={() => navigate(`/restaurant/${restaurant.id}`)}
                >
                  <div className="card-media-wrap">
                    <img
                      src={restaurant.bannerImage}
                      alt={restaurant.name}
                      className="card-image"
                      loading="lazy"
                    />

                    {restaurant.isPromoted && (
                      <span className="badge-promoted">Featured</span>
                    )}

                    {restaurant.discountText && (
                      <span className="badge-discount">
                        <BadgePercent size={13} /> {restaurant.discountText}
                      </span>
                    )}

                    <button
                      className={`btn-favorite ${isFav ? 'active' : ''}`}
                      onClick={(e) => toggleFavorite(e, restaurant.id)}
                      aria-label="Save to favorites"
                    >
                      <Heart size={18} fill={isFav ? '#FF4F18' : 'none'} color={isFav ? '#FF4F18' : '#ffffff'} />
                    </button>

                    <div className="delivery-eta-badge">
                      <Clock size={13} />
                      <span>{restaurant.deliveryTimeMinutes} min</span>
                    </div>
                  </div>

                  <div className="card-info">
                    <div className="card-header-row">
                      <h3 className="restaurant-name">{restaurant.name}</h3>
                      <div className="rating-badge">
                        <Star size={14} className="star-icon-filled" />
                        <span className="rating-num">{restaurant.rating}</span>
                        <span className="review-num">({restaurant.reviewCount})</span>
                      </div>
                    </div>

                    <p className="card-tagline">{restaurant.tagline}</p>

                    <div className="card-cuisines">
                      {restaurant.cuisine.map((c, idx) => (
                        <span key={idx} className="cuisine-tag">
                          {c}
                        </span>
                      ))}
                    </div>

                    <div className="card-footer-meta">
                      <div className="delivery-fee-meta">
                        <Bike size={14} />
                        <span>
                          {restaurant.deliveryFee === 0
                            ? 'Free Delivery'
                            : `$${restaurant.deliveryFee.toFixed(2)} delivery`}
                        </span>
                      </div>
                      <span className="dot-divider">•</span>
                      <span className="price-level">{restaurant.priceRange}</span>
                      <span className="dot-divider">•</span>
                      <span className="min-order">Min ${restaurant.minOrder.toFixed(0)}</span>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};

export default RestaurantList;
