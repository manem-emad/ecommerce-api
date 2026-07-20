const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    name: String,
    image: String,
    price: Number,
    quantity: { type: Number, default: 1 }
});

const cartSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    items: [cartItemSchema],
    coupon: {
        code: String,
        discountType: { type: String, enum: ['percentage', 'fixed'] },
        discountValue: Number
    }
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

// Mongoose Virtuals للحسابات اللحظية
// حساب مجموع السعر قبل الخصم
cartSchema.virtual('subtotal').get(function() {
    return this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
});

// حساب إجمالي عدد المنتجات في الكارت
cartSchema.virtual('itemCount').get(function() {
    return this.items.reduce((total, item) => total + item.quantity, 0);
});

// حساب قيمة الخصم
cartSchema.virtual('discountAmount').get(function() {
    if (!this.coupon) return 0;
    const subtotal = this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    if (this.coupon.discountType === 'percentage') {
        return subtotal * (this.coupon.discountValue / 100);
    }
    return this.coupon.discountValue;
});

// حساب الـ total بعد الخصم
cartSchema.virtual('total').get(function() {
    const subtotal = this.subtotal;
    const discount = this.discountAmount;
    return Math.max(0, subtotal - discount);
});

module.exports = mongoose.model('Cart', cartSchema);