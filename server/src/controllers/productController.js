import { getAllProducts, getProductById } from '../services/productService.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const listProducts = asyncHandler(async (req, res) => {
  const products = await getAllProducts();
  res.json(products);
});

export const getProductDetails = asyncHandler(async (req, res) => {
  const product = await getProductById(Number(req.params.id));
  res.json(product);
});
