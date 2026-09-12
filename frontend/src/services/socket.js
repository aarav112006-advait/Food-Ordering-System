import { io } from 'socket.io-client';

const WS_URL = process.env.REACT_APP_WS_URL || 'http://localhost:5000';

class SocketService {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
    this.activeSimulations = new Map();
  }

  init() {
    if (this.socket) return this.socket;

    try {
      this.socket = io(WS_URL, {
        autoConnect: false,
        reconnection: true,
        reconnectionAttempts: 3,
        reconnectionDelay: 2000,
        transports: ['websocket', 'polling'],
      });

      this.socket.on('connect', () => {
        console.log('[Socket] Connected to server:', this.socket.id);
      });

      this.socket.on('disconnect', (reason) => {
        console.log('[Socket] Disconnected:', reason);
      });

      this.socket.on('connect_error', (err) => {
        console.warn('[Socket] Connection error (using simulation fallback):', err.message);
      });
    } catch (e) {
      console.warn('[Socket] Could not initialize socket.io client:', e.message);
    }

    return this.socket;
  }

  connect() {
    if (!this.socket) this.init();
    if (this.socket && !this.socket.connected) {
      this.socket.connect();
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
    }
    // Clean up simulations
    this.activeSimulations.forEach((timer) => clearInterval(timer));
    this.activeSimulations.clear();
  }

  joinOrder(orderId) {
    if (this.socket && this.socket.connected) {
      this.socket.emit('join_order', { orderId });
    }
  }

  leaveOrder(orderId) {
    if (this.socket && this.socket.connected) {
      this.socket.emit('leave_order', { orderId });
    }
    if (this.activeSimulations.has(orderId)) {
      clearInterval(this.activeSimulations.get(orderId));
      this.activeSimulations.delete(orderId);
    }
  }

  onOrderStatus(callback) {
    if (this.socket) {
      this.socket.on('order_status_update', callback);
    }
    return () => {
      if (this.socket) this.socket.off('order_status_update', callback);
    };
  }

  onDriverLocation(callback) {
    if (this.socket) {
      this.socket.on('driver_location_update', callback);
    }
    return () => {
      if (this.socket) this.socket.off('driver_location_update', callback);
    };
  }

  /**
   * Simulation fallback for offline demo / when websocket server is unreachable.
   * Simulates driver movement & order state progression every few seconds.
   */
  startSimulatedTracking(orderId, { onStatus, onLocation, onEta }) {
    if (this.activeSimulations.has(orderId)) return;

    let step = 0;
    const stages = [
      { status: 'confirmed', eta: 32, note: 'Order verified by restaurant.' },
      { status: 'preparing', eta: 24, note: 'Chef is preparing your fresh meal.' },
      { status: 'out_for_delivery', eta: 14, note: 'Driver Marcus has picked up your food.' },
      { status: 'approaching', eta: 4, note: 'Driver is arriving at your street!' },
      { status: 'delivered', eta: 0, note: 'Order delivered. Enjoy your meal!' },
    ];

    // Starting restaurant coords -> Destination customer coords
    const startLat = 37.7989;
    const startLng = -122.4075;
    const endLat = 37.7749;
    const endLng = -122.4194;

    const interval = setInterval(() => {
      step++;
      const progress = Math.min(step / 15, 1);

      // Interpolate driver position
      const currentLat = startLat + (endLat - startLat) * progress;
      const currentLng = startLng + (endLng - startLng) * progress;

      if (onLocation) {
        onLocation({
          orderId,
          lat: currentLat + (Math.random() - 0.5) * 0.0005,
          lng: currentLng + (Math.random() - 0.5) * 0.0005,
          heading: 210,
          speedMph: progress < 1 ? 22 : 0,
        });
      }

      // Stage transitions
      let currentStageIndex = 0;
      if (progress > 0.15 && progress <= 0.4) currentStageIndex = 1;
      else if (progress > 0.4 && progress <= 0.8) currentStageIndex = 2;
      else if (progress > 0.8 && progress < 1) currentStageIndex = 3;
      else if (progress >= 1) currentStageIndex = 4;

      const currentStage = stages[currentStageIndex];

      if (onStatus) {
        onStatus({
          orderId,
          status: currentStage.status,
          note: currentStage.note,
          timestamp: new Date().toISOString(),
        });
      }

      if (onEta) {
        const remainingEta = Math.max(0, Math.round(30 * (1 - progress)));
        onEta(remainingEta);
      }

      if (progress >= 1) {
        clearInterval(interval);
        this.activeSimulations.delete(orderId);
      }
    }, 3000);

    this.activeSimulations.set(orderId, interval);
  }
}

const socketService = new SocketService();
export default socketService;
