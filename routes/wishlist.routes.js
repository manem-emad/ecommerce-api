const express = require('express');
const router = express.Router();
const wishlistController = require('../controllers/wishlist.controller');
const { protect } = require('../middleware/auth'); 

// حماية كل المسارات (كل العمليات محتاجة يوزر مسجل دخول)
router.use(protect);

// مسار جلب قائمة الـ Wishlist
router.get('/my', wishlistController.getMyWishlist);

// مسار إضافة منتج
router.post('/add/:productId', wishlistController.addToWishlist);

// مسار حذف منتج
router.delete('/remove/:productId', wishlistController.removeFromWishlist);

// مسار مسح القائمة بالكامل
router.delete('/clear', wishlistController.clearWishlist);

module.exports = router;