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
  const { token, user } = useAuthStore();

  useEffect(() => {
    if (!token || !user) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      return;
    }

    // Initialize single socket connection with Auth
    const newSocket = io(API_URL, {
      auth: { token },
      withCredentials: true,
      reconnectionAttempts: 5,
    });

    newSocket.on('connect', () => {
      console.log('[Socket] Connected');
      setIsConnected(true);
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

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [token, user?.id]); // Only reconnect if user ID or token changes

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};
