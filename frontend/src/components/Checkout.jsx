import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  MapPin,
  Clock,
  CreditCard,
  Lock,
  CheckCircle2,
  DollarSign,
  ShieldCheck,
  Building,
  Sparkles,
  AlertCircle,
  Truck,
  PlusCircle,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { ordersApi } from '../services/api';

const Checkout = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    items,
    restaurant,
    subtotal,
    deliveryFee,
    tax,
    serviceFee,
    tipAmount,
    appliedDiscount,
    total,
    clearCart,
  } = useCart();

  // Delivery state
  const [selectedAddressId, setSelectedAddressId] = useState(
    user?.savedAddresses?.[0]?.id || 'custom'
  );
  const [customAddress, setCustomAddress] = useState('');
  const [deliveryInstructions, setDeliveryInstructions] = useState('Leave at door, contactless delivery.');
  const [deliverySpeed, setDeliverySpeed] = useState('standard'); // 'standard' | 'priority'

  // Payment State
  const [paymentMethod, setPaymentMethod] = useState('stripe'); // 'stripe' | 'wallet' | 'cash'
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvc, setCardCvc] = useState('382');
  const [cardPostal, setCardPostal] = useState('94103');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorNotice, setErrorNotice] = useState(null);

  if (items.length === 0) {
    return (
      <div className="checkout-empty-view">
        <div className="empty-box">
          <Truck size={48} className="empty-truck" />
          <h2>Your cart is currently empty</h2>
          <p>You need items in your cart before proceeding to checkout.</p>
          <Link to="/" className="btn-primary">
            Explore Restaurants
          </Link>
        </div>
      </div>
    );
  }

  const getResolvedAddress = () => {
    if (selectedAddressId !== 'custom') {
      const found = user?.savedAddresses?.find((a) => a.id === selectedAddressId);
      if (found) return found.address;
    }
    return customAddress || '1240 Mission Street, Apt 5B, San Francisco, CA';
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    setErrorNotice(null);

    try {
      const orderPayload = {
        restaurant: {
          id: restaurant?.id,
          name: restaurant?.name,
          address: restaurant?.address,
        },
        items: items.map((i) => ({
          id: i.id,
          name: i.name,
          price: i.price,
          quantity: i.quantity,
        })),
        pricing: {
          subtotal,
          deliveryFee: deliverySpeed === 'priority' ? deliveryFee + 2.49 : deliveryFee,
          tax,
          serviceFee,
          tip: tipAmount,
          discount: appliedDiscount,
          total: deliverySpeed === 'priority' ? total + 2.49 : total,
        },
        deliveryAddress: getResolvedAddress(),
        deliveryInstructions,
        deliverySpeed,
        paymentMethod:
          paymentMethod === 'stripe'
            ? `Credit Card (Stripe •••• ${cardNumber.slice(-4)})`
            : paymentMethod === 'wallet'
            ? 'Apple Pay / Digital Wallet'
            : 'Cash on Delivery',
        contact: {
          name: user?.name || 'Aarav Patel',
          email: user?.email || 'aarav112006@gmail.com',
          phone: user?.phone || '+91 6351170031',
        },
      };

      // Call API (falls back to mock order with tracking simulation)
      const createdOrder = await ordersApi.create(orderPayload);

      // Clear cart
      clearCart();

      // Navigate to order tracker
      navigate(`/order-tracking/${createdOrder.id}`);
    } catch (err) {
      console.error('Order creation failed:', err);
      setErrorNotice(err.message || 'Failed to process payment. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="checkout-page-container">
      {/* Top Header */}
      <div className="checkout-header-strip">
        <Link to={`/restaurant/${restaurant?.id || ''}`} className="checkout-back-btn">
          <ArrowLeft size={18} />
          <span>Back to Menu</span>
        </Link>
        <h1 className="checkout-page-title">Secure Checkout</h1>
        <div className="secure-badge">
          <ShieldCheck size={16} />
          <span>SSL 256-Bit Encrypted</span>
        </div>
      </div>

      {errorNotice && (
        <div className="checkout-error-banner">
          <AlertCircle size={18} />
          <span>{errorNotice}</span>
        </div>
      )}

      <div className="checkout-layout-grid">
        {/* Left Form Column */}
        <form onSubmit={handlePlaceOrder} className="checkout-form-column">
          {/* Step 1: Delivery Address */}
          <section className="checkout-step-card">
            <div className="step-header">
              <div className="step-icon">
                <MapPin size={20} />
              </div>
              <div>
                <h2 className="step-title">1. Delivery Location</h2>
                <p className="step-desc">Where should our courier deliver your meal?</p>
              </div>
            </div>

            <div className="saved-address-options">
              {user?.savedAddresses?.map((addr) => (
                <label
                  key={addr.id}
                  className={`address-option-label ${selectedAddressId === addr.id ? 'active' : ''}`}
                >
                  <input
                    type="radio"
                    name="addressChoice"
                    value={addr.id}
                    checked={selectedAddressId === addr.id}
                    onChange={() => setSelectedAddressId(addr.id)}
                  />
                  <div className="address-option-info">
                    <span className="addr-tag">{addr.label}</span>
                    <span className="addr-street-line">{addr.address}</span>
                  </div>
                </label>
              ))}

              <label
                className={`address-option-label ${selectedAddressId === 'custom' ? 'active' : ''}`}
              >
                <input
                  type="radio"
                  name="addressChoice"
                  value="custom"
                  checked={selectedAddressId === 'custom'}
                  onChange={() => setSelectedAddressId('custom')}
                />
                <div className="address-option-info">
                  <span className="addr-tag">Add New / Custom Location</span>
                  {selectedAddressId === 'custom' && (
                    <input
                      type="text"
                      className="custom-address-field"
                      placeholder="Street address, apartment, suite, city..."
                      value={customAddress}
                      onChange={(e) => setCustomAddress(e.target.value)}
                      required={selectedAddressId === 'custom'}
                    />
                  )}
                </div>
              </label>
            </div>

            {/* Delivery Instructions */}
            <div className="form-group-sub">
              <label className="input-sublabel">Delivery Instructions for Courier:</label>
              <input
                type="text"
                className="text-input-field"
                value={deliveryInstructions}
                onChange={(e) => setDeliveryInstructions(e.target.value)}
                placeholder="e.g. Ring Apt #5B, gate code 1234, leave at doorstep"
              />
            </div>
          </section>

          {/* Step 2: Delivery Speed */}
          <section className="checkout-step-card">
            <div className="step-header">
              <div className="step-icon">
                <Clock size={20} />
              </div>
              <div>
                <h2 className="step-title">2. Delivery Window</h2>
                <p className="step-desc">Choose your arrival preference</p>
              </div>
            </div>

            <div className="speed-selection-grid">
              <label className={`speed-card ${deliverySpeed === 'standard' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="deliverySpeed"
                  value="standard"
                  checked={deliverySpeed === 'standard'}
                  onChange={() => setDeliverySpeed('standard')}
                />
                <div className="speed-info">
                  <span className="speed-title">Standard Delivery</span>
                  <span className="speed-eta">25 - 35 mins</span>
                </div>
                <span className="speed-price">Included</span>
              </label>

              <label className={`speed-card ${deliverySpeed === 'priority' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="deliverySpeed"
                  value="priority"
                  checked={deliverySpeed === 'priority'}
                  onChange={() => setDeliverySpeed('priority')}
                />
                <div className="speed-info">
                  <div className="speed-title-wrap">
                    <span className="speed-title">Priority Direct</span>
                    <span className="priority-badge">Fastest</span>
                  </div>
                  <span className="speed-eta">15 - 22 mins</span>
                </div>
                <span className="speed-price">+$2.49</span>
              </label>
            </div>
          </section>

          {/* Step 3: Payment Selection & Stripe Flow */}
          <section className="checkout-step-card">
            <div className="step-header">
              <div className="step-icon">
                <CreditCard size={20} />
              </div>
              <div>
                <h2 className="step-title">3. Payment Details</h2>
                <p className="step-desc">Encrypted checkout powered by Stripe</p>
              </div>
            </div>

            {/* Payment Method Selector Tabs */}
            <div className="payment-method-selector">
              <button
                type="button"
                className={`pm-tab ${paymentMethod === 'stripe' ? 'active' : ''}`}
                onClick={() => setPaymentMethod('stripe')}
              >
                <CreditCard size={18} />
                <span>Credit / Debit</span>
              </button>

              <button
                type="button"
                className={`pm-tab ${paymentMethod === 'wallet' ? 'active' : ''}`}
                onClick={() => setPaymentMethod('wallet')}
              >
                <Sparkles size={18} />
                <span>Apple / Google Pay</span>
              </button>

              <button
                type="button"
                className={`pm-tab ${paymentMethod === 'cash' ? 'active' : ''}`}
                onClick={() => setPaymentMethod('cash')}
              >
                <DollarSign size={18} />
                <span>Cash on Delivery</span>
              </button>
            </div>

            {/* Stripe Card Element Simulation / Form */}
            {paymentMethod === 'stripe' && (
              <div className="stripe-element-box">
                <div className="stripe-badge-header">
                  <span className="stripe-powered-text">STRIPE SECURE CHECKOUT</span>
                  <Lock size={13} />
                </div>

                <div className="stripe-card-form">
                  <div className="form-row">
                    <label className="form-label">Card Number</label>
                    <div className="input-with-icon">
                      <CreditCard size={16} className="field-icon" />
                      <input
                        type="text"
                        className="stripe-input"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        placeholder="4242 4242 4242 4242"
                        required
                      />
                    </div>
                  </div>

                  <div className="form-columns-three">
                    <div>
                      <label className="form-label">Expires</label>
                      <input
                        type="text"
                        className="stripe-input"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        placeholder="MM/YY"
                        required
                      />
                    </div>
                    <div>
                      <label className="form-label">CVC</label>
                      <input
                        type="text"
                        className="stripe-input"
                        value={cardCvc}
                        onChange={(e) => setCardCvc(e.target.value)}
                        placeholder="CVC"
                        required
                      />
                    </div>
                    <div>
                      <label className="form-label">Postal Code</label>
                      <input
                        type="text"
                        className="stripe-input"
                        value={cardPostal}
                        onChange={(e) => setCardPostal(e.target.value)}
                        placeholder="ZIP"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {paymentMethod === 'wallet' && (
              <div className="wallet-express-box">
                <p>One-touch payment will be prompted through your device's biometric authentication.</p>
                <button type="button" className="btn-wallet-apple">
                  Pay with Pay / GPay
                </button>
              </div>
            )}

            {paymentMethod === 'cash' && (
              <div className="cash-notice-box">
                <p>Please keep exact change ready upon courier arrival. Our drivers carry limited change.</p>
              </div>
            )}
          </section>

          {/* Place Order CTA on mobile */}
          <button
            type="submit"
            className="btn-place-order-large"
            disabled={isProcessing}
          >
            {isProcessing ? (
              <span className="spinner-label">
                <span className="spinner-dot" /> Processing Payment...
              </span>
            ) : (
              <span>
                Pay ${(deliverySpeed === 'priority' ? total + 2.49 : total).toFixed(2)} & Place Order
              </span>
            )}
          </button>
        </form>

        {/* Right Order Summary Column */}
        <aside className="checkout-summary-column">
          <div className="summary-sticky-card">
            <h3 className="summary-title">Order Summary</h3>

            {restaurant && (
              <div className="summary-restaurant-info">
                <Building size={16} className="summary-rest-icon" />
                <div>
                  <h4 className="summary-rest-name">{restaurant.name}</h4>
                  <p className="summary-rest-address">{restaurant.address}</p>
                </div>
              </div>
            )}

            <div className="summary-items-list">
              {items.map((item) => (
                <div key={item.id} className="summary-item-row">
                  <div className="summary-item-info">
                    <span className="summary-item-qty">{item.quantity}x</span>
                    <span className="summary-item-name">{item.name}</span>
                  </div>
                  <span className="summary-item-price">
                    ${(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div className="summary-costs-breakdown">
              <div className="cost-row">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>

              <div className="cost-row">
                <span>Delivery Fee</span>
                <span>
                  {deliveryFee === 0 ? 'FREE' : `$${deliveryFee.toFixed(2)}`}
                  {deliverySpeed === 'priority' && ' + $2.49 (Priority)'}
                </span>
              </div>

              <div className="cost-row">
                <span>Estimated Taxes</span>
                <span>${tax.toFixed(2)}</span>
              </div>

              <div className="cost-row">
                <span>Service Fee</span>
                <span>${serviceFee.toFixed(2)}</span>
              </div>

              {tipAmount > 0 && (
                <div className="cost-row">
                  <span>Courier Tip</span>
                  <span>${tipAmount.toFixed(2)}</span>
                </div>
              )}

              {appliedDiscount > 0 && (
                <div className="cost-row promo-highlight">
                  <span>Discount</span>
                  <span>-${appliedDiscount.toFixed(2)}</span>
                </div>
              )}

              <div className="summary-divider" />

              <div className="cost-row total-highlight">
                <span>Total</span>
                <span>
                  ${(deliverySpeed === 'priority' ? total + 2.49 : total).toFixed(2)}
                </span>
              </div>
            </div>

            <div className="guarantee-footer">
              <ShieldCheck size={16} />
              <span>On-Time Arrival Guarantee or $5 credit to your account.</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Checkout;
