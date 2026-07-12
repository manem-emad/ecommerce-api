require('dotenv').config();
const express = require('express');
const connectDB = require('./DB/connection');
const authRoutes = require('./routes/auth.routes');

// 1. عرف الـ app أولاً
const app = express();

// 2. الميدل وير العامة (بعد تعريف app)
app.use(express.json()); 

app.use((req, res, next) => {
    
    next();
});

// 3. الاتصال بقاعدة البيانات
connectDB();

// 4. ربط المسارات
app.use('/api/auth', authRoutes); 

const userRoutes = require('./routes/user.routes');
app.use('/api/users', userRoutes);

const productRoutes = require('./routes/product.routes');
app.use('/api/products', productRoutes);

// 5. المسار الرئيسي
app.get('/', (req, res) => {
    res.status(200).json({ message: 'Welcome to Ecommerce API!' });
});

// 6. الـ Error Handler (لازم يكون في الآخر خالص)
app.use((err, req, res, next) => {
    console.error("Error Handler Caught:", err);
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
        status: 'error',
        message: err.message || 'Internal Server Error'
    });
});

// 7. تشغيل السيرفر
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});