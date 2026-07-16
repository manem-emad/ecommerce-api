const jwt = require('jsonwebtoken');
const User = require('../models/User.model');
const AppError = require('../utils/appError'); 

const protect = async (req, res, next) => {
    try {
        let token;
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        // 2. استخدم next(new AppError(...)) بدل الـ res.status
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

module.exports = { protect };