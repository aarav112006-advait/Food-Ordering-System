import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
  MessageSquare,
  Bike,
  ShieldCheck,
  Star,
  Receipt,
  Utensils,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Car,
  Home,
  Navigation,
  RefreshCw,
} from 'lucide-react';
import socketService from '../services/socket';
import { ordersApi } from '../services/api';
import ReviewModal from './ReviewModal';

const STAGES = [
  { key: 'confirmed', label: 'Order Confirmed', icon: CheckCircle2, desc: 'Restaurant accepted your order' },
  { key: 'preparing', label: 'In The Kitchen', icon: Utensils, desc: 'Chefs are crafting your hot meal' },
  { key: 'out_for_delivery', label: 'Out for Delivery', icon: Bike, desc: 'Courier picked up your food' },
  { key: 'delivered', label: 'Delivered', icon: Home, desc: 'Enjoy your hot meal!' },
];

const OrderTracker = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('preparing');
  const [etaMinutes, setEtaMinutes] = useState(24);
  const [driverLocation, setDriverLocation] = useState({
    lat: 37.7850,
    lng: -122.4100,
    heading: 200,
    speedMph: 24,
  });
  const [statusNote, setStatusNote] = useState('The restaurant is preparing your order with fresh ingredients.');
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [chatMessageInput, setChatMessageInput] = useState('');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatHistory, setChatHistory] = useState([
    { from: 'driver', text: "Hi! I've picked up your order and I'm en route. ETA is about 20 mins." },
  ]);

  // Load Order Data
  useEffect(() => {
    let isMounted = true;
    const fetchOrder = async () => {
      setLoading(true);
      try {
        const data = await ordersApi.getById(orderId);
        if (isMounted && data) {
          setOrder(data);
          if (data.status) setStatus(data.status);
          if (data.etaMinutes) setEtaMinutes(data.etaMinutes);
        }
      } catch (err) {
        console.error('Failed to load order', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchOrder();
    return () => {
      isMounted = false;
    };
  }, [orderId]);

  // WebSocket / Real-time tracking subscription + Fallback Simulation
  useEffect(() => {
    socketService.connect();
    socketService.joinOrder(orderId);

    const unsubStatus = socketService.onOrderStatus((data) => {
      if (data.status) setStatus(data.status);
      if (data.note) setStatusNote(data.note);
    });

    const unsubLoc = socketService.onDriverLocation((loc) => {
      setDriverLocation(loc);
    });

    // Start simulation fallback so progress bar & map driver animate live
    socketService.startSimulatedTracking(orderId, {
      onStatus: (st) => {
        setStatus(st.status);
        if (st.note) setStatusNote(st.note);
      },
      onLocation: (loc) => {
        setDriverLocation(loc);
      },
      onEta: (remaining) => {
        setEtaMinutes(remaining);
      },
    });

    return () => {
      unsubStatus();
      unsubLoc();
      socketService.leaveOrder(orderId);
    };
  }, [orderId]);

  // Stage progress index (0 to 3)
  const currentStageIndex = useMemo(() => {
    if (status === 'confirmed') return 0;
    if (status === 'preparing') return 1;
    if (status === 'out_for_delivery' || status === 'approaching') return 2;
    if (status === 'delivered') return 3;
    return 1;
  }, [status]);

  // Estimated Arrival time clock string
  const arrivalTimeStr = useMemo(() => {
    const d = new Date();
    d.setMinutes(d.getMinutes() + etaMinutes);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }, [etaMinutes]);

  // Quick manual stage switcher for testing
  const handleSimulateStage = (newStage) => {
    setStatus(newStage);
    if (newStage === 'confirmed') setEtaMinutes(35);
    if (newStage === 'preparing') setEtaMinutes(24);
    if (newStage === 'out_for_delivery') setEtaMinutes(12);
    if (newStage === 'delivered') setEtaMinutes(0);
  };

  const handleSendChat = (e) => {
    e.preventDefault();
    if (!chatMessageInput.trim()) return;
    setChatHistory((prev) => [...prev, { from: 'user', text: chatMessageInput.trim() }]);
    setChatMessageInput('');
    setTimeout(() => {
      setChatHistory((prev) => [
        ...prev,
        { from: 'driver', text: "Got it! Thanks for letting me know." },
      ]);
    }, 1000);
  };

  if (loading && !order) {
    return (
      <div className="tracker-loading-screen">
        <RefreshCw size={36} className="spinner-rotate" />
        <p>Connecting to live tracking satellite...</p>
      </div>
    );
  }

  // Fallback defaults if order is newly created
  const restaurant = order?.restaurant || {
    name: 'Artisan Wood-Fired Pizza Co.',
    address: '412 Columbus Ave, North Beach',
  };
  const driver = order?.driver || {
    name: 'Marcus Vance',
    photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    rating: 4.94,
    totalDeliveries: '2,430+',
    vehicle: 'Toyota Prius (Hybrid) • Silver',
    licensePlate: '7XYZ892',
    phone: '+1 (415) 555-0199',
  };
  const deliveryAddress = order?.deliveryAddress || '1240 Mission Street, Apt 5B, San Francisco, CA';

  // Driver route map percentage along trajectory
  const routePercent = Math.min(100, Math.max(5, (currentStageIndex / 3) * 100));

  return (
    <div className="order-tracker-page">
      {/* Top Banner with Order ID & Status */}
      <div className="tracker-header">
        <div className="tracker-header-info">
          <span className="order-number-tag">Order #{orderId}</span>
          <h1 className="tracker-status-heading">
            {status === 'delivered'
              ? 'Order Delivered!'
              : status === 'out_for_delivery'
              ? 'Courier is on the way!'
              : status === 'preparing'
              ? 'Preparing your order...'
              : 'Order received by kitchen'}
          </h1>
          <p className="tracker-note">{statusNote}</p>
        </div>

        {/* Live ETA Card */}
        <div className="eta-badge-card">
          <div className="eta-icon-wrap">
            <Clock size={24} className="eta-clock-icon" />
          </div>
          <div className="eta-details">
            <span className="eta-label">Estimated Arrival</span>
            <span className="eta-time">
              {status === 'delivered' ? 'Completed' : `${etaMinutes} mins`}
            </span>
            {status !== 'delivered' && (
              <span className="eta-clock-target">Around {arrivalTimeStr}</span>
            )}
          </div>
        </div>
      </div>

      {/* Real-time Status Progress Bar */}
      <div className="tracker-progress-card">
        <div className="progress-track-bar">
          <div
            className="progress-fill-line"
            style={{ width: `${(currentStageIndex / (STAGES.length - 1)) * 100}%` }}
          />

          <div className="progress-nodes-row">
            {STAGES.map((stage, idx) => {
              const isCompleted = idx < currentStageIndex;
              const isCurrent = idx === currentStageIndex;
              const IconComponent = stage.icon;

              return (
                <div
                  key={stage.key}
                  className={`progress-node-item ${isCompleted ? 'completed' : ''} ${
                    isCurrent ? 'current' : ''
                  }`}
                >
                  <div className="node-icon-circle">
                    <IconComponent size={18} />
                  </div>
                  <div className="node-labels">
                    <span className="node-title">{stage.label}</span>
                    <span className="node-sub">{stage.desc}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Developer / Demo Simulator Switcher */}
        <div className="demo-simulator-toolbar">
          <span className="sim-label">Demo Simulator:</span>
          {STAGES.map((s) => (
            <button
              key={s.key}
              className={`sim-btn ${status === s.key ? 'active' : ''}`}
              onClick={() => handleSimulateStage(s.key)}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Live Vector Map & Courier Info */}
      <div className="tracker-main-grid">
        {/* Left Column: Live Route Visualizer */}
        <div className="live-map-card">
          <div className="map-card-header">
            <div className="live-indicator">
              <span className="pulsing-radar-dot" />
              <span>LIVE GPS TELEMETRY</span>
            </div>
            <div className="driver-telemetry">
              <Navigation size={14} />
              <span>Speed: {status === 'delivered' ? '0' : `${driverLocation.speedMph || 22} mph`}</span>
            </div>
          </div>

          {/* Stylized Vector Route Canvas */}
          <div className="map-canvas-container">
            <svg
              className="map-vector-canvas"
              viewBox="0 0 700 320"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Map grid streets background pattern */}
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#E5E7EB" strokeWidth="1" />
                </pattern>
                <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#FF4F18" />
                  <stop offset="100%" stopColor="#10B981" />
                </linearGradient>
              </defs>

              <rect width="100%" height="100%" fill="#F9FAFB" />
              <rect width="100%" height="100%" fill="url(#grid)" opacity="0.6" />

              {/* Major arterial road paths */}
              <path d="M 0 160 Q 300 120 700 180" stroke="#E2E8F0" strokeWidth="20" strokeLinecap="round" />
              <path d="M 120 0 L 180 320" stroke="#E2E8F0" strokeWidth="14" />
              <path d="M 520 0 L 480 320" stroke="#E2E8F0" strokeWidth="14" />

              {/* Active Delivery Route curve */}
              <path
                id="deliveryPath"
                d="M 100 180 C 240 120, 360 220, 580 140"
                stroke="#CBD5E1"
                strokeWidth="8"
                strokeLinecap="round"
                fill="none"
              />

              {/* Highlighted Traversed Path */}
              <path
                d="M 100 180 C 240 120, 360 220, 580 140"
                stroke="url(#routeGradient)"
                strokeWidth="8"
                strokeDasharray="600"
                strokeDashoffset={600 - (600 * routePercent) / 100}
                strokeLinecap="round"
                fill="none"
              />

              {/* Origin Marker: Restaurant */}
              <g transform="translate(100, 180)">
                <circle r="22" fill="#FF4F18" opacity="0.2" />
                <circle r="14" fill="#FF4F18" />
                <Utensils x="-8" y="-8" size={16} color="#FFFFFF" />
                <text x="0" y="32" textAnchor="middle" fill="#374151" fontSize="11" fontWeight="600">
                  {restaurant.name.slice(0, 16)}...
                </text>
              </g>

              {/* Destination Marker: Customer Home */}
              <g transform="translate(580, 140)">
                <circle r="22" fill="#10B981" opacity="0.2" />
                <circle r="14" fill="#10B981" />
                <Home x="-8" y="-8" size={16} color="#FFFFFF" />
                <text x="0" y="32" textAnchor="middle" fill="#374151" fontSize="11" fontWeight="600">
                  Your Address
                </text>
              </g>

              {/* Moving Driver Vehicle Marker */}
              {status !== 'delivered' ? (
                <g
                  transform={`translate(${100 + (480 * routePercent) / 100}, ${
                    180 - Math.sin((routePercent / 100) * Math.PI) * 40
                  })`}
                  className="moving-driver-group"
                >
                  <circle r="26" fill="#FF4F18" opacity="0.25" className="driver-pulse-ring" />
                  <circle r="16" fill="#1E293B" stroke="#FFFFFF" strokeWidth="3" />
                  <Car x="-8" y="-8" size={16} color="#FFFFFF" />
                </g>
              ) : null}
            </svg>

            <div className="map-bottom-overlay">
              <div className="map-point">
                <span className="point-dot restaurant" />
                <span>Pickup: {restaurant.name}</span>
              </div>
              <div className="map-point">
                <span className="point-dot destination" />
                <span>Drop-off: {deliveryAddress}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Driver Card & Actions */}
        <div className="tracker-sidebar-column">
          {/* Driver Profile Card */}
          <div className="courier-card">
            <div className="courier-card-header">
              <img src={driver.photo} alt={driver.name} className="driver-avatar" />
              <div className="driver-info-meta">
                <div className="driver-name-row">
                  <h3 className="driver-name">{driver.name}</h3>
                  <div className="driver-rating-badge">
                    <Star size={13} className="star-icon-filled" />
                    <span>{driver.rating}</span>
                  </div>
                </div>
                <p className="driver-vehicle">{driver.vehicle}</p>
                <div className="driver-plate-tag">Plate: {driver.licensePlate}</div>
              </div>
            </div>

            <div className="courier-contact-actions">
              <a href={`tel:${driver.phone}`} className="btn-driver-action call">
                <Phone size={16} />
                <span>Call Courier</span>
              </a>
              <button
                type="button"
                className="btn-driver-action chat"
                onClick={() => setIsChatOpen((prev) => !prev)}
              >
                <MessageSquare size={16} />
                <span>Message</span>
              </button>
            </div>

            {/* Quick Chat Messenger Accordion */}
            {isChatOpen && (
              <div className="driver-chat-box">
                <div className="chat-messages-area">
                  {chatHistory.map((m, i) => (
                    <div key={i} className={`chat-bubble ${m.from}`}>
                      {m.text}
                    </div>
                  ))}
                </div>
                <form onSubmit={handleSendChat} className="chat-input-form">
                  <input
                    type="text"
                    value={chatMessageInput}
                    onChange={(e) => setChatMessageInput(e.target.value)}
                    placeholder="Send note to driver..."
                    className="chat-field"
                  />
                  <button type="submit" className="chat-submit-btn">
                    Send
                  </button>
                </form>
              </div>
            )}
          </div>

          {/* If delivered, Rate & Review banner */}
          {status === 'delivered' && (
            <div className="delivered-review-prompt">
              <Sparkles size={24} className="sparkle-prompt-icon" />
              <h3>How was everything?</h3>
              <p>Your driver and {restaurant.name} would love your feedback!</p>
              <button className="btn-primary" onClick={() => setIsReviewOpen(true)}>
                Leave a Review
              </button>
            </div>
          )}

          {/* Receipt & Order Details Accordion */}
          <div className="receipt-accordion-card">
            <button
              className="receipt-toggle-btn"
              onClick={() => setIsReceiptOpen((prev) => !prev)}
            >
              <div className="toggle-left">
                <Receipt size={18} />
                <span>Order Summary & Receipt</span>
              </div>
              {isReceiptOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>

            {isReceiptOpen && (
              <div className="receipt-dropdown-content">
                <div className="receipt-items-list">
                  {order?.items?.map((item, idx) => (
                    <div key={idx} className="receipt-item-line">
                      <span>
                        {item.quantity}x {item.name}
                      </span>
                      <span>${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <div className="receipt-divider" />

                <div className="receipt-costs">
                  <div className="rc-line">
                    <span>Subtotal</span>
                    <span>${order?.pricing?.subtotal?.toFixed(2) || '49.00'}</span>
                  </div>
                  <div className="rc-line">
                    <span>Delivery</span>
                    <span>${order?.pricing?.deliveryFee?.toFixed(2) || '1.99'}</span>
                  </div>
                  <div className="rc-line">
                    <span>Taxes & Fees</span>
                    <span>${order?.pricing?.tax?.toFixed(2) || '4.16'}</span>
                  </div>
                  {order?.pricing?.tip > 0 && (
                    <div className="rc-line">
                      <span>Courier Tip</span>
                      <span>${order?.pricing?.tip?.toFixed(2) || '5.00'}</span>
                    </div>
                  )}
                  <div className="rc-line total">
                    <span>Total Paid</span>
                    <span>${order?.pricing?.total?.toFixed(2) || '60.15'}</span>
                  </div>
                </div>

                <div className="receipt-footer-meta">
                  <p>
                    <strong>Payment:</strong> {order?.paymentMethod || 'Stripe Card (•••• 4242)'}
                  </p>
                  <p>
                    <strong>Delivered To:</strong> {deliveryAddress}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Review Modal Trigger */}
      <ReviewModal
        isOpen={isReviewOpen}
        onClose={() => setIsReviewOpen(false)}
        order={order}
        restaurantName={restaurant.name}
      />
    </div>
  );
};

export default OrderTracker;
