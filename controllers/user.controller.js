const User = require('../models/User.model');

// 1. تحديث البيانات العامة (username, phone, avatar, addresses)
exports.updateUserProfile = async (req, res) => {
    try {
        const { username, phone, avatar, addresses } = req.body;
        
        const updatedUser = await User.findByIdAndUpdate(
            req.user._id, 
            { username, phone, avatar, addresses }, 
            { new: true, runValidators: true }
        );
        
        res.status(200).json({ success: true, data: updatedUser });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 2. روت تغيير الباسورد المستقل (روت منفصل)
exports.changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        
        // جلب المستخدم مع الباسورد لأننا عاملين select: false في الموديل
        const user = await User.findById(req.user._id).select("+password");

        // التأكد من الباسورد الحالي
        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: "Incorrect current password" });
        }

        // تحديث الباسورد (الـ pre-save في الموديل هيقوم بالتشفير)
        user.password = newPassword;
        await user.save();

        res.status(200).json({ success: true, message: "Password updated successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 3. جلب المستخدمين (بالفلترة والتقسيم - Pagination)
exports.getAllUsers = async (req, res) => {
    try {
        const { role, search, isVerified, page = 1 } = req.query;
        
        // بناء الفلتر
        let filter = {};
        if (role) filter.role = role;
        if (isVerified !== undefined) filter.isVerified = isVerified === 'true';
        if (search) {
            filter.username = { $regex: search, $options: 'i' };
        }

        const limit = 5;
        const skip = (parseInt(page) - 1) * limit;

        const users = await User.find(filter).skip(skip).limit(limit);
        const totalFilteredUsers = await User.countDocuments(filter);

        res.status(200).json({
            success: true,
            totalFilteredUsers,
            page: parseInt(page),
            pages: Math.ceil(totalFilteredUsers / limit),
            data: users
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};