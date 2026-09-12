const { Server } = require('socket.io');

let io = null;

/**
 * Initialize Socket.io with HTTP server
 * @param {import('http').Server} server
 */
const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || '*',
      methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
      credentials: true
    }
  });

  io.on('connection', (socket) => {
    console.log(`[WebSocket] Client connected: ${socket.id}`);

    // Join a specific order tracking room
    socket.on('join_order', (orderId) => {
      if (!orderId) {
        return socket.emit('error_message', { message: 'orderId is required to join room' });
      }
      const room = `order:${orderId}`;
      socket.join(room);
      console.log(`[WebSocket] Socket ${socket.id} joined room ${room}`);
      socket.emit('joined_order', { orderId, room, timestamp: new Date().toISOString() });
    });

    // Leave a specific order tracking room
    socket.on('leave_order', (orderId) => {
      if (!orderId) return;
      const room = `order:${orderId}`;
      socket.leave(room);
      console.log(`[WebSocket] Socket ${socket.id} left room ${room}`);
      socket.emit('left_order', { orderId, room });
    });

    // Driver location update event sent from mobile app / driver client
    socket.on('driver_location_updated', (data) => {
      const { orderId, lat, lng, heading, speed } = data || {};
      if (!orderId || lat === undefined || lng === undefined) {
        return socket.emit('error_message', { message: 'Invalid driver location payload' });
      }

      const room = `order:${orderId}`;
      const payload = {
        orderId,
        location: {
          lat,
          lng,
          heading: heading || 0,
          speed: speed || 0,
          updatedAt: new Date().toISOString()
        }
      };

      // Broadcast to everyone in the order room except the sender
      socket.to(room).emit('driver_location_updated', payload);
      // Also acknowledge to driver
      socket.emit('driver_location_ack', { success: true, timestamp: payload.location.updatedAt });
    });

    // Socket disconnection
    socket.on('disconnect', (reason) => {
      console.log(`[WebSocket] Client disconnected: ${socket.id} (${reason})`);
    });
  });

  return io;
};

/**
 * Access the global io instance
 */
const getIO = () => {
  return io;
};

/**
 * Programmatically emit order status update to clients tracking the order
 * @param {string} orderId
 * @param {object} orderData
 */
const emitOrderStatusUpdated = (orderId, orderData) => {
  if (!io) {
    console.warn('[WebSocket Warning] Socket.io not initialized, cannot emit status update');
    return;
  }
  const room = `order:${orderId}`;
  io.to(room).emit('order_status_updated', {
    orderId,
    status: orderData.status,
    trackingTimeline: orderData.trackingTimeline,
    updatedAt: new Date().toISOString(),
    order: orderData
  });
  console.log(`[WebSocket] Emitted order_status_updated for room ${room}: ${orderData.status}`);
};

/**
 * Programmatically emit driver location update to clients tracking the order
 * @param {string} orderId
 * @param {object} locationData
 */
const emitDriverLocationUpdated = (orderId, locationData) => {
  if (!io) return;
  const room = `order:${orderId}`;
  io.to(room).emit('driver_location_updated', {
    orderId,
    location: locationData
  });
};

module.exports = {
  initSocket,
  getIO,
  emitOrderStatusUpdated,
  emitDriverLocationUpdated
};
