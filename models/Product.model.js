const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    stock: { type: Number, default: 0 },
    category: { type: String, required: true },
    brand: { type: String },
    sku: { type: String, required: true, unique: true },
    
    // التعديلات الجديدة:
    isActive: { type: Boolean, default: true }, // عشان الـ Soft Delete
    sold: { type: Number, default: 0 },        // عشان تتابع مبيعات المنتج
    
    images: [{
        url: { type: String, required: true },
        public_id: { type: String, required: true }
    }],
    
    reviews: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        rating: { type: Number, required: true, min: 1, max: 5 },
        comment: { type: String, required: true },
        createdAt: { type: Date, default: Date.now }
    }],
    
    ratingsAverage: { type: Number, default: 0 },
    ratingsQuantity: { type: Number, default: 0 } // ضفناها لتسهيل الحسابات
}, { timestamps: true });

// الـ Pre-hook المحدث
productSchema.pre('save', function(next) {
    if (this.reviews && this.reviews.length > 0) {
        const sum = this.reviews.reduce((acc, curr) => acc + curr.rating, 0);
        this.ratingsAverage = sum / this.reviews.length;
        this.ratingsQuantity = this.reviews.length; // تحديث العدد تلقائياً
    } else {
        this.ratingsAverage = 0;
        this.ratingsQuantity = 0;
    }
    next();
});

module.exports = mongoose.model('Product', productSchema);