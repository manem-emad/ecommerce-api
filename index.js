require('dotenv').config();
const express = require('express');
const connectDB = require('./DB/connection');

// 1. تعريف التطبيق
const app = express();

// 2. الميدل وير العامة (معالجة الـ JSON)
app.use(express.json()); 

// 3. الاتصال بقاعدة البيانات
connectDB();

// 4. استيراد المسارات (Routes)
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const productRoutes = require('./routes/product.routes');
const cartRoutes = require('./routes/cart.routes'); 

// 5. ربط المسارات بالتطبيق
// لاحظ أننا نضعهم هنا بعد تعريف الميدل وير وقبل معالجة الأخطاء
app.use('/api/auth', authRoutes); 
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/carts', cartRoutes); 

// 6. المسار الرئيسي للتأكد من عمل السيرفر
app.get('/', (req, res) => {
    res.status(200).json({ message: 'Welcome to Ecommerce API!' });
});

// 7. معالجة الأخطاء (الـ Error Handler)
// لازم يكون في آخر الملف بعد كل الـ Routes
app.use((err, req, res, next) => {
    console.error("Error Handler Caught:", err);
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
        status: 'error',
        message: err.message || 'Internal Server Error'
    });
});

// 8. تشغيل السيرفر
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});