import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X,
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ArrowRight,
  Tag,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { useCart } from '../context/CartContext';

const TIP_OPTIONS = [10, 15, 20, 25];

const CartDrawer = () => {
  const {
    isCartOpen,
    closeCart,
    items,
    restaurant,
    updateQuantity,
    removeItem,
    clearCart,
    subtotal,
    itemCount,
    deliveryFee,
    tax,
    serviceFee,
    tipAmount,
    tipPercentage,
    setTipPercentage,
    customTip,
    setCustomTip,
    promoCode,
    setPromoCode,
    applyPromo,
    appliedDiscount,
    promoMessage,
    total,
  } = useCart();

  const [inputCode, setInputCode] = useState('');
  const [showCustomTipInput, setShowCustomTipInput] = useState(false);
  const navigate = useNavigate();

  if (!isCartOpen) return null;

  const handleApplyPromo = (e) => {
    e.preventDefault();
    if (!inputCode.trim()) return;
    applyPromo(inputCode);
  };

  const handleProceedToCheckout = () => {
    closeCart();
    navigate('/checkout');
  };

  return (
    <div className="cart-drawer-overlay" onClick={closeCart}>
      <aside
        className="cart-drawer-content"
        onClick={(e) => e.stopPropagation()}
        aria-label="Your Cart"
      >
        {/* Header */}
        <div className="drawer-header">
          <div className="drawer-header-left">
            <div className="drawer-cart-icon">
              <ShoppingBag size={20} />
            </div>
            <div>
              <h2 className="drawer-title">Your Order</h2>
              {restaurant && (
                <p className="drawer-restaurant-name">{restaurant.name}</p>
              )}
            </div>
          </div>
          <div className="drawer-header-right">
            {items.length > 0 && (
              <button
                className="btn-clear-cart"
                onClick={clearCart}
                title="Clear entire cart"
              >
                <Trash2 size={16} />
              </button>
            )}
            <button className="btn-close-drawer" onClick={closeCart} aria-label="Close cart">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content Area */}
        {items.length === 0 ? (
          <div className="drawer-empty-state">
            <div className="empty-cart-circle">
              <ShoppingBag size={42} className="empty-cart-icon" />
            </div>
            <h3>Your cart is empty</h3>
            <p>Looks like you haven't added any delicious meals yet. Check out popular restaurants nearby!</p>
            <button
              className="btn-primary"
              onClick={() => {
                closeCart();
                navigate('/');
              }}
            >
              Browse Restaurants
            </button>
          </div>
        ) : (
          <div className="drawer-scrollable-body">
            {/* Items List */}
            <div className="cart-items-section">
              <h3 className="section-title">Items ({itemCount})</h3>
              <div className="cart-items-list">
                {items.map((item) => (
                  <div key={item.id} className="cart-item-row">
                    {item.image && (
                      <img src={item.image} alt={item.name} className="cart-item-thumbnail" />
                    )}
                    <div className="cart-item-main">
                      <h4 className="cart-item-name">{item.name}</h4>
                      <div className="cart-item-pricing">
                        <span className="cart-item-unit-price">${item.price.toFixed(2)}</span>
                        <span className="cart-item-row-total">
                          ${(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    </div>

                    <div className="cart-item-stepper">
                      <button
                        className="stepper-sub-btn"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        aria-label="Decrease quantity"
                      >
                        {item.quantity === 1 ? <Trash2 size={13} /> : <Minus size={13} />}
                      </button>
                      <span className="stepper-number">{item.quantity}</span>
                      <button
                        className="stepper-add-btn"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        aria-label="Increase quantity"
                      >
                        <Plus size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Promo Code Box */}
            <div className="promo-box">
              <form onSubmit={handleApplyPromo} className="promo-form">
                <Tag size={16} className="promo-icon" />
                <input
                  type="text"
                  placeholder="Promo code (e.g. TASTY20)"
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value)}
                  className="promo-input"
                />
                <button type="submit" className="btn-apply-promo">
                  Apply
                </button>
              </form>
              {promoMessage && (
                <div className={`promo-alert ${promoMessage.type}`}>
                  {promoMessage.type === 'success' ? (
                    <CheckCircle2 size={14} />
                  ) : (
                    <AlertCircle size={14} />
                  )}
                  <span>{promoMessage.text}</span>
                </div>
              )}
            </div>

            {/* Tip Selection */}
            <div className="tip-section">
              <div className="tip-header">
                <span className="tip-title">Add Courier Tip</span>
                <span className="tip-amount-preview">${tipAmount.toFixed(2)}</span>
              </div>
              <p className="tip-sub">100% of the tip goes directly to your driver.</p>

              <div className="tip-pill-grid">
                {TIP_OPTIONS.map((pct) => (
                  <button
                    key={pct}
                    type="button"
                    className={`tip-pill ${customTip === null && tipPercentage === pct ? 'selected' : ''}`}
                    onClick={() => {
                      setCustomTip(null);
                      setTipPercentage(pct);
                      setShowCustomTipInput(false);
                    }}
                  >
                    {pct}% (${((subtotal * pct) / 100).toFixed(2)})
                  </button>
                ))}
                <button
                  type="button"
                  className={`tip-pill ${showCustomTipInput || customTip !== null ? 'selected' : ''}`}
                  onClick={() => setShowCustomTipInput((prev) => !prev)}
                >
                  Custom
                </button>
              </div>

              {showCustomTipInput && (
                <div className="custom-tip-input-wrap">
                  <span className="dollar-prefix">$</span>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    placeholder="Enter tip in $"
                    value={customTip !== null ? customTip : ''}
                    onChange={(e) => {
                      const val = e.target.value === '' ? null : Math.max(0, parseFloat(e.target.value) || 0);
                      setCustomTip(val);
                    }}
                    className="custom-tip-input"
                  />
                </div>
              )}
            </div>

            {/* Bill Summary Breakdown */}
            <div className="bill-breakdown-card">
              <div className="bill-row">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>

              <div className="bill-row">
                <span>
                  Delivery Fee
                  {subtotal > 35 && <span className="free-tag"> (Over $35 Free)</span>}
                </span>
                <span>{deliveryFee === 0 ? <span className="free-text">FREE</span> : `$${deliveryFee.toFixed(2)}`}</span>
              </div>

              <div className="bill-row">
                <span>Estimated Taxes (8.25%)</span>
                <span>${tax.toFixed(2)}</span>
              </div>

              <div className="bill-row">
                <span>Service Fee</span>
                <span>${serviceFee.toFixed(2)}</span>
              </div>

              {tipAmount > 0 && (
                <div className="bill-row">
                  <span>Courier Tip</span>
                  <span>${tipAmount.toFixed(2)}</span>
                </div>
              )}

              {appliedDiscount > 0 && (
                <div className="bill-row discount-row">
                  <span>Promotional Discount</span>
                  <span>-${appliedDiscount.toFixed(2)}</span>
                </div>
              )}

              <div className="drawer-divider" />

              <div className="bill-row grand-total-row">
                <span>Total Due</span>
                <span className="grand-total-amount">${total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Drawer Footer / Checkout CTA */}
        {items.length > 0 && (
          <div className="drawer-footer">
            <button className="btn-checkout-cta" onClick={handleProceedToCheckout}>
              <div className="checkout-btn-text">
                <span>Proceed to Checkout</span>
                <span className="checkout-sub">({itemCount} items)</span>
              </div>
              <div className="checkout-btn-price">
                <span>${total.toFixed(2)}</span>
                <ArrowRight size={18} />
              </div>
            </button>
          </div>
        )}
      </aside>
    </div>
  );
};

export default CartDrawer;
