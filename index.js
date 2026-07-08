require('dotenv').config();
const express = require('express');
const connectDB = require('./DB/connection');
const authRoutes = require('./routes/auth.routes');

const app = express();


connectDB();


app.use(express.json()); 

// 4. ربط مسارات الـ Authentication
app.use('/api/auth', authRoutes); 

// --- ضيف السطرين دول هنا ---
const userRoutes = require('./routes/user.routes'); // استدعاء ملف الروتر بتاع اليوزر
app.use('/api/users', userRoutes); // ربط المسار


// 5. المسار الرئيسي للسيرفر
app.get('/', (req, res) => {
    res.status(200).json({ message: 'Welcome to Ecommerce API!' });
});

// 6. ميدل وير معالجة الأخطاء (Global Error Handler)
app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
        status: 'error',
        message: err.message || 'Internal Server Error',
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
});

// 7. تشغيل السيرفر والاستماع للمنفذ
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});