import {
  addToCart,
  getCartByUserId,
  removeFromCart
} from '../services/cartService.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getCart = asyncHandler(async (req, res) => {
  const cart = await getCartByUserId(req.user.id);
  res.json(cart);
});

export const addProductToCart = asyncHandler(async (req, res) => {
  const cart = await addToCart(
    req.user.id,
    Number(req.body.productId),
    Number(req.body.quantity || 1)
  );

  res.status(201).json({
    message: 'Product added to cart',
    ...cart
  });
});

export const removeProductFromCart = asyncHandler(async (req, res) => {
  const cart = await removeFromCart(req.user.id, Number(req.params.id));

  res.json({
    message: 'Product removed from cart',
    ...cart
  });
});
