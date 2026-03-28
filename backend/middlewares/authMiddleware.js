import jwt from 'jsonwebtoken';

export const protect = (req, res, next) => {
  let token;

  // Check cookies first, then Authorization header
  if (req.cookies && req.cookies.jwt) {
    token = req.cookies.jwt;
  } else if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }

  try {
    if (!process.env.JWT_SECRET) {
      console.error('FATAL: JWT_SECRET is not defined');
      return res.status(500).json({ message: 'Internal server configuration error' });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Session expired or invalid token' });
  }
};

/**
 * Socket.io Authentication Middleware
 */
export const socketAuth = (socket, next) => {
  const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];

  if (!token) {
    return next(new Error('Authentication error: No token provided'));
  }

  try {
    if (!process.env.JWT_SECRET) {
      return next(new Error('Internal server configuration error'));
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.data.user = decoded;
    next();
  } catch (err) {
    next(new Error('Session expired or invalid token'));
  }
};

export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `Role ${req.user?.role} is not authorized to access this route` 
      });
    }
    next();
  };
};
