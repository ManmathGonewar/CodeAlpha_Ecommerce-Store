import { Router } from 'express';
import { param } from 'express-validator';

import {
  getProductDetails,
  listProducts
} from '../controllers/productController.js';
import { validateRequest } from '../middleware/validateRequest.js';

const router = Router();

router.get('/', listProducts);
router.get(
  '/:id',
  [param('id').isInt({ min: 1 }).withMessage('Product id must be a number')],
  validateRequest,
  getProductDetails
);

export default router;
