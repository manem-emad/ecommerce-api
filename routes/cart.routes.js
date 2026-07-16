const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cart.controller');

// استدعاء الـ middleware باسمه الصح اللي موجود في ملفك (protect)
const { protect } = require('../middleware/auth'); 

// حماية كل المسارات اللي تحت
router.use(protect); 

// مسار جلب الكارد
router.get('/', cartController.getCart);

// مسارات المنتجات
router.post('/items', cartController.addToCart);
router.patch('/items', cartController.updateQuantity);
router.delete('/items/:productId', cartController.removeItem);

// مسارات الكوبونات
router.post('/coupon', cartController.applyCoupon);

// مسار مسح الكارد بالكامل
router.delete('/clear', cartController.clearCart);

module.exports = router;