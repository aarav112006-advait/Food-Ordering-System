import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import RestaurantList from './components/RestaurantList';
import RestaurantDetail from './components/RestaurantDetail';
import CartDrawer from './components/CartDrawer';
import Checkout from './components/Checkout';
import OrderTracker from './components/OrderTracker';
import OrdersList from './components/OrdersList';
import { UtensilsCrossed, Heart, ShieldCheck, Sparkles, MapPin } from 'lucide-react';
import './App.css';

function AppContent() {
  const [globalSearch, setGlobalSearch] = useState('');

  return (
    <div className="app-layout">
      {/* Global Navigation Header */}
      <Navbar onSearch={(query) => setGlobalSearch(query)} />

      {/* Slide-out Cart Drawer */}
      <CartDrawer />

      {/* Main Routed Page Content */}
      <main className="main-content">
        <Routes>
          <Route path="/" element={<RestaurantList initialSearch={globalSearch} />} />
          <Route path="/restaurant/:id" element={<RestaurantDetail />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/order-tracking/:orderId" element={<OrderTracker />} />
          <Route path="/orders" element={<OrdersList />} />
        </Routes>
      </main>

      {/* Application Footer */}
      <footer className="app-footer">
        <div className="footer-container">
          <div className="footer-brand-column">
            <div className="footer-logo">
              <UtensilsCrossed className="footer-logo-icon" size={24} />
              <span className="footer-brand-name">BiteFlow</span>
            </div>
            <p className="footer-tagline">
              Connecting foodies with neighborhood kitchens through fast, reliable, and intelligent delivery.
            </p>
            <div className="footer-trust-badges">
              <div className="trust-badge">
                <ShieldCheck size={16} />
                <span>Stripe Verified</span>
              </div>
              <div className="trust-badge">
                <Sparkles size={16} />
                <span>AI Dish Matcher</span>
              </div>
            </div>
          </div>

          <div className="footer-links-group">
            <div className="footer-column">
              <h4>Explore</h4>
              <ul>
                <li><Link to="/">Top Restaurants</Link></li>
                <li><Link to="/?category=Pizza">Pizza & Italian</Link></li>
                <li><Link to="/?category=Sushi">Sushi & Asian</Link></li>
                <li><Link to="/?category=Healthy">Salads & Bowls</Link></li>
              </ul>
            </div>

            <div className="footer-column">
              <h4>Platform</h4>
              <ul>
                <li><Link to="/orders">Order History</Link></li>
                <li><Link to="/order-tracking/demo-101">Live GPS Simulator</Link></li>
                <li><Link to="/checkout">Checkout Flow</Link></li>
              </ul>
            </div>

            <div className="footer-column">
              <h4>Locations</h4>
              <ul>
                <li>San Francisco, CA</li>
                <li>Bhavnagar & Mumbai, India</li>
                <li>New York, NY</li>
                <li>Austin, TX</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="footer-bottom-bar">
          <p>© {new Date().getFullYear()} BiteFlow Online Food Ordering System. Built with React, Stripe & Socket.io.</p>
          <div className="footer-bottom-meta">
            <span>Fast • Fresh • Reliable</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <AppContent />
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
