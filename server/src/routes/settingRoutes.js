const express = require('express');
const router = express.Router();
const settingController = require('../controllers/settingController');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/', (req, res, next) => {
  // Pass user if present
  const jwt = require('jsonwebtoken');
  const prisma = require('../lib/prisma');
  let token = req.cookies?.token;
  if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_KEY || process.env.JWT_SECRET || 'secret');
      prisma.user.findUnique({ where: { id: decoded.id } }).then(u => {
        if (u) req.user = u;
        next();
      }).catch(() => next());
      return;
    } catch {}
  }
  next();
}, settingController.getSettings);

router.put('/', authenticate, authorize('SUPERADMIN'), settingController.updateSettings);

module.exports = router;
