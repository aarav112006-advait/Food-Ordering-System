import axios from 'axios';
import { MOCK_RESTAURANTS, MOCK_RECOMMENDATIONS, MOCK_DRIVER } from '../data/mockData';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach JWT Bearer Token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Global 401 handler & error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.dispatchEvent(new Event('auth:unauthorized'));
    }
    return Promise.reject(error);
  }
);

// Helper with fallback to mock data when backend is not running
const withFallback = async (requestFn, fallbackData) => {
  try {
    const res = await requestFn();
    return res.data;
  } catch (error) {
    // If server unreachable or error, use fallback mock
    console.warn('API call failed, serving local mock data:', error.message);
    if (typeof fallbackData === 'function') {
      return fallbackData();
    }
    return fallbackData;
  }
};

export const restaurantsApi = {
  getAll: (params = {}) =>
    withFallback(
      () => api.get('/restaurants', { params }),
      () => {
        let results = [...MOCK_RESTAURANTS];
        if (params.search) {
          const query = params.search.toLowerCase();
          results = results.filter(
            (r) =>
              r.name.toLowerCase().includes(query) ||
              r.cuisine.some((c) => c.toLowerCase().includes(query)) ||
              r.menu.some((m) => m.name.toLowerCase().includes(query))
          );
        }
        if (params.category && params.category !== 'All') {
          results = results.filter((r) =>
            r.cuisine.some((c) => c.toLowerCase() === params.category.toLowerCase())
          );
        }
        return results;
      }
    ),

  getById: (id) =>
    withFallback(
      () => api.get(`/restaurants/${id}`),
      () => MOCK_RESTAURANTS.find((r) => r.id === id) || MOCK_RESTAURANTS[0]
    ),
};

export const recommendationsApi = {
  get: () =>
    withFallback(
      () => api.get('/recommendations'),
      () => MOCK_RECOMMENDATIONS
    ),
};

export const ordersApi = {
  create: (orderData) =>
    withFallback(
      () => api.post('/orders', orderData),
      () => {
        const orderId = 'ORD-' + Math.floor(100000 + Math.random() * 900000);
        const order = {
          id: orderId,
          ...orderData,
          status: 'confirmed',
          createdAt: new Date().toISOString(),
          driver: MOCK_DRIVER,
          etaMinutes: 28,
        };
        const existingOrders = JSON.parse(localStorage.getItem('orders_history') || '[]');
        existingOrders.unshift(order);
        localStorage.setItem('orders_history', JSON.stringify(existingOrders));
        return order;
      }
    ),

  getById: (orderId) =>
    withFallback(
      () => api.get(`/orders/${orderId}`),
      () => {
        const existingOrders = JSON.parse(localStorage.getItem('orders_history') || '[]');
        const found = existingOrders.find((o) => o.id === orderId);
        if (found) return found;

        // Default simulated order for testing/demo
        return {
          id: orderId || 'ORD-782914',
          restaurant: {
            id: 'rest-1',
            name: 'Artisan Wood-Fired Pizza Co.',
            phone: '+1 (415) 555-0182',
            address: '412 Columbus Ave, North Beach',
          },
          items: [
            { id: 'pizza-1', name: 'Classic Margherita DOP', price: 18.5, quantity: 1 },
            { id: 'pizza-2', name: 'Diavola Calabrese', price: 21.0, quantity: 1 },
            { id: 'dessert-1', name: 'Espresso Tiramisu Classico', price: 9.5, quantity: 1 },
          ],
          pricing: {
            subtotal: 49.0,
            deliveryFee: 1.99,
            tax: 4.16,
            tip: 5.0,
            total: 60.15,
          },
          deliveryAddress: '1240 Mission Street, Apt 5B, San Francisco, CA',
          deliveryInstructions: 'Ring doorbell, leave with front desk if not answering',
          paymentMethod: 'Credit Card (•••• 4242)',
          status: 'preparing',
          createdAt: new Date().toISOString(),
          etaMinutes: 22,
          driver: MOCK_DRIVER,
        };
      }
    ),

  getUserOrders: () =>
    withFallback(
      () => api.get('/orders/my-orders'),
      () => JSON.parse(localStorage.getItem('orders_history') || '[]')
    ),
};

export const reviewsApi = {
  submit: (reviewData) =>
    withFallback(
      () => api.post('/reviews', reviewData),
      () => ({
        success: true,
        message: 'Thank you! Your review has been published.',
        review: { ...reviewData, id: 'rev-' + Date.now(), createdAt: new Date().toISOString() },
      })
    ),
};

export const authApi = {
  login: (credentials) =>
    withFallback(
      () => api.post('/auth/login', credentials),
      () => ({
        token: 'mock-jwt-token-' + Date.now(),
        user: {
          id: 'usr-1',
          name: credentials.email.split('@')[0] || 'Aarav Patel',
          email: credentials.email,
          phone: '+1 (555) 019-2834',
          savedAddresses: [
            { id: 'addr-1', label: 'Home', address: '1240 Mission Street, Apt 5B, San Francisco, CA' },
            { id: 'addr-2', label: 'Office', address: '500 Howard St, Floor 8, San Francisco, CA' },
          ],
        },
      })
    ),

  register: (userData) =>
    withFallback(
      () => api.post('/auth/register', userData),
      () => ({
        token: 'mock-jwt-token-' + Date.now(),
        user: {
          id: 'usr-' + Date.now(),
          name: userData.name,
          email: userData.email,
          phone: userData.phone || '+1 (555) 012-3456',
          savedAddresses: [
            { id: 'addr-1', label: 'Home', address: userData.address || '742 Evergreen Terrace' },
          ],
        },
      })
    ),

  me: () =>
    withFallback(
      () => api.get('/auth/me'),
      () => {
        const storedUser = localStorage.getItem('user');
        return storedUser
          ? JSON.parse(storedUser)
          : {
              id: 'usr-1',
              name: 'Aarav Patel',
              email: 'aarav112006@gmail.com',
              phone: '+91 6351170031',
              savedAddresses: [
                { id: 'addr-1', label: 'Home', address: '1240 Mission Street, Apt 5B, San Francisco, CA' },
                { id: 'addr-2', label: 'Office', address: '500 Howard St, Floor 8, San Francisco, CA' },
              ],
            };
      }
    ),
};

export default api;
