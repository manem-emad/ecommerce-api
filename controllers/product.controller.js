const Product = require('../models/Product.model');
const { deleteImage } = require('../middleware/cloudinary');
const { MESSAGES } = require('../utils/constants');
const AppError = require('../utils/appError');

// 1. إنشاء منتج (Admin)
exports.createProduct = async (req, res, next) => {
    try {
        const { price, discount, sku } = req.body;
        
        // 1. التأكد من وجود الصور
        if (!req.files || req.files.length === 0) return next(new AppError(MESSAGES.IMG_REQUIRED, 400));
        
        // 2. التعديل هنا: تحويل القيم لـ Number قبل المقارنة
        if (discount && Number(price) <= Number(discount)) {
            return next(new AppError(MESSAGES.INVALID_PRICE, 400));
        }
        
        // 3. التأكد من عدم تكرار الـ SKU
        const existingProduct = await Product.findOne({ sku });
        if (existingProduct) return next(new AppError(MESSAGES.SKU_EXISTS, 400));

        // 4. تجهيز الصور وإنشاء المنتج
        const images = req.files.map(file => ({ url: file.path, public_id: file.filename }));
        const newProduct = await Product.create({ ...req.body, images });
        
        res.status(201).json({ success: true, data: newProduct });
    } catch (error) { next(error); }
};

// 2. جلب الكل بفلترة وترتيب (Public)
exports.getAllProducts = async (req, res, next) => {
    try {
        const { category, search, page = 1, limit = 5, sort = '-createdAt' } = req.query;
        // هنا بنضيف isActive: true عشان الزوار ميشوفوش المنتجات المعطلة
        let filter = { isActive: true }; 
        
        if (category) filter.category = category;
        if (search) filter.title = { $regex: search, $options: 'i' };

        const products = await Product.find(filter)
            .sort(sort)
            .skip((page - 1) * limit)
            .limit(parseInt(limit));
        
        res.status(200).json({ success: true, total: products.length, data: products });
    } catch (error) { next(error); }
};

// 3. جلب منتج واحد (Public)
exports.getProductById = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return next(new AppError(MESSAGES.PRODUCT_NOT_FOUND, 404));
        res.status(200).json({ success: true, data: product });
    } catch (error) { next(error); }
};

// 4. تحديث منتج (Admin)
exports.updateProduct = async (req, res, next) => {
    try {
        let product = await Product.findById(req.params.id);
        if (!product) return next(new AppError(MESSAGES.PRODUCT_NOT_FOUND, 404));
        
        const updatedProduct = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json({ success: true, data: updatedProduct });
    } catch (error) { next(error); }
};

// 5. حذف منتج (Admin) - تعديل: تحويل الحذف النهائي لـ Soft Delete
exports.deleteProduct = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return next(new AppError(MESSAGES.PRODUCT_NOT_FOUND, 404));
        
        // بدل ما نمسح المنتج من الداتابيس، هنعطله بس
        product.isActive = false;
        await product.save();
        
        res.status(200).json({ success: true, message: "Product deactivated (Soft Deleted)" });
    } catch (error) { next(error); }
};

// 6. إضافة تقييم (User)
exports.addReview = async (req, res, next) => {
    try {
        const { rating, comment } = req.body;
        const product = await Product.findById(req.params.id);
        if (!product) return next(new AppError(MESSAGES.PRODUCT_NOT_FOUND, 404));

        // التحقق من أن المستخدم لم يقم بتقييم المنتج مسبقاً
        const alreadyReviewed = product.reviews.find(r => r.user.toString() === req.user.id.toString());
        if (alreadyReviewed) return next(new AppError(MESSAGES.REVIEW_EXISTS, 400));

        product.reviews.push({ user: req.user.id, rating, comment });
        await product.save();
        res.status(200).json({ success: true, message: "Review added" });
    } catch (error) { next(error); }
};

// 7. جلب جميع تقييمات منتج معين (Public)
exports.getProductReviews = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return next(new AppError(MESSAGES.PRODUCT_NOT_FOUND, 404));
        
        res.status(200).json({ success: true, count: product.reviews.length, data: product.reviews });
    } catch (error) { next(error); }
};

// 8. حذف تقييم معين (User/Admin)
exports.deleteReview = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return next(new AppError(MESSAGES.PRODUCT_NOT_FOUND, 404));

        // التحقق: هل التقييم يخص اليوزر؟ أو هل هو أدمن؟
        const reviewIndex = product.reviews.findIndex(r => r._id.toString() === req.params.rid);
        if (reviewIndex === -1) return next(new AppError("Review not found", 404));

        // شرط الصلاحية: (req.user هو اليوزر اللي جاي من الـ Auth Middleware)
        if (product.reviews[reviewIndex].user.toString() !== req.user.id.toString() && req.user.role !== 'admin') {
            return next(new AppError("You are not allowed to delete this review", 403));
        }

        product.reviews.splice(reviewIndex, 1);
        await product.save();
        res.status(200).json({ success: true, message: "Review deleted successfully" });
    } catch (error) { next(error); }
};