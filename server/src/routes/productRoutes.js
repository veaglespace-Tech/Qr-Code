const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/', productController.getProducts);
router.get('/:slug', productController.getProductBySlug);
router.post('/upload-image', authenticate, authorize('SUPERADMIN'), productController.uploadProductImage);
router.post('/', authenticate, authorize('SUPERADMIN'), productController.createProduct);
router.put('/:id', authenticate, authorize('SUPERADMIN'), productController.updateProduct);
router.delete('/:id', authenticate, authorize('SUPERADMIN'), productController.deleteProduct);

module.exports = router;
