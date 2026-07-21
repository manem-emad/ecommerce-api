const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
const { protect, restrictTo } = require('../middleware/auth');

// حماية كل المسارات (لازم يوزر مسجل دخول)
router.use(protect);

// مسارات اليوزر
router.post('/', orderController.createCashOrder); // إنشاء أوردر جديد
router.get('/my', orderController.getMyOrders); // جلب طلبات اليوزر
router.patch('/:id/cancel', orderController.cancelMyOrder); // إلغاء الطلب

// مسارات الأدمن (تحتاج صلاحية admin)
router.use(restrictTo('admin'));
router.get('/admin', orderController.getAllOrders); // جلب كل الطلبات
router.patch('/admin/:id/status', orderController.updateOrderStatus); // تحديث حالة الطلب
router.get('/admin/dashboard', orderController.getAdminDashboard);

module.exports = router;