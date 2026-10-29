const jwt = require('jsonwebtoken');
const prisma = require('../lib/prisma');

const authenticate = async (req, res, next) => {
  try {
    let token = req.cookies?.token;

    if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ success: false, error: 'Authentication required. Please login.' });
    }

    const jwtSecret = process.env.JWT_KEY || process.env.JWT_SECRET || 'secret';
    const decoded = jwt.verify(token, jwtSecret);
    const user = await prisma.user.findUnique({
      where: { id: decoded.id }
    });

    if (!user || user.status === 'inactive') {
      return res.status(401).json({ success: false, error: 'User not found or account is deactivated' });
    }

    const { password, ...safeUser } = user;
    req.user = safeUser;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, error: 'Invalid or expired session. Please login again.' });
  }
};

const optionalAuth = async (req, res, next) => {
  try {
    let token = req.cookies?.token;

    if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) return next();

    const jwtSecret = process.env.JWT_KEY || process.env.JWT_SECRET || 'secret';
    const decoded = jwt.verify(token, jwtSecret);
    const user = await prisma.user.findUnique({
      where: { id: decoded.id }
    });

    if (user && user.status !== 'inactive') {
      const { password, ...safeUser } = user;
      req.user = safeUser;
    }

    next();
  } catch {
    next();
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `Forbidden: Access requires one of these roles: ${roles.join(', ')}`
      });
    }
    next();
  };
};

module.exports = {
  authenticate,
  authorize,
  optionalAuth
};

