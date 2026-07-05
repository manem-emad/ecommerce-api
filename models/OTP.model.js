const mongoose = require('mongoose');

const OTPSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        trim: true
    },
    otp: {
        type: String,
        required: true
    },
    purpose: {
        type: String,
        // أضفنا forgot_password عشان يطابق الـ Controller تماماً
        enum: ['register', 'forgot_password'], 
        required: true
    },
    userData: {
        type: Object, // لحفظ بيانات التسجيل مؤقتاً حتى يتم التحقق
        default: null
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 600 // الحذف التلقائي بعد 10 دقائق من الداتا بيز
    }
});

module.exports = mongoose.model('OTP', OTPSchema);