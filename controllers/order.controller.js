const Order = require('../models/Order.model');
const Cart = require('../models/Cart.model');
const Product = require('../models/Product.model');
const User = require('../models/User.model');
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

// 2. جلب طلبات اليوزر الحالي (User)
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

// 6. لوحة تحكم الأدمن والإحصائيات (Admin Dashboard)
exports.getAdminDashboard = async (req, res, next) => {
    try {
        const [
            totalCustomers,
            totalAdmins,
            totalProducts,
            orderStats,
            revenueStats,
            topProducts,
            dailyRevenue,
            recentOrders
        ] = await Promise.all([
            User.countDocuments({ role: 'customer' }),
            User.countDocuments({ role: 'admin' }),
            Product.countDocuments(),
            Order.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
            Order.aggregate([{ $group: { _id: null, totalRevenue: { $sum: "$totalPrice" } } }]),
            Product.find().sort({ sold: -1 }).limit(5).select('name image sold price'),
            Order.aggregate([
                {
                    $match: {
                        createdAt: { $gte: new Date(new Date().setDate(new Date().getDate() - 7)) }
                    }
                },
                {
                    $group: {
                        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                        revenue: { $sum: "$totalPrice" },
                        orders: { $sum: 1 }
                    }
                },
                { $sort: { _id: 1 } }
            ]),
            Order.find().sort({ createdAt: -1 }).limit(5).populate('user', 'name email')
        ]);

        const orderStatusMap = { pending: 0, confirmed: 0, processing: 0, shipped: 0, delivered: 0, cancelled: 0, returned: 0 };
        orderStats.forEach(stat => {
            if (orderStatusMap.hasOwnProperty(stat._id)) {
                orderStatusMap[stat._id] = stat.count;
            }
        });

        res.status(200).json({
            success: true,
            data: {
                totalCustomers,
                totalAdmins,
                totalProducts,
                orders: {
                    total: Object.values(orderStatusMap).reduce((a, b) => a + b, 0),
                    ...orderStatusMap
                },
                revenue: {
                    totalRevenue: revenueStats[0]?.totalRevenue || 0,
                    currentMonthRevenue: 0,
                    lastMonthRevenue: 0
                },
                topProducts,
                dailyRevenue,
                recentOrders
            }
        });
    } catch (error) {
        next(error);
    }
};