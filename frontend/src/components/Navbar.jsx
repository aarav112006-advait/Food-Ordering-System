import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  UtensilsCrossed,
  Search,
  ShoppingBag,
  MapPin,
  ChevronDown,
  User,
  Clock,
  LogOut,
  LogIn,
  X,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const Navbar = ({ onSearch }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const { itemCount, subtotal, toggleCart } = useCart();
  const [searchQuery, setSearchQuery] = useState('');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const profileMenuRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  const activeAddress =
    user?.savedAddresses?.find((a) => a.isDefault) || user?.savedAddresses?.[0] || {
      label: 'Deliver to',
      address: '1240 Mission St, San Francisco',
    };

  // Close profile dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchQuery);
    }
    if (location.pathname !== '/') {
      navigate(`/?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    if (onSearch) onSearch('');
  };

  return (
    <header className="navbar-container">
      <div className="navbar-content">
        {/* Brand Logo */}
        <Link to="/" className="navbar-logo" onClick={handleClearSearch}>
          <div className="logo-icon-wrapper">
            <UtensilsCrossed className="logo-icon" size={24} />
          </div>
          <div className="logo-text-group">
            <span className="logo-name">BiteFlow</span>
            <span className="logo-tag">FAST & FRESH</span>
          </div>
        </Link>

        {/* Location Selector */}
        <div
          className="location-pill"
          onClick={() => setIsAddressModalOpen(true)}
          title="Click to change delivery location"
        >
          <div className="location-pin-icon">
            <MapPin size={16} />
          </div>
          <div className="location-text">
            <span className="location-label">{activeAddress.label || 'Deliver to'}</span>
            <span className="location-address">{activeAddress.address}</span>
          </div>
          <ChevronDown size={14} className="location-chevron" />
        </div>

        {/* Search Bar */}
        <form className="navbar-search-form" onSubmit={handleSearchSubmit}>
          <Search className="search-icon" size={18} />
          <input
            type="text"
            className="search-input"
            placeholder="Search pizza, sushi, burgers, or restaurants..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              if (onSearch) onSearch(e.target.value);
            }}
          />
          {searchQuery && (
            <button
              type="button"
              className="search-clear-btn"
              onClick={handleClearSearch}
              aria-label="Clear search"
            >
              <X size={16} />
            </button>
          )}
        </form>

        {/* Action Controls: Live Tracking link, Cart, and Profile */}
        <div className="navbar-actions">
          {/* Quick Demo Live Tracking Link */}
          <Link
            to="/order-tracking/demo-101"
            className="nav-link-track"
            title="View Active Order Tracking Demo"
          >
            <Sparkles size={16} className="sparkle-icon" />
            <span className="track-text">Live Order</span>
          </Link>

          {/* Cart Button with Count Badge & Subtotal */}
          <button
            className={`cart-btn ${itemCount > 0 ? 'cart-btn-active' : ''}`}
            onClick={toggleCart}
            aria-label="Shopping Cart"
          >
            <div className="cart-icon-wrapper">
              <ShoppingBag size={20} />
              {itemCount > 0 && <span className="cart-badge">{itemCount}</span>}
            </div>
            <div className="cart-price-info">
              <span className="cart-label">Cart</span>
              <span className="cart-total">${subtotal.toFixed(2)}</span>
            </div>
          </button>

          {/* User Profile Menu */}
          <div className="profile-wrapper" ref={profileMenuRef}>
            <button
              className="profile-btn"
              onClick={() => setIsProfileOpen((prev) => !prev)}
              aria-expanded={isProfileOpen}
            >
              <div className="avatar-circle">
                {user?.name ? user.name.charAt(0).toUpperCase() : <User size={18} />}
              </div>
              <span className="profile-name">{user?.name || 'Account'}</span>
              <ChevronDown size={14} />
            </button>

            {isProfileOpen && (
              <div className="profile-dropdown-menu">
                <div className="dropdown-user-header">
                  <p className="dropdown-user-name">{user?.name || 'Guest Diner'}</p>
                  <p className="dropdown-user-email">{user?.email || 'guest@biteflow.com'}</p>
                </div>

                <div className="dropdown-divider" />

                <Link
                  to="/orders"
                  className="dropdown-item"
                  onClick={() => setIsProfileOpen(false)}
                >
                  <Clock size={16} />
                  <span>My Orders & Receipts</span>
                </Link>

                <div
                  className="dropdown-item"
                  onClick={() => {
                    setIsAddressModalOpen(true);
                    setIsProfileOpen(false);
                  }}
                >
                  <MapPin size={16} />
                  <span>Saved Addresses</span>
                </div>

                <div className="dropdown-divider" />

                {isAuthenticated ? (
                  <button
                    className="dropdown-item logout-btn"
                    onClick={() => {
                      logout();
                      setIsProfileOpen(false);
                    }}
                  >
                    <LogOut size={16} />
                    <span>Sign Out</span>
                  </button>
                ) : (
                  <button
                    className="dropdown-item login-btn"
                    onClick={() => {
                      navigate('/');
                      setIsProfileOpen(false);
                    }}
                  >
                    <LogIn size={16} />
                    <span>Sign In</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Address Switcher Modal */}
      {isAddressModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsAddressModalOpen(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Choose Delivery Location</h3>
              <button
                className="close-icon-btn"
                onClick={() => setIsAddressModalOpen(false)}
              >
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <p className="modal-subtitle">
                Select from your saved addresses or specify a new drop-off location:
              </p>
              <div className="address-list">
                {user?.savedAddresses?.map((addr) => (
                  <div
                    key={addr.id}
                    className={`address-choice-card ${addr.isDefault ? 'selected' : ''}`}
                    onClick={() => setIsAddressModalOpen(false)}
                  >
                    <MapPin size={18} className="addr-icon" />
                    <div className="addr-details">
                      <span className="addr-title">{addr.label}</span>
                      <span className="addr-street">{addr.address}</span>
                    </div>
                    {addr.isDefault && <span className="active-pill">Active</span>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
