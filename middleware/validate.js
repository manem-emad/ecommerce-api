const validate = (schema) => {
    return (req, res, next) => {
        // حماية السيرفر من الكراش إذا كان الـ schema غير معرف
        if (!schema || typeof schema.validate !== 'function') {
            return next();
        }
        
        const { error } = schema.validate(req.body, { abortEarly: false });
        if (error) {
            const errorMessages = error.details.map(detail => detail.message);
            return res.status(400).json({ 
                status: 'fail', 
                errors: errorMessages 
            });
        }
        next(); 
    };
};

module.exports = validate;