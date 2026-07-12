const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'ecommerce_uploads', 
        allowed_formats: ['jpg', 'png', 'jpeg'],
    },
});

const upload = multer({ storage: storage });

// أضف الدالة دي هنا عشان الـ controller يستخدمها
const deleteImage = async (public_id) => {
    return await cloudinary.uploader.destroy(public_id);
};

// عدل الـ export عشان يشمل الدالة الجديدة
module.exports = { upload, deleteImage };