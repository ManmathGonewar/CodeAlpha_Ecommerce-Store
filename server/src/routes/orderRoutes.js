import { Router } from 'express';
import { body } from 'express-validator';

import { createOrder, listOrders } from '../controllers/orderController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { validateRequest } from '../middleware/validateRequest.js';

const router = Router();

router.use(authenticate);

router.post(
  '/',
  [
    body('shippingAddress')
      .trim()
      .isLength({ min: 10, max: 255 })
      .withMessage('Shipping address must be between 10 and 255 characters')
  ],
  validateRequest,
  createOrder
);

router.get('/', listOrders);

export default router;
