const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');

router.post('/register', authController.register);
router.post('/send-partner-otp', authController.sendPartnerOTP);
router.post('/verify-partner-otp', authController.verifyPartnerOTP);
router.post('/send-login-otp', authController.sendLoginOTP);
router.post('/verify-login-otp', authController.verifyLoginOTP);
router.post('/login', authController.login);
router.get('/me', authenticate, authController.getMe);
router.put('/profile', authenticate, authController.updateProfile);
router.post('/logout', authController.logout);

module.exports = router;
