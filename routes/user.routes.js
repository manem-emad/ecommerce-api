const express = require('express');
const router = express.Router();

// 1. استدعاء كل شيء 
const { 
    updateUserProfile, 
    uploadUserAvatar 
} = require('../controllers/user.controller'); // ده الـ Controller بتاع اليوزر
const { protect } = require('../middleware/auth'); // الـ Auth Middleware
const { adminMiddleware } = require('../middleware/admin'); // الـ Admin Middleware
const { upload } = require('../middleware/cloudinary'); // الـ Cloudinary middleware

// 2. الروت الخاص باليوزر (تعديل البيانات)
// الـ protect هنا عشان يتأكد إنه يوزر مسجل
router.put('/update-profile', protect, updateUserProfile);

// 3. روت رفع الصورة (Cloudinary)
// هنا بنستخدم الـ upload middleware قبل الـ controller
router.post('/upload-avatar', protect, upload.single('image'), uploadUserAvatar);

router.get('/', protect, adminMiddleware, authController.getAllUsers);
// 4. روت خاص بالأدمن فقط
// هنا بنحط الـ protect (عشان يتأكد إنه مسجل) وبعدين الـ adminMiddleware (عشان يتأكد إنه أدمن)
router.get('/admin/dashboard', protect, adminMiddleware, (req, res) => {
    res.json({ message: "Welcome to Admin Dashboard" });
});

module.exports = router;