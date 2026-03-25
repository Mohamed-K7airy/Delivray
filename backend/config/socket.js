import { Server } from 'socket.io';

let io;

export const initIo = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      methods: ['GET', 'POST', 'PATCH', 'DELETE', 'PUT', 'OPTIONS'],
      credentials: true,
    }
  });
  return io;
};

export const getIo = () => {
  if (!io) {
    // console.warn('Socket.io not initialized!');
  }
  return io;
};
