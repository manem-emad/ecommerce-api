const jwt = require('jsonwebtoken');
const User = require('../models/User.model');

const protect = async (req, res, next) => {
    try {
        let token;
        
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return res.status(401).json({ message: 'You are not logged in. Please log in to get access.' });
        }

        // فك تشفير التوكن باستخدام الـ Secret Key
        const decoded = jwt.verify(token, process.env.JWT_SECRET || process.env.Secret_Key);

        const currentUser = await User.findById(decoded.userId || decoded.id);
        if (!currentUser) {
            return res.status(401).json({ message: 'The user belonging to this token no longer exists.' });
        }

        req.user = currentUser;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Invalid token. Authorization denied.' });
    }
};

module.exports = { protect };