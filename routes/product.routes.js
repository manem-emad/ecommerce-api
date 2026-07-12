const express = require('express');
const router = express.Router();

const { 
    createProduct, 
    getAllProducts, 
    getProductById,
    updateProduct,
    deleteProduct, 
    addReview,
    deleteReview,
    getProductReviews
} = require('../controllers/product.controller');

const { protect } = require('../middleware/auth');
const { adminMiddleware } = require('../middleware/admin');
const { upload } = require('../middleware/cloudinary');
const { validate, createProductSchema, reviewSchema } = require('../middleware/validator');

// --- Public Routes ---
router.get('/', getAllProducts);
router.get('/:id', getProductById);
router.get('/:id/reviews', getProductReviews);

// --- Admin Routes ---
router.post('/', protect, adminMiddleware, upload.array('images', 5), validate(createProductSchema), createProduct);
router.put('/update/:id', protect, adminMiddleware, upload.array('images', 5), updateProduct);
router.delete('/:id', protect, adminMiddleware, deleteProduct);

// --- User Routes ---
router.post('/:id/reviews', protect, validate(reviewSchema), addReview);
router.delete('/:id/reviews/:rid', protect, deleteReview);

module.exports = router;