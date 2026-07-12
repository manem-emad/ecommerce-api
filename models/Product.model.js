const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    discount: { type: Number, default: 0 }, // ضفنا الخصم عشان الكنترولر
    stock: { type: Number, default: 0 },
    category: { type: String, required: true },
    brand: { type: String },
    sku: { type: String, required: true, unique: true }, // مطلوب للـ Validation
    
    images: [{
        url: { type: String, required: true },
        public_id: { type: String, required: true }
    }],
    
    // نظام التقييمات الجديد (Array of objects) عشان الـ logic اللي كتبناه
    reviews: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        rating: { type: Number, required: true, min: 1, max: 5 },
        comment: { type: String, required: true },
        createdAt: { type: Date, default: Date.now }
    }],
    
    ratingsAverage: { type: Number, default: 0 }
}, { timestamps: true });

// الـ Pre-hook عشان نحسب التقييم المتوسط تلقائياً (حركة سينيور)
productSchema.pre('save', function(next) {
    // التأكد إن this.reviews موجودة عشان نتجنب الخطأ
    if (this.reviews && this.reviews.length > 0) {
        const sum = this.reviews.reduce((acc, curr) => acc + curr.rating, 0);
        this.ratingsAverage = sum / this.reviews.length;
    } else {
        this.ratingsAverage = 0;
    }
    
    // الحل: نتأكد إننا بننادي next() لو كانت موجودة كدالة
    if (typeof next === 'function') {
        next();
    } else {
        // في حالات نادرة لو next مش موجودة، ممكن نخرج من الدالة مباشرة
        return;
    }
});

module.exports = mongoose.model('Product', productSchema);