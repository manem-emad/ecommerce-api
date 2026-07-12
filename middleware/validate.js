const validate = (schema) => {
    return (req, res, next) => {
        if (!schema) {
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
        
        // هنا نتأكد أن next موجودة قبل استدعائها
        if (typeof next === 'function') {
            next();
        } else {
            console.error("Error: next is not a function in validate middleware");
            res.status(500).json({ status: 'error', message: 'Internal server error' });
        }
    };
};

module.exports = validate;