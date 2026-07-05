const User = require('../models/User.model');
const OTP = require('../models/OTP.model');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const bcryptjs = require('bcryptjs'); // تأكد من تثبيتها npm i bcryptjs لو تستخدمها لتشفير الباسورد

// إعداد مرسل البريد الإلكتروني (Nodemailer)
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    secure: false, 
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// 1. إرسال كود الـ OTP للتسجيل
exports.sendRegisterOtp = async (req, res, next) => {
    try {
        const { username, email, password, phone } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'An account with this email already exists.' });
        }

        await OTP.deleteMany({ email, purpose: 'register' });

        const otp = crypto.randomInt(100000, 999999).toString();

        await OTP.create({
            email,
            otp,
            purpose: 'register',
            userData: { username, email, password, phone }
        });

        const mailOptions = {
            from: `"SEF Academy Store" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Verify your account - SEF Academy Store',
            html: `<p>Your One-Time Password (OTP) to register is: <b>${otp}</b>. It expires in 10 minutes.</p>`
        };

        await transporter.sendMail(mailOptions);

        return res.status(200).json({
            success: true,
            message: `An OTP has been sent to ${email}. It expires in 10 minutes.`
        });

    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
};

// 2. التحقق من الـ OTP وإنشاء الحساب رسمياً
exports.verifyOtp = async (req, res, next) => {
    try {
        const { email, otp } = req.body;

        const otpRecord = await OTP.findOne({ email, otp, purpose: 'register' });
        if (!otpRecord) {
            return res.status(400).json({ success: false, message: 'Invalid OTP or code expired.' });
        }

        const { username, password, phone } = otpRecord.userData;

        // عمل Hash للباسورد قبل الحفظ لحماية الحسابات
        const hashedPassword = await bcryptjs.hash(password, 12);

        const newUser = await User.create({
            username,
            email,
            password: hashedPassword, 
            phone,
            isVerified: true
        });

        await OTP.deleteOne({ _id: otpRecord._id });

        return res.status(201).json({
            success: true,
            message: 'Account verified and created successfully.',
            user: { id: newUser._id, username: newUser.username, email: newUser.email }
        });

    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
};

// 3. تسجيل الدخول وإصدار الـ Tokens والـ Cookies الآمنة
exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        const getUser = await User.findOne({ email }).select("+password");
        if (!getUser) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        const isMatch = await bcryptjs.compare(password, getUser.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        // إنشاء الـ Access Token (مدته قصيرة 15 دقيقة)
        const accessToken = jwt.sign(
            { userId: getUser._id, role: getUser.role || 'user' },
            process.env.JWT_SECRET || process.env.Secret_Key || 'secret',
            { expiresIn: "15m" }
        );

        // إنشاء الـ Refresh Token (مدته طويلة 7 أيام)
        const refreshToken = jwt.sign(
            { userId: getUser._id },
            process.env.REFRESH_SECRET || 'refresh_secret',
            { expiresIn: "7d" }
        );

        // حفظ الـ Refresh Token في كوكيز آمنة (HttpOnly)
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        return res.status(200).json({
            success: true,
            message: "User logged in successfully",
            accessToken
        });

    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
};

// 4. إرسال كود استعادة كلمة المرور (تم التحديث للعمل الفعلي)
exports.sendForgotPasswordOtp = async (req, res, next) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ success: false, message: 'No user found with this email address.' });
        }

        // مسح أي أكواد استعادة قديمة لنفس الإيميل لعدم حدوث تداخل
        await OTP.deleteMany({ email, purpose: 'forgot_password' });

        // توليد كود عشوائي من 6 أرقام
        const otp = crypto.randomInt(100000, 999999).toString();

        // حفظ كود الاستعادة مؤقتاً في الداتابيز
        await OTP.create({
            email,
            otp,
            purpose: 'forgot_password'
        });

        const mailOptions = {
            from: `"SEF Academy Store" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Reset your password - SEF Academy Store',
            html: `<p>Your One-Time Password (OTP) to reset your password is: <b>${otp}</b>. It expires in 10 minutes.</p>`
        };

        await transporter.sendMail(mailOptions);

        return res.status(200).json({
            success: true,
            message: `A password reset OTP has been sent to ${email}.`
        });

    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
};

// 5. التحقق وتغيير كلمة المرور (تم التحديث للعمل الفعلي)
exports.verifyForgotPasswordOtp = async (req, res, next) => {
    try {
        const { email, otp, newPassword } = req.body;

        // التأكد من صحة الكود والهدف منه
        const otpRecord = await OTP.findOne({ email, otp, purpose: 'forgot_password' });
        if (!otpRecord) {
            return res.status(400).json({ success: false, message: 'Invalid OTP or code expired.' });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ success: false, message: 'User no longer exists.' });
        }

        // تشفير كلمة المرور الجديدة باستخدام bcryptjs المتوافقة مع بقية الملف
        const hashedPassword = await bcryptjs.hash(newPassword, 12);
        user.password = hashedPassword;
        await user.save();

        // حذف كود الـ OTP بعد استخدامه وتحديث الباسورد بنجاح
        await OTP.deleteOne({ _id: otpRecord._id });

        return res.status(200).json({
            success: true,
            message: 'Password has been reset successfully. You can now log in with your new password.'
        });

    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
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