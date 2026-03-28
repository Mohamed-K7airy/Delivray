'use client';
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import io, { Socket } from 'socket.io-client';
import { API_URL } from '@/config/api';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
});

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }: { children: ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { token, user, _hasHydrated } = useAuthStore();
  const socketRef = React.useRef<Socket | null>(null);

  useEffect(() => {
    if (!_hasHydrated) return; // Wait for hydration before initiating
    if (!token || !user) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setSocket(null);
        setIsConnected(false);
      }
      return;
    }

    // 1. Cleanup existing socket if any before creating new one
    if (socketRef.current) {
      console.log('[Socket] Cleaning up previous connection before reconnecting...');
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    // 2. Initialize new socket connection with Auth
    const newSocket = io(API_URL, {
      auth: { token },
      withCredentials: true,
      reconnectionAttempts: 5,
      transports: ['websocket', 'polling'], // Ensure compatibility
    });

    socketRef.current = newSocket;

    newSocket.on('connect', () => {
      console.log('[Socket] Connected');
      setIsConnected(true);
      setSocket(newSocket);
      // Automatically join personal room if needed
      newSocket.emit('join', { role: user.role, id: user.id });
    });

    newSocket.on('disconnect', () => {
      console.log('[Socket] Disconnected');
      setIsConnected(false);
    });

    newSocket.on('error', (err) => {
      console.error('[Socket] Error:', err.message);
      toast.error(`Connection Error: ${err.message}`);
    });

    newSocket.on('connect_error', (err) => {
      console.error('[Socket] Connect Error:', err.message);
      if (err.message === 'Authentication error: Invalid token') {
         useAuthStore.getState().logout();
      }
    });

    newSocket.on('order_status_updated', (data) => {
      console.log('[Socket] Order Update:', data);
      import('@/lib/audio').then(m => m.playNotificationSound());
      toast.info(`Order Protocol Updated: ${data.status?.replace(/_/g, ' ') || 'State Change'}`);
    });

    newSocket.on('new_order', (data) => {
      console.log('[Socket] New Order Alert:', data);
      import('@/lib/audio').then(m => m.playNotificationSound());
      toast.success('New Deployment Assignment Available!');
    });

    return () => {
      if (socketRef.current) {
        console.log('[Socket] Cleaning up connection on unmount/re-run');
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [token, user?.id]); // Re-run when auth changes

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};
