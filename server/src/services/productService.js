import { pool } from '../database/pool.js';
import { AppError } from '../utils/AppError.js';

function mapProduct(row) {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    price: Number(row.price),
    imageUrl: row.image_url,
    category: row.category,
    stock: row.stock,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export async function getAllProducts() {
  const [rows] = await pool.query(
    `
      SELECT id, name, description, price, image_url, category, stock, created_at, updated_at
      FROM products
      ORDER BY created_at DESC
    `
  );

  return rows.map(mapProduct);
}

export async function getProductById(productId) {
  const [rows] = await pool.query(
    `
      SELECT id, name, description, price, image_url, category, stock, created_at, updated_at
      FROM products
      WHERE id = ?
      LIMIT 1
    `,
    [productId]
  );

  if (rows.length === 0) {
    throw new AppError('Product not found', 404);
  }

  return mapProduct(rows[0]);
}

export async function getProductsByIds(productIds, executor = pool) {
  if (productIds.length === 0) {
    return [];
  }

  const placeholders = productIds.map(() => '?').join(', ');
  const [rows] = await executor.query(
    `
      SELECT id, name, description, price, image_url, category, stock, created_at, updated_at
      FROM products
      WHERE id IN (${placeholders})
    `,
    productIds
  );

  return rows.map(mapProduct);
}

export async function createProduct(productData) {
  const { name, description, price, imageUrl, category, stock } = productData;

  const [result] = await pool.query(
    `
      INSERT INTO products (name, description, price, image_url, category, stock)
      VALUES (?, ?, ?, ?, ?, ?)
    `,
    [name, description, price, imageUrl, category, stock]
  );

  return getProductById(result.insertId);
}

export async function updateProduct(productId, productData) {
  await getProductById(productId);

  const { name, description, price, imageUrl, category, stock } = productData;

  await pool.query(
    `
      UPDATE products
      SET
        name = ?,
        description = ?,
        price = ?,
        image_url = ?,
        category = ?,
        stock = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `,
    [name, description, price, imageUrl, category, stock, productId]
  );

  return getProductById(productId);
}

export async function deleteProduct(productId) {
  const [result] = await pool.query(
    'DELETE FROM products WHERE id = ?',
    [productId]
  );

  if (result.affectedRows === 0) {
    throw new AppError('Product not found', 404);
  }

  return true;
}
