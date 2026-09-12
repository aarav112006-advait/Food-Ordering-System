import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState(() => {
    try {
      const saved = localStorage.getItem('cart_items');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [restaurant, setRestaurant] = useState(() => {
    try {
      const saved = localStorage.getItem('cart_restaurant');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [pendingItemConflict, setPendingItemConflict] = useState(null);
  const [tipPercentage, setTipPercentage] = useState(15);
  const [customTip, setCustomTip] = useState(null);
  const [promoCode, setPromoCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [promoMessage, setPromoMessage] = useState(null);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('cart_items', JSON.stringify(items));
    if (items.length === 0) {
      setRestaurant(null);
      localStorage.removeItem('cart_restaurant');
    }
  }, [items]);

  useEffect(() => {
    if (restaurant) {
      localStorage.setItem('cart_restaurant', JSON.stringify(restaurant));
    } else {
      localStorage.removeItem('cart_restaurant');
    }
  }, [restaurant]);

  // Add Item to Cart
  const addItem = (item, restInfo) => {
    // If cart has items from a different restaurant
    if (restaurant && restInfo && restaurant.id !== restInfo.id && items.length > 0) {
      setPendingItemConflict({ item, restaurant: restInfo });
      return false;
    }

    if (!restaurant && restInfo) {
      setRestaurant(restInfo);
    }

    setItems((prevItems) => {
      const existingIndex = prevItems.findIndex((i) => i.id === item.id);
      if (existingIndex > -1) {
        const updated = [...prevItems];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + (item.quantity || 1),
        };
        return updated;
      } else {
        return [
          ...prevItems,
          {
            ...item,
            quantity: item.quantity || 1,
            restaurantId: restInfo ? restInfo.id : restaurant?.id,
          },
        ];
      }
    });

    setIsCartOpen(true);
    return true;
  };

  const confirmConflictReplacement = () => {
    if (pendingItemConflict) {
      setRestaurant(pendingItemConflict.restaurant);
      setItems([
        {
          ...pendingItemConflict.item,
          quantity: pendingItemConflict.item.quantity || 1,
          restaurantId: pendingItemConflict.restaurant.id,
        },
      ]);
      setPendingItemConflict(null);
      setIsCartOpen(true);
    }
  };

  const cancelConflictReplacement = () => {
    setPendingItemConflict(null);
  };

  // Remove Item
  const removeItem = (itemId) => {
    setItems((prev) => prev.filter((i) => i.id !== itemId));
  };

  // Update Quantity
  const updateQuantity = (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      removeItem(itemId);
      return;
    }
    setItems((prev) =>
      prev.map((i) => (i.id === itemId ? { ...i, quantity: newQuantity } : i))
    );
  };

  // Clear Cart
  const clearCart = () => {
    setItems([]);
    setRestaurant(null);
    setAppliedDiscount(0);
    setPromoMessage(null);
    setPromoCode('');
  };

  // Promo Code Handler
  const applyPromo = (code) => {
    const clean = code.trim().toUpperCase();
    if (clean === 'TASTY20' || clean === 'SAVE20') {
      const discount = subtotal * 0.2;
      setAppliedDiscount(discount);
      setPromoMessage({ type: 'success', text: '20% OFF applied successfully!' });
      return true;
    } else if (clean === 'FREEDELIVERY') {
      const deliveryAmt = restaurant?.deliveryFee || 1.99;
      setAppliedDiscount(deliveryAmt);
      setPromoMessage({ type: 'success', text: 'Free Delivery applied!' });
      return true;
    } else {
      setPromoMessage({ type: 'error', text: 'Invalid promotional code' });
      return false;
    }
  };

  // Calculations
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const baseDeliveryFee = restaurant ? restaurant.deliveryFee : 1.99;
  const deliveryFee = subtotal > 35 ? 0 : baseDeliveryFee;
  const tax = Number((subtotal * 0.0825).toFixed(2)); // 8.25% sales tax
  const serviceFee = items.length > 0 ? 1.75 : 0;

  const tipAmount =
    customTip !== null
      ? Number(customTip)
      : Number(((subtotal * tipPercentage) / 100).toFixed(2));

  const total = Math.max(
    0,
    Number((subtotal + deliveryFee + tax + serviceFee + tipAmount - appliedDiscount).toFixed(2))
  );

  return (
    <CartContext.Provider
      value={{
        items,
        restaurant,
        isCartOpen,
        setIsCartOpen,
        openCart: () => setIsCartOpen(true),
        closeCart: () => setIsCartOpen(false),
        toggleCart: () => setIsCartOpen((prev) => !prev),
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        pendingItemConflict,
        confirmConflictReplacement,
        cancelConflictReplacement,
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
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
