const User = require('../models/User.model');
const OTP = require('../models/OTP.model');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const bcryptjs = require('bcryptjs');
const sendEmail = require('../utils/sendEmail');

// 1. إرسال كود الـ OTP للتسجيل
exports.sendRegisterOtp = async (req, res, next) => {
    try {
        const { username, email, password, phone } = req.body;
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ success: false, message: 'User already exists.' });

        await OTP.deleteMany({ email, purpose: 'register' });
        const otp = crypto.randomInt(100000, 999999).toString();

        await OTP.create({ email, otp, purpose: 'register', userData: { username, email, password, phone } });

        await sendEmail({
            email,
            subject: 'Verify your account',
            html: `<p>Your OTP is: <b>${otp}</b></p>`
        });

        res.status(200).json({ success: true, message: 'OTP sent.' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// 2. التحقق من الـ OTP وإنشاء الحساب
exports.verifyOtp = async (req, res, next) => {
    try {
        const { email, otp } = req.body;
        const otpRecord = await OTP.findOne({ email, otp, purpose: 'register' });
        if (!otpRecord) return res.status(400).json({ success: false, message: 'Invalid OTP.' });

        const { username, password, phone } = otpRecord.userData;
        const newUser = await User.create({ username, email, password, phone, isVerified: true });

        await OTP.deleteOne({ _id: otpRecord._id });
        res.status(201).json({ success: true, message: 'Account created.', user: { id: newUser._id } });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// 3. تسجيل الدخول
exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const getUser = await User.findOne({ email }).select("+password");
        if (!getUser || !(await getUser.comparePassword(password))) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const accessToken = jwt.sign({ userId: getUser._id }, process.env.JWT_SECRET, { expiresIn: "15m" });
        const refreshToken = jwt.sign({ userId: getUser._id }, process.env.REFRESH_SECRET, { expiresIn: "7d" });

        res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: true, sameSite: 'strict' });
        res.status(200).json({ success: true, accessToken });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// 4. إرسال رابط استعادة كلمة المرور
exports.sendForgotPasswordOtp = async (req, res, next) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: 'User not found.' });

        const resetToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '10m' });

        await sendEmail({
            email,
            subject: 'Reset Password',
            html: `<p>Your token: <strong>${resetToken}</strong></p>`
        });

        res.status(200).json({ success: true, message: 'Reset token sent.' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// 5. تغيير كلمة المرور عبر الـ Token
exports.resetPassword = async (req, res, next) => {
    try {
        const { token, newPassword } = req.body;
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId);
        
        user.password = newPassword;
        await user.save();

        res.status(200).json({ success: true, message: 'Password reset successfully.' });
    } catch (error) {
        res.status(400).json({ success: false, message: 'Invalid or expired token.' });
    }
};

// 6. تسجيل الخروج
exports.logout = async (req, res, next) => {
    try {
        res.clearCookie('refreshToken');
        return res.status(200).json({ success: true, message: "Logged out successfully" });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
};

// 7. جلب بيانات المستخدم الحالية
exports.getMe = async (req, res, next) => {
    try {
        return res.status(200).json({ success: true, data: req.user });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
};