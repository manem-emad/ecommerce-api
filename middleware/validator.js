const Joi = require('joi');

const createProductSchema = Joi.object({
    title: Joi.string().required().min(3).max(100),
    description: Joi.string().required().min(10),
    price: Joi.number().required().positive(),
    stock: Joi.number().required().integer().min(0),
    category: Joi.string().required(),
    sku: Joi.string().required(),
    brand: Joi.string().optional(),
    discount: Joi.number().min(0).optional() 
});
// 2. سكيمة إضافة تقييم
const reviewSchema = Joi.object({
    rating: Joi.number().required().min(1).max(5),
    comment: Joi.string().required().min(5)
});

// 3. سكيمة تحديث المنتج
const updateProductSchema = Joi.object({
    title: Joi.string().min(3),
    price: Joi.number().positive(),
    stock: Joi.number().integer().min(0),
    category: Joi.string()
});

// دالة الـ Middleware اللي بتفحص الـ Body
const validate = (schema) => {
    return (req, res, next) => {
        const { error } = schema.validate(req.body);
        if (error) {
            return res.status(400).json({ success: false, message: error.details[0].message });
        }
        next();
    };
};

module.exports = {
    createProductSchema,
    reviewSchema,
    updateProductSchema,
    validate
};