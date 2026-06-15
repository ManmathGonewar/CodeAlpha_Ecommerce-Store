import { loginUser } from '../services/authService.js';
import { getAllOrders } from '../services/orderService.js';
import {
  createProduct,
  deleteProduct,
  updateProduct
} from '../services/productService.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const adminLogin = asyncHandler(async (req, res) => {
  const result = await loginUser({ ...req.body, role: 'admin' });

  res.json({
    message: 'Admin login successful',
    ...result
  });
});

export const addProduct = asyncHandler(async (req, res) => {
  const product = await createProduct(req.body);

  res.status(201).json({
    message: 'Product created successfully',
    product
  });
});

export const editProduct = asyncHandler(async (req, res) => {
  const product = await updateProduct(Number(req.params.id), req.body);

  res.json({
    message: 'Product updated successfully',
    product
  });
});

export const removeProduct = asyncHandler(async (req, res) => {
  await deleteProduct(Number(req.params.id));

  res.json({
    message: 'Product deleted successfully'
  });
});

export const listAllOrders = asyncHandler(async (req, res) => {
  const orders = await getAllOrders();
  res.json(orders);
});
