const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const validate = require('../middleware/validate');
const authValidation = require('../validation/auth.validation');
const { protect } = require('../middleware/auth');

router.post('/send-register-otp', validate(authValidation.register), authController.sendRegisterOtp); 

// تعديل هنا: رجعنا الـ validate وشلنا الميدل وير المؤقتة
router.post('/verify-register', validate(authValidation.verifyOtp), authController.verifyOtp);

router.post('/login', validate(authValidation.login), authController.login);
router.post('/forgot-password', validate(authValidation.forgotPassword), authController.sendForgotPasswordOtp);
router.post('/reset-password', validate(authValidation.resetPassword), authController.resetPassword);
router.post('/logout', protect, authController.logout);
router.get('/me', protect, authController.getMe);

module.exports = router;