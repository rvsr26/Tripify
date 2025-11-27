export const socketMiddleware = (io) => (req, res, next) => {
  req.io = io;
  next();
};

// Build verification patch on 11/27/2025, 10:44:00 AM
