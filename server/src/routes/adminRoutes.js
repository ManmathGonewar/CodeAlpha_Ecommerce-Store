import { Router } from 'express';
import { body, param } from 'express-validator';

import {
  addProduct,
  adminLogin,
  editProduct,
  listAllOrders,
  removeProduct
} from '../controllers/adminController.js';
import { requireAdmin } from '../middleware/adminMiddleware.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { validateRequest } from '../middleware/validateRequest.js';

const router = Router();

const productValidationRules = [
  body('name').trim().notEmpty().withMessage('Product name is required'),
  body('description')
    .trim()
    .isLength({ min: 10 })
    .withMessage('Description must be at least 10 characters long'),
  body('price')
    .isFloat({ min: 0.01 })
    .withMessage('Price must be greater than 0'),
  body('imageUrl')
    .optional({ values: 'falsy' })
    .isURL()
    .withMessage('Image URL must be valid'),
  body('category').trim().notEmpty().withMessage('Category is required'),
  body('stock').isInt({ min: 0 }).withMessage('Stock cannot be negative')
];

router.post(
  '/login',
  [
    body('email').trim().isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required')
  ],
  validateRequest,
  adminLogin
);

router.use(authenticate, requireAdmin);

router.post('/products', productValidationRules, validateRequest, addProduct);
router.put(
  '/products/:id',
  [
    param('id').isInt({ min: 1 }).withMessage('Product id must be a number'),
    ...productValidationRules
  ],
  validateRequest,
  editProduct
);
router.delete(
  '/products/:id',
  [param('id').isInt({ min: 1 }).withMessage('Product id must be a number')],
  validateRequest,
  removeProduct
);
router.get('/orders', listAllOrders);

export default router;
