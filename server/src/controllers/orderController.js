import { getOrdersByUserId, placeOrder } from '../services/orderService.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const createOrder = asyncHandler(async (req, res) => {
  const order = await placeOrder(req.user.id, req.body.shippingAddress);

  res.status(201).json({
    message: 'Order placed successfully',
    order
  });
});

export const listOrders = asyncHandler(async (req, res) => {
  const orders = await getOrdersByUserId(req.user.id);
  res.json(orders);
});
