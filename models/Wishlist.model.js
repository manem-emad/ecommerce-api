const mongoose = require('mongoose');

const wishlistSchema = new mongoose.Schema({
    user: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    products: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Product' 
    }]
}, { timestamps: true });

// Pre-find hook لعمل auto-populate لتفاصيل المنتجات زي ما الدوكيو طلبت
wishlistSchema.pre(/^find/, function(next) {
    this.populate({
        path: 'products',
        select: 'title price image' // اختار الحقول اللي محتاجها تظهر
    });
    next();
});

module.exports = mongoose.model('Wishlist', wishlistSchema);