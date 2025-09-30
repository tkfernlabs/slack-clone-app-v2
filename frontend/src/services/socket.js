import { io } from 'socket.io-client';

const WS_URL = import.meta.env.VITE_WS_URL;

class SocketService {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
  }

  connect(token) {
    if (this.socket?.connected) {
      return this.socket;
    }

    this.socket = io(WS_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    this.socket.on('connect', () => {
      console.log('Socket connected:', this.socket.id);
      if (token) {
        this.socket.emit('authenticate', token);
      }
    });

    this.socket.on('authenticated', (data) => {
      console.log('Socket authenticated:', data);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.listeners.clear();
    }
  }

  on(event, callback) {
    if (!this.socket) return;
    
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
    this.socket.on(event, callback);
  }

  off(event, callback) {
    if (!this.socket) return;
    
    if (callback) {
      this.socket.off(event, callback);
      const listeners = this.listeners.get(event);
      if (listeners) {
        const index = listeners.indexOf(callback);
        if (index > -1) {
          listeners.splice(index, 1);
        }
      }
    } else {
      this.socket.off(event);
      this.listeners.delete(event);
    }
  }

  emit(event, data) {
    if (this.socket?.connected) {
      this.socket.emit(event, data);
    }
  }

  joinChannel(channelId) {
    console.log('Joining channel:', channelId);
    this.emit('join_channel', channelId);
  }

  leaveChannel(channelId) {
    console.log('Leaving channel:', channelId);
    this.emit('leave_channel', channelId);
  }

  sendMessage(channelId, content, parentMessageId = null) {
    this.emit('send_message', { channelId, content, parentMessageId });
  }

  sendDirectMessage(recipientId, content) {
    this.emit('send_direct_message', { recipientId, content });
  }

  typing(channelId) {
    this.emit('typing', { channelId });
  }
}

export default new SocketService();

