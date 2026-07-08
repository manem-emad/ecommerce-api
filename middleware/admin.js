const adminMiddleware = (req, res, next) => {
    // req.user دي بتيجي من الـ protect middleware اللي قبلها
    if (req.user && req.user.role === 'admin') {
        next(); // كمل، أنت أدمن
    } else {
        return res.status(403).json({ message: 'Access denied. Admins only.' });
    }
};

module.exports = { adminMiddleware };