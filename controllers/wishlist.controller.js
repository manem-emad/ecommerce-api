const Wishlist = require('../models/Wishlist.model');
const AppError = require('../utils/appError');

// 1. جلب قائمة الأمنيات لليوزر الحالي
exports.getMyWishlist = async (req, res, next) => {
    try {
        let wishlist = await Wishlist.findOne({ user: req.user._id });
        if (!wishlist) {
            wishlist = await Wishlist.create({ user: req.user._id, products: [] });
        }
        res.status(200).json({ success: true, data: wishlist });
    } catch (error) { next(error); }
};

// 2. إضافة منتج للقائمة
exports.addToWishlist = async (req, res, next) => {
    try {
        const { productId } = req.params;
        let wishlist = await Wishlist.findOne({ user: req.user._id });
        
        if (!wishlist) {
            wishlist = await Wishlist.create({ user: req.user._id, products: [productId] });
        } else {
            // التحقق إذا كان المنتج موجوداً مسبقاً لمنع التكرار
            if (!wishlist.products.includes(productId)) {
                wishlist.products.push(productId);
                await wishlist.save();
            }
        }
        res.status(200).json({ success: true, data: wishlist });
    } catch (error) { next(error); }
};

// 3. حذف منتج من القائمة
exports.removeFromWishlist = async (req, res, next) => {
    try {
        const { productId } = req.params;
        await Wishlist.findOneAndUpdate(
            { user: req.user._id },
            { $pull: { products: productId } },
            { new: true }
        );
        res.status(200).json({ success: true, message: "Product removed from wishlist" });
    } catch (error) { next(error); }
};

// 4. مسح القائمة بالكامل
exports.clearWishlist = async (req, res, next) => {
    try {
        await Wishlist.findOneAndUpdate(
            { user: req.user._id },
            { $set: { products: [] } },
            { new: true }
        );
        res.status(200).json({ success: true, message: "Wishlist cleared" });
    } catch (error) { next(error); }
};