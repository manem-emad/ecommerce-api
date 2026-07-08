const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const validate = require('../middleware/validate');
const authValidation = require('../validation/auth.validation');
const { protect } = require('../middleware/auth');

router.post('/send-register-otp', validate(authValidation.register), authController.sendRegisterOtp); 
router.post('/verify-register', validate(authValidation.verifyRegister), authController.verifyOtp);

router.post('/login', validate(authValidation.login), authController.login);
router.post('/forgot-password', validate(authValidation.forgotPassword), authController.sendForgotPasswordOtp);

// السطر المصحح:
router.post('/reset-password', validate(authValidation.resetPassword), authController.resetPassword);

router.post('/logout', protect, authController.logout);
router.get('/me', protect, authController.getMe);

module.exports = router;