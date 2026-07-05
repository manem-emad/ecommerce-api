const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const validate = require('../middleware/validate');
const authValidation = require('../validation/auth.validation');
const { protect } = require('../middleware/auth');

// 1. مسارات التسجيل والتحقق بالـ OTP
router.post('/send-register-otp', validate(authValidation.register), authController.sendRegisterOtp); 

// ربط المسار بالـ Schema المحدثة لتمرير الـ OTP بأمان
router.post('/verify-register', validate(authValidation.verifyRegister), authController.verifyOtp);

// 2. مسارات تسجيل الدخول واستعادة الحساب
router.post('/login', validate(authValidation.login), authController.login);
router.post('/forgot-password', validate(authValidation.forgotPassword), authController.sendForgotPasswordOtp);
router.post('/reset-password', validate(authValidation.resetPassword), authController.verifyForgotPasswordOtp);

// 3. مسارات الحماية وتسجيل الخروج
router.post('/logout', protect, authController.logout);
router.get('/me', protect, authController.getMe);

module.exports = router;