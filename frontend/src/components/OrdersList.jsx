import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Clock, ArrowRight, CheckCircle2, ShoppingBag, RotateCcw } from 'lucide-react';
import { ordersApi } from '../services/api';
import { useCart } from '../context/CartContext';

const OrdersList = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addItem } = useCart();

  useEffect(() => {
    let isMounted = true;
    const fetchOrders = async () => {
      try {
        const list = await ordersApi.getUserOrders();
        if (isMounted) {
          // If empty, supply a demo order so users have immediate context
          if (list.length === 0) {
            const demo = await ordersApi.getById('ORD-782914');
            setOrders([demo]);
          } else {
            setOrders(list);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchOrders();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleReorder = (order) => {
    if (order.items && order.restaurant) {
      order.items.forEach((item) => {
        addItem(item, order.restaurant);
      });
    }
  };

  return (
    <div className="orders-history-page">
      <div className="orders-history-header">
        <h1>Your Orders & Receipts</h1>
        <p>Review past meal orders, track active deliveries, or reorder favorites with one click.</p>
      </div>

      {loading ? (
        <div className="orders-loading">Loading order records...</div>
      ) : orders.length === 0 ? (
        <div className="empty-orders-view">
          <ShoppingBag size={48} />
          <h3>No previous orders</h3>
          <p>You have not placed any orders yet.</p>
          <Link to="/" className="btn-primary">
            Explore Restaurants
          </Link>
        </div>
      ) : (
        <div className="orders-cards-list">
          {orders.map((ord) => (
            <div key={ord.id} className="order-history-card">
              <div className="ord-header-row">
                <div>
                  <h3 className="ord-restaurant-name">{ord.restaurant?.name || 'Restaurant Order'}</h3>
                  <span className="ord-date-meta">
                    {ord.createdAt ? new Date(ord.createdAt).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    }) : 'Recent Order'}
                  </span>
                </div>
                <div className="ord-status-pill">
                  <CheckCircle2 size={14} />
                  <span>{ord.status?.toUpperCase() || 'COMPLETED'}</span>
                </div>
              </div>

              <div className="ord-items-summary">
                {ord.items?.map((item, idx) => (
                  <span key={idx} className="ord-item-tag">
                    {item.quantity}x {item.name}
                  </span>
                ))}
              </div>

              <div className="ord-footer-row">
                <span className="ord-total-price">
                  Total: <strong>${ord.pricing?.total?.toFixed(2) || '0.00'}</strong>
                </span>

                <div className="ord-actions">
                  <button
                    className="btn-outline-sm"
                    onClick={() => handleReorder(ord)}
                    title="Add all items back to cart"
                  >
                    <RotateCcw size={14} />
                    <span>Reorder</span>
                  </button>

                  <Link to={`/order-tracking/${ord.id}`} className="btn-primary-sm">
                    <span>Track / Details</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrdersList;
