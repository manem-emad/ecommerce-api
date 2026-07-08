const Joi = require('joi');

// 1. فالياديشن طلب إرسال الـ OTP (التسجيل المبدئي)
const register = Joi.object({
    username: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    phone: Joi.string().required()
});

// 2. فالياديشن التحقق من الـ OTP لتفعيل الحساب (الذي كان يسبب المشكلة)
const verifyRegister = Joi.object({
    email: Joi.string().email().required(),
    otp: Joi.string().required()
}).unknown(true); // تضمن مرور الحقول الإضافية إذا أرسلتها رغماً عن الفالياديشن

// 3. فالياديشن تسجيل الدخول
const login = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
});

// 4. فالياديشن طلب OTP نسيت كلمة المرور
const forgotPassword = Joi.object({
    email: Joi.string().email().required()
});

// 5. فالياديشن تغيير كلمة المرور بالـ Token الجديد
const resetPassword = Joi.object({
    token: Joi.string().required(), // استبدلنا email و otp بـ token
    newPassword: Joi.string().min(6).required()
});

// التصدير كـ Object يحتوي على كل الـ schemas المحدثة
module.exports = {
    register,
    verifyRegister,
    login,
    forgotPassword,
    resetPassword
};