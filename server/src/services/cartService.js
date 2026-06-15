import { pool } from '../database/pool.js';
import { AppError } from '../utils/AppError.js';
import { safeParseJson } from '../utils/json.js';
import { getProductById, getProductsByIds } from './productService.js';

export async function getRawCartByUserId(userId, executor = pool) {
  const [rows] = await executor.query(
    'SELECT cart_json FROM users WHERE id = ? LIMIT 1',
    [userId]
  );

  if (rows.length === 0) {
    throw new AppError('User not found', 404);
  }

  return safeParseJson(rows[0].cart_json, []);
}

export async function saveCart(userId, cartItems, executor = pool) {
  await executor.query('UPDATE users SET cart_json = ? WHERE id = ?', [
    JSON.stringify(cartItems),
    userId
  ]);
}

export async function getCartByUserId(userId) {
  const cartItems = await getRawCartByUserId(userId);

  if (cartItems.length === 0) {
    return {
      items: [],
      summary: {
        itemCount: 0,
        totalAmount: 0
      }
    };
  }

  const products = await getProductsByIds(cartItems.map((item) => item.productId));
  const productsById = new Map(products.map((product) => [product.id, product]));

  const hydratedItems = cartItems
    .map((item) => {
      const product = productsById.get(item.productId);

      if (!product) {
        return null;
      }

      return {
        productId: product.id,
        quantity: item.quantity,
        name: product.name,
        price: product.price,
        imageUrl: product.imageUrl,
        stock: product.stock,
        lineTotal: Number(product.price) * item.quantity
      };
    })
    .filter(Boolean);

  return {
    items: hydratedItems,
    summary: {
      itemCount: hydratedItems.reduce((total, item) => total + item.quantity, 0),
      totalAmount: hydratedItems.reduce((total, item) => total + item.lineTotal, 0)
    }
  };
}

export async function addToCart(userId, productId, quantity) {
  const product = await getProductById(productId);

  if (product.stock < quantity) {
    throw new AppError('Requested quantity exceeds available stock', 400);
  }

  const cartItems = await getRawCartByUserId(userId);
  const existingItem = cartItems.find((item) => item.productId === productId);

  if (existingItem) {
    if (existingItem.quantity + quantity > product.stock) {
      throw new AppError('Requested quantity exceeds available stock', 400);
    }

    existingItem.quantity += quantity;
  } else {
    cartItems.push({ productId, quantity });
  }

  await saveCart(userId, cartItems);
  return getCartByUserId(userId);
}

export async function removeFromCart(userId, productId) {
  const cartItems = await getRawCartByUserId(userId);
  const updatedCart = cartItems.filter((item) => item.productId !== productId);

  if (updatedCart.length === cartItems.length) {
    throw new AppError('Product is not in the cart', 404);
  }

  await saveCart(userId, updatedCart);
  return getCartByUserId(userId);
}

export async function clearCart(userId, executor = pool) {
  await saveCart(userId, [], executor);
}
