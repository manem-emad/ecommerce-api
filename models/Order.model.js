const mongoose = require('mongoose');

// تعريف الـ Schema للمنتجات داخل الأوردر (Snapshot)
const orderItemSchema = new mongoose.Schema({
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    name: String,
    image: String,
    price: Number,
    quantity: { type: Number, default: 1 }
});

const orderSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: [orderItemSchema], // مصفوفة المنتجات
    shippingAddress: {
        fullName: String,
        phone: String,
        country: String,
        city: String,
        address: String,
        postalCode: String
    },
    paymentMethod: { type: String, enum: ['cash', 'stripe', 'paypal', 'paymob'], default: 'cash' },
    paymentStatus: { type: String, enum: ['pending', 'paid', 'failed', 'refunded'], default: 'pending' },
    transactionId: String,
    
    // تفاصيل الحسابات
    subtotal: { type: Number, required: true },
    shippingFee: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    totalPrice: { type: Number, required: true },
    
    status: { 
        type: String, 
        enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'], 
        default: 'pending' 
    },
    
    // الملاحظات من الصور
    customerNote: { type: String, maxlength: 1000 },
    adminNote: { type: String, maxlength: 1000 },
    
    // التواريخ
    paidAt: Date,
    deliveredAt: Date,
    cancelledAt: Date
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);