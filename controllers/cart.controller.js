const Cart = require('../models/Cart.model');
const Product = require('../models/Product.model');
const AppError = require('../utils/appError');

// 1. جلب كارد المستخدم
exports.getCart = async (req, res, next) => {
    try {
        let cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
        if (!cart) cart = await Cart.create({ user: req.user._id, items: [] });
        res.status(200).json({ success: true, data: cart });
    } catch (error) { next(error); }
};

// 2. إضافة منتج للكارد
exports.addToCart = async (req, res, next) => {
    try {
        const { productId, quantity } = req.body;
        const product = await Product.findById(productId);
        
        if (!product || product.stock < quantity) return next(new AppError("Product not available", 400));

        let cart = await Cart.findOne({ user: req.user._id });
        if (!cart) cart = await Cart.create({ user: req.user._id, items: [] });
        
        // تقليل المخزون
        product.stock -= quantity;
        await product.save();

        cart.items.push({ product: productId, name: product.title, price: product.price, quantity });
        await cart.save();

        res.status(201).json({ success: true, data: cart });
    } catch (error) { next(error); }
};

// 3. تحديث الكمية
exports.updateQuantity = async (req, res, next) => {
    try {
        const { productId, quantity } = req.body;
        let cart = await Cart.findOne({ user: req.user._id });
        const item = cart.items.find(i => i.product.toString() === productId);
        
        if (!item) return next(new AppError("Item not found in cart", 404));

        const diff = quantity - item.quantity;
        const product = await Product.findById(productId);
        
        if (product.stock < diff) return next(new AppError("Not enough stock", 400));
        
        product.stock -= diff;
        await product.save();
        
        item.quantity = quantity;
        await cart.save();
        
        res.status(200).json({ success: true, data: cart });
    } catch (error) { next(error); }
};

// 4. حذف منتج من الكارد
exports.removeItem = async (req, res, next) => {
    try {
        let cart = await Cart.findOne({ user: req.user._id });
        const item = cart.items.find(i => i.product.toString() === req.params.productId);
        
        if (!item) return next(new AppError("Item not found in cart", 404));

        const product = await Product.findById(item.product);
        product.stock += item.quantity;
        await product.save();
        
        cart.items = cart.items.filter(i => i.product.toString() !== req.params.productId);
        await cart.save();
        
        res.status(200).json({ success: true, message: "Item removed and stock restored" });
    } catch (error) { next(error); }
};

// 5. تطبيق كوبون خصم
exports.applyCoupon = async (req, res, next) => {
    try {
        const { code } = req.body;
        const coupons = { "SAVE10": { type: 'percentage', value: 10 }, "OFF50": { type: 'fixed', value: 50 } };
        
        if (!coupons[code]) return next(new AppError("Invalid coupon", 400));
        
        let cart = await Cart.findOne({ user: req.user._id });
        cart.coupon = { code, discountType: coupons[code].type, discountValue: coupons[code].value };
        await cart.save();
        
        res.status(200).json({ success: true, data: cart });
    } catch (error) { next(error); }
};

// 6. مسح الكارد بالكامل
exports.clearCart = async (req, res, next) => {
    try {
        await Cart.findOneAndDelete({ user: req.user._id });
        res.status(200).json({ success: true, message: "Cart cleared" });
    } catch (error) { next(error); }
};