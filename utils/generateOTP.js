const crypto = require('crypto');

/**
 * Generates a random 6-digit OTP
 * @returns {string} - The generated OTP
 */
const generateOTP = () => {
    return crypto.randomInt(100000, 999999).toString();
};

module.exports = generateOTP;