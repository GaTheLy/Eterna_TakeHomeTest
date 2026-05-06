import { io, Socket } from 'socket.io-client';

class SocketService {
  private socket: Socket | null = null;
  private userId: string | null = null;
  private isConnecting: boolean = false;

  connect(userId: string) {
    // If already connected with same user, don't reconnect
    if (this.socket?.connected && this.userId === userId) {
      console.log('WebSocket already connected for user:', userId);
      return;
    }

    // If currently connecting, don't start another connection
    if (this.isConnecting) {
      console.log('WebSocket connection already in progress');
      return;
    }

    // Disconnect existing connection if different user
    if (this.socket && this.userId !== userId) {
      this.disconnect();
    }

    this.isConnecting = true;
    const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
    
    console.log('Connecting WebSocket for user:', userId);
    
    this.socket = io(apiUrl, {
      query: { userId },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      timeout: 10000,
    });

    this.userId = userId;

    this.socket.on('connect', () => {
      this.isConnecting = false;
      console.log('WebSocket connected:', this.socket?.id);
    });

    this.socket.on('disconnect', (reason) => {
      this.isConnecting = false;
      console.log('WebSocket disconnected:', reason);
    });

    this.socket.on('connect_error', (error) => {
      this.isConnecting = false;
      console.error('WebSocket connection error:', error.message);
    });
  }

  disconnect() {
    if (this.socket) {
      console.log('Disconnecting WebSocket');
      this.socket.disconnect();
      this.socket = null;
      this.userId = null;
      this.isConnecting = false;
    }
  }

  on(event: string, callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  off(event: string, callback?: (data: any) => void) {
    if (this.socket) {
      if (callback) {
        this.socket.off(event, callback);
      } else {
        this.socket.off(event);
      }
    }
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

export const socketService = new SocketService();
export default socketService;

