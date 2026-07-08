const jwt = require('jsonwebtoken');
const User = require('../models/User.model');

const protect = async (req, res, next) => {
    try {
        let token;
        
        // التحقق من وجود التوكن في الـ Header
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return res.status(401).json({ success: false, message: 'You are not logged in.' });
        }

        // فك تشفير التوكن
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // التحقق من المستخدم (استخدمنا userId زي ما عملنا في generateToken)
        const currentUser = await User.findById(decoded.userId);
        if (!currentUser) {
            return res.status(401).json({ success: false, message: 'User no longer exists.' });
        }

        // إضافة بيانات المستخدم للـ req عشان نستخدمها في الـ Controller
        req.user = currentUser;
        next();
    } catch (error) {
        return res.status(401).json({ success: false, message: 'Invalid or expired token.' });
    }
};

module.exports = { protect };