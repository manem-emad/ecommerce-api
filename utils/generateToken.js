const jwt = require('jsonwebtoken');

/**
 * Generate a JWT token for a specific user.
 * @param {string} userId - The ID of the user.
 * @returns {string} - The generated JWT token.
 */
const generateToken = (userId) => {
    return jwt.sign(
        { userId }, // خليتها userId عشان تتطابق مع الـ Middleware اللي بيعمل decode
        process.env.JWT_SECRET, 
        { 
            expiresIn: process.env.JWT_EXPIRES_IN || '90d' 
        }
    );
};

module.exports = generateToken;