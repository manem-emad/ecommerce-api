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
cartSchema.virtual('subtotal').get(function() {
    return this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
});

// Virtual لحساب الـ total بعد الخصم
cartSchema.virtual('total').get(function() {
    let subtotal = this.subtotal;
    if (!this.coupon) return subtotal;
    
    let discount = 0;
    if (this.coupon.discountType === 'percentage') {
        discount = subtotal * (this.coupon.discountValue / 100);
    } else {
        discount = this.coupon.discountValue;
    }
    return Math.max(0, subtotal - discount);
});

module.exports = mongoose.model('Cart', cartSchema);