const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const addressSchema = new mongoose.Schema({
    street: { type: String, required: true },
    city: { type: String, required: true },
    country: { type: String, required: true },
    zipCode: { type: String }
}, { _id: false }); 

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Username is required']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        select: false
    },
    phone: {
        type: String,
        required: false
    },
    avatar: {
        type: String,
        default: 'https://example.com/placeholder-avatar.png'
    },
    role: {
        type: String,
        enum: ['customer', 'admin'],
        default: 'customer'
    },
    addresses: [addressSchema], 
    wishlist: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    }],
    isVerified: {
        type: Boolean,
        default: false
    },
    resetPasswordToken: {
        type: String
    },
    resetPasswordExpire: {
        type: Date
    }
}, {
    timestamps: true 
});

userSchema.pre('save', async function() {
    // 1. التأكد أن الـ password موجود ومعدل
    if (!this.isModified('password') || !this.password) {
        return; // Mongoose هيعرف إنك خلصت بمجرد خروج الدالة
    }
   
    // 2. تشفير كلمة المرور
    this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.comparePassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.models.User || mongoose.model('User', userSchema);
module.exports = User;
