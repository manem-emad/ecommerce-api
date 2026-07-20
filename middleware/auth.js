const jwt = require('jsonwebtoken');
const User = require('../models/User.model');
const AppError = require('../utils/appError'); 

const protect = async (req, res, next) => {
    try {
        let token;
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) return next(new AppError('You are not logged in.', 401));

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const currentUser = await User.findById(decoded.userId);
        if (!currentUser) return next(new AppError('User no longer exists.', 401));

        req.user = currentUser;
        next();
    } catch (error) {
        return next(new AppError('Invalid or expired token.', 401));
    }
};

// ضيف الدالة دي هنا
const restrictTo = (...roles) => {
    return (req, res, next) => {
        // roles هي المصفوفة اللي بتبعتها في الراوت (مثلا ['admin'])
        if (!roles.includes(req.user.role)) {
            return next(new AppError('You do not have permission to perform this action', 403));
        }
        next();
    };
};

// عدل الإكسبورت عشان يخرج الاثنين
module.exports = { protect, restrictTo };