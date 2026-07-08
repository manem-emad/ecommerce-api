const express = require('express');
const router = express.Router();

// استدعاء الدوال الأساسية فقط الموجودة في الكنترولر
const { 
    updateUserProfile, 
    changePassword,
    getAllUsers 
} = require('../controllers/user.controller'); 

const { protect } = require('../middleware/auth'); 
const { adminMiddleware } = require('../middleware/admin'); 

// 1. الروت الخاص باليوزر (تعديل البيانات)
router.put('/update-profile', protect, updateUserProfile);

// 2. روت تغيير الباسورد
router.put('/change-password', protect, changePassword);

// 3. روت الأدمن (جلب كل المستخدمين)
router.get('/', protect, adminMiddleware, getAllUsers);

// 4. روت خاص بالأدمن (داشبورد)
router.get('/admin/dashboard', protect, adminMiddleware, (req, res) => {
    res.json({ message: "Welcome to Admin Dashboard" });
});

module.exports = router;