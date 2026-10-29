const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authenticate, authorize, optionalAuth } = require('../middleware/auth');

router.post('/', optionalAuth, orderController.createOrder);
router.get('/', authenticate, orderController.getOrders);
router.get('/:id', orderController.getOrderById);
router.put('/:id', authenticate, authorize('SUPERADMIN'), orderController.updateOrder);

module.exports = router;
