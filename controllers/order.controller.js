const Order = require('../models/Order.model');
const Cart = require('../models/Cart.model');
const Product = require('../models/Product.model');
const AppError = require('../utils/appError');
const mongoose = require('mongoose');

// 1. إنشاء أوردر كاش (User)
exports.createCashOrder = async (req, res, next) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const { shippingAddress, customerNote } = req.body;
        const cart = await Cart.findOne({ user: req.user._id }).session(session);

        if (!cart || cart.items.length === 0) return next(new AppError('Cart is empty', 400));

        // حساب التكاليف اعتماداً على الـ Virtuals في المودل
        const order = await Order.create([{
            user: req.user._id,
            items: cart.items,
            shippingAddress,
            customerNote,
            subtotal: cart.subtotal,
            shippingFee: cart.subtotal >= 1000 ? 0 : 50,
            tax: cart.subtotal * 0.14,
            discount: cart.discountAmount,
            totalPrice: cart.total + (cart.subtotal >= 1000 ? 0 : 50) + (cart.subtotal * 0.14),
            paymentMethod: 'cash'
        }], { session });

        // تحديث المخزون (Stock & Sold)
        for (const item of cart.items) {
            await Product.findByIdAndUpdate(item.product, { 
                $inc: { stock: -item.quantity, sold: item.quantity } 
            }, { session });
        }

        await Cart.findByIdAndDelete(cart._id).session(session);
        await session.commitTransaction();
        session.endSession();
        res.status(201).json({ success: true, data: order[0] });
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        next(error);
    }
};

// 2. جلب طلبات اليوزر الحالي
exports.getMyOrders = async (req, res, next) => {
    try {
        const orders = await Order.find({ user: req.user._id });
        res.status(200).json({ success: true, data: orders });
    } catch (error) { next(error); }
};

// 3. إلغاء طلب (User)
exports.cancelMyOrder = async (req, res, next) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const order = await Order.findById(req.params.id).session(session);
        if (!order || order.user.toString() !== req.user._id.toString()) return next(new AppError('Order not found', 404));
        if (!['pending', 'confirmed'].includes(order.status)) return next(new AppError('Cannot cancel this order', 400));

        // استرجاع المخزون
        for (const item of order.items) {
            await Product.findByIdAndUpdate(item.product, { 
                $inc: { stock: item.quantity, sold: -item.quantity } 
            }, { session });
        }

        order.status = 'cancelled';
        order.cancelledAt = Date.now();
        await order.save({ session });
        await session.commitTransaction();
        session.endSession();
        res.status(200).json({ success: true, message: "Order cancelled" });
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        next(error);
    }
};

// 4. جلب جميع الطلبات (Admin)
exports.getAllOrders = async (req, res, next) => {
    try {
        const orders = await Order.find().populate('user', 'name email');
        res.status(200).json({ success: true, data: orders });
    } catch (error) { next(error); }
};

// 5. تحديث حالة الطلب (Admin)
exports.updateOrderStatus = async (req, res, next) => {
    try {
        const order = await Order.findByIdAndUpdate(req.params.id, { 
            status: req.body.status, 
            ...(req.body.status === 'delivered' ? { deliveredAt: Date.now() } : {}) 
        }, { new: true });
        if (!order) return next(new AppError('Order not found', 404));
        res.status(200).json({ success: true, data: order });
    } catch (error) { next(error); }
};