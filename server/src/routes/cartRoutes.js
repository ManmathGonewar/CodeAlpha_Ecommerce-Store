import { Router } from 'express';
import { body, param } from 'express-validator';

import {
  addProductToCart,
  getCart,
  removeProductFromCart
} from '../controllers/cartController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { validateRequest } from '../middleware/validateRequest.js';

const router = Router();

router.use(authenticate);

router.get('/', getCart);
router.post(
  '/add',
  [
    body('productId')
      .isInt({ min: 1 })
      .withMessage('A valid product id is required'),
    body('quantity')
      .optional()
      .isInt({ min: 1, max: 20 })
      .withMessage('Quantity must be between 1 and 20')
  ],
  validateRequest,
  addProductToCart
);
router.delete(
  '/remove/:id',
  [param('id').isInt({ min: 1 }).withMessage('A valid product id is required')],
  validateRequest,
  removeProductFromCart
);

export default router;
