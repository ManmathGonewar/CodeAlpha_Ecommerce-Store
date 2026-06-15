import { pool } from '../database/pool.js';
import { AppError } from '../utils/AppError.js';
import { safeParseJson } from '../utils/json.js';
import { clearCart, getRawCartByUserId } from './cartService.js';
import { getProductsByIds } from './productService.js';

function mapOrder(row) {
  return {
    id: row.id,
    userId: row.user_id,
    customerName: row.customer_name,
    customerEmail: row.customer_email,
    items: safeParseJson(row.items_json, []),
    totalAmount: Number(row.total_amount),
    status: row.status,
    shippingAddress: row.shipping_address,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export async function getOrderById(orderId) {
  const [rows] = await pool.query(
    `
      SELECT
        orders.*,
        users.name AS customer_name,
        users.email AS customer_email
      FROM orders
      INNER JOIN users ON users.id = orders.user_id
      WHERE orders.id = ?
      LIMIT 1
    `,
    [orderId]
  );

  if (rows.length === 0) {
    throw new AppError('Order not found', 404);
  }

  return mapOrder(rows[0]);
}

export async function placeOrder(userId, shippingAddress) {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const cartItems = await getRawCartByUserId(userId, connection);

    if (cartItems.length === 0) {
      throw new AppError('Your cart is empty', 400);
    }

    const products = await getProductsByIds(
      cartItems.map((item) => item.productId),
      connection
    );
    const productsById = new Map(products.map((product) => [product.id, product]));

    if (products.length !== cartItems.length) {
      throw new AppError(
        'One or more products in your cart are no longer available',
        400
      );
    }

    let totalAmount = 0;

    const orderItems = cartItems.map((cartItem) => {
      const product = productsById.get(cartItem.productId);

      if (!product) {
        throw new AppError('A product in your cart could not be found', 400);
      }

      if (product.stock < cartItem.quantity) {
        throw new AppError(
          `${product.name} does not have enough stock available`,
          400
        );
      }

      const lineTotal = Number(product.price) * cartItem.quantity;
      totalAmount += lineTotal;

      return {
        productId: product.id,
        name: product.name,
        price: Number(product.price),
        quantity: cartItem.quantity,
        imageUrl: product.imageUrl,
        lineTotal
      };
    });

    for (const item of orderItems) {
      await connection.query(
        'UPDATE products SET stock = stock - ? WHERE id = ?',
        [item.quantity, item.productId]
      );
    }

    const [result] = await connection.query(
      `
        INSERT INTO orders (user_id, items_json, total_amount, shipping_address, status)
        VALUES (?, ?, ?, ?, 'placed')
      `,
      [userId, JSON.stringify(orderItems), totalAmount, shippingAddress]
    );

    await clearCart(userId, connection);
    await connection.commit();

    return getOrderById(result.insertId);
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

export async function getOrdersByUserId(userId) {
  const [rows] = await pool.query(
    `
      SELECT
        orders.*,
        users.name AS customer_name,
        users.email AS customer_email
      FROM orders
      INNER JOIN users ON users.id = orders.user_id
      WHERE orders.user_id = ?
      ORDER BY orders.created_at DESC
    `,
    [userId]
  );

  return rows.map(mapOrder);
}

export async function getAllOrders() {
  const [rows] = await pool.query(
    `
      SELECT
        orders.*,
        users.name AS customer_name,
        users.email AS customer_email
      FROM orders
      INNER JOIN users ON users.id = orders.user_id
      ORDER BY orders.created_at DESC
    `
  );

  return rows.map(mapOrder);
}
