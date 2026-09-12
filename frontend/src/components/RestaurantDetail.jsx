import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Star,
  Clock,
  Bike,
  ArrowLeft,
  MapPin,
  Flame,
  Leaf,
  Wheat,
  Plus,
  Minus,
  Sparkles,
  Info,
  Check,
  AlertCircle,
} from 'lucide-react';
import { restaurantsApi } from '../services/api';
import { useCart } from '../context/CartContext';

const DIETARY_OPTIONS = ['All', 'Vegetarian', 'Vegan', 'Gluten-Free', 'Spicy'];

const RestaurantDetail = () => {
  const { id } = useParams();
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedDietary, setSelectedDietary] = useState('All');
  const [activeTab, setActiveTab] = useState('menu'); // 'menu' | 'info' | 'reviews'

  const {
    items: cartItems,
    addItem,
    updateQuantity,
    pendingItemConflict,
    confirmConflictReplacement,
    cancelConflictReplacement,
  } = useCart();

  useEffect(() => {
    let isMounted = true;
    const fetchDetail = async () => {
      setLoading(true);
      try {
        const data = await restaurantsApi.getById(id);
        if (isMounted) {
          setRestaurant(data);
          if (data?.categories?.length > 0) {
            setActiveCategory(data.categories[0]);
          }
        }
      } catch (err) {
        console.error('Error fetching restaurant detail', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchDetail();
    return () => {
      isMounted = false;
    };
  }, [id]);

  // Group and filter menu items
  const filteredMenu = useMemo(() => {
    if (!restaurant?.menu) return [];

    return restaurant.menu.filter((item) => {
      // Category filter
      const matchesCategory =
        activeCategory === 'All' ||
        activeCategory === 'Popular'
          ? (activeCategory === 'Popular' ? item.isPopular : true)
          : item.category.toLowerCase() === activeCategory.toLowerCase();

      // Dietary filter
      const matchesDietary =
        selectedDietary === 'All'
          ? true
          : item.dietary.some((d) => d.toLowerCase() === selectedDietary.toLowerCase());

      return matchesCategory && matchesDietary;
    });
  }, [restaurant, activeCategory, selectedDietary]);

  const getItemQuantityInCart = (itemId) => {
    const found = cartItems.find((i) => i.id === itemId);
    return found ? found.quantity : 0;
  };

  if (loading) {
    return (
      <div className="restaurant-detail-loading">
        <div className="skeleton-hero" />
        <div className="skeleton-container">
          <div className="skeleton-line lg" />
          <div className="skeleton-line md" />
          <div className="skeleton-grid" />
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="empty-restaurant-view">
        <h2>Restaurant not found</h2>
        <p>The culinary destination you are looking for is unavailable.</p>
        <Link to="/" className="btn-primary">
          Back to Restaurants
        </Link>
      </div>
    );
  }

  return (
    <div className="restaurant-detail-page">
      {/* Top Back Navigation Bar */}
      <div className="detail-nav-strip">
        <Link to="/" className="back-link">
          <ArrowLeft size={18} />
          <span>All Restaurants</span>
        </Link>
      </div>

      {/* Hero Banner Header */}
      <div className="restaurant-hero-header">
        <div className="hero-img-backdrop">
          <img
            src={restaurant.bannerImage}
            alt={restaurant.name}
            className="hero-header-img"
          />
          <div className="hero-gradient-overlay" />
        </div>

        <div className="restaurant-hero-card">
          <div className="hero-card-left">
            <img src={restaurant.logo} alt={restaurant.name} className="restaurant-avatar-logo" />
            <div className="hero-titles">
              <h1 className="detail-title">{restaurant.name}</h1>
              <p className="detail-tagline">{restaurant.tagline}</p>
              <div className="detail-address-row">
                <MapPin size={15} />
                <span>{restaurant.address}</span>
              </div>
            </div>
          </div>

          <div className="hero-card-badges">
            <div className="metric-box">
              <div className="metric-value rating">
                <Star size={16} className="star-icon-filled" />
                <span>{restaurant.rating}</span>
              </div>
              <span className="metric-label">{restaurant.reviewCount} reviews</span>
            </div>

            <div className="metric-box">
              <div className="metric-value">
                <Clock size={16} />
                <span>{restaurant.deliveryTimeMinutes}</span>
              </div>
              <span className="metric-label">Delivery (min)</span>
            </div>

            <div className="metric-box">
              <div className="metric-value">
                <Bike size={16} />
                <span>${restaurant.deliveryFee.toFixed(2)}</span>
              </div>
              <span className="metric-label">Delivery fee</span>
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Subnav Tabs */}
      <div className="detail-subtabs">
        <button
          className={`tab-btn ${activeTab === 'menu' ? 'active' : ''}`}
          onClick={() => setActiveTab('menu')}
        >
          Menu
        </button>
        <button
          className={`tab-btn ${activeTab === 'info' ? 'active' : ''}`}
          onClick={() => setActiveTab('info')}
        >
          About & Hours
        </button>
      </div>

      {activeTab === 'menu' && (
        <div className="menu-explorer-section">
          {/* Menu Categories Bar */}
          <div className="categories-sticky-bar">
            <div className="category-tabs-scroll">
              <button
                className={`cat-pill ${activeCategory === 'All' ? 'active' : ''}`}
                onClick={() => setActiveCategory('All')}
              >
                All Menu
              </button>
              {restaurant.categories?.map((cat) => (
                <button
                  key={cat}
                  className={`cat-pill ${activeCategory === cat ? 'active' : ''}`}
                  onClick={() => setActiveCategory(cat)}
                >
                  {cat === 'Popular' && <Sparkles size={14} className="sparkle-icon" />}
                  {cat}
                </button>
              ))}
            </div>

            {/* Dietary Filter Buttons */}
            <div className="dietary-filter-group">
              <span className="dietary-label">Dietary:</span>
              {DIETARY_OPTIONS.map((diet) => (
                <button
                  key={diet}
                  className={`diet-chip ${selectedDietary === diet ? 'active' : ''}`}
                  onClick={() => setSelectedDietary(diet)}
                >
                  {diet === 'Vegetarian' && <Leaf size={12} />}
                  {diet === 'Vegan' && <Leaf size={12} />}
                  {diet === 'Gluten-Free' && <Wheat size={12} />}
                  {diet === 'Spicy' && <Flame size={12} />}
                  {diet}
                </button>
              ))}
            </div>
          </div>

          {/* Menu Items Grid */}
          <div className="menu-items-container">
            <div className="menu-header-bar">
              <h2 className="current-category-title">
                {activeCategory} {selectedDietary !== 'All' ? `(${selectedDietary})` : ''}
              </h2>
              <span className="item-count-text">{filteredMenu.length} dishes</span>
            </div>

            {filteredMenu.length === 0 ? (
              <div className="no-menu-items">
                <Info size={32} />
                <p>No dishes match your selected category or dietary filter.</p>
                <button
                  className="btn-outline"
                  onClick={() => {
                    setActiveCategory('All');
                    setSelectedDietary('All');
                  }}
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="menu-items-grid">
                {filteredMenu.map((item) => {
                  const qtyInCart = getItemQuantityInCart(item.id);
                  return (
                    <div key={item.id} className="menu-item-card">
                      <div className="menu-item-info">
                        <div className="item-dietary-badges">
                          {item.isPopular && <span className="badge-pop">Popular</span>}
                          {item.dietary.map((d, i) => (
                            <span key={i} className="diet-pill">
                              {d === 'Vegetarian' && <Leaf size={11} />}
                              {d === 'Spicy' && <Flame size={11} />}
                              {d === 'Gluten-Free' && <Wheat size={11} />}
                              {d}
                            </span>
                          ))}
                        </div>

                        <h3 className="menu-item-name">{item.name}</h3>
                        <p className="menu-item-description">{item.description}</p>

                        <div className="menu-item-footer">
                          <div className="price-tag-group">
                            <span className="item-price">${item.price.toFixed(2)}</span>
                            {item.calories && (
                              <span className="item-calories">{item.calories} cal</span>
                            )}
                          </div>

                          {/* Add to Cart / Quantity Controller */}
                          {qtyInCart === 0 ? (
                            <button
                              className="btn-add-item"
                              onClick={() => addItem(item, restaurant)}
                              aria-label={`Add ${item.name} to cart`}
                            >
                              <Plus size={16} />
                              <span>Add</span>
                            </button>
                          ) : (
                            <div className="item-qty-stepper">
                              <button
                                className="stepper-btn"
                                onClick={() => updateQuantity(item.id, qtyInCart - 1)}
                                aria-label="Decrease quantity"
                              >
                                <Minus size={14} />
                              </button>
                              <span className="stepper-count">{qtyInCart}</span>
                              <button
                                className="stepper-btn"
                                onClick={() => updateQuantity(item.id, qtyInCart + 1)}
                                aria-label="Increase quantity"
                              >
                                <Plus size={14} />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {item.image && (
                        <div className="menu-item-media">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="item-photo"
                            loading="lazy"
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'info' && (
        <div className="restaurant-info-tab">
          <div className="info-card">
            <h3>Operating Hours & Location</h3>
            <p><strong>Address:</strong> {restaurant.address}</p>
            <p><strong>Monday - Sunday:</strong> 11:00 AM - 10:30 PM</p>
            <p><strong>Phone:</strong> +1 (415) 555-0199</p>
          </div>
          <div className="info-card">
            <h3>Sanitation & Safety Standards</h3>
            <p>✓ All staff pass daily health screenings.</p>
            <p>✓ Tamper-evident seals on all takeout packaging.</p>
            <p>✓ Contactless delivery supported.</p>
          </div>
        </div>
      )}

      {/* Cart Conflict Modal */}
      {pendingItemConflict && (
        <div className="modal-backdrop">
          <div className="modal-card conflict-dialog">
            <div className="conflict-icon-wrap">
              <AlertCircle size={32} className="warning-icon" />
            </div>
            <h3>Start a new order?</h3>
            <p>
              Your cart currently contains items from another restaurant. Creating an order from{' '}
              <strong>{pendingItemConflict.restaurant.name}</strong> will clear your current cart.
            </p>
            <div className="conflict-actions">
              <button className="btn-outline" onClick={cancelConflictReplacement}>
                Keep Existing Cart
              </button>
              <button className="btn-primary danger" onClick={confirmConflictReplacement}>
                Clear & Add New Item
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RestaurantDetail;
