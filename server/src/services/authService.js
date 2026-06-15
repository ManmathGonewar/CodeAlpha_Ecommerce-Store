import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import { env } from '../config/env.js';
import { pool } from '../database/pool.js';
import { AppError } from '../utils/AppError.js';

function signToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role
    },
    env.jwtSecret,
    { expiresIn: env.jwtExpiresIn }
  );
}

function serializeUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role
  };
}

function buildAuthResponse(user) {
  const safeUser = serializeUser(user);

  return {
    token: signToken(safeUser),
    user: safeUser
  };
}

export async function registerUser({ name, email, password }) {
  const [existingUsers] = await pool.query(
    'SELECT id FROM users WHERE email = ? LIMIT 1',
    [email]
  );

  if (existingUsers.length > 0) {
    throw new AppError('Email is already registered', 409);
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const [result] = await pool.query(
    `
      INSERT INTO users (name, email, password_hash, role, cart_json)
      VALUES (?, ?, ?, 'user', JSON_ARRAY())
    `,
    [name, email, passwordHash]
  );

  const user = await findUserById(result.insertId);
  return buildAuthResponse(user);
}

export async function loginUser({ email, password, role = null }) {
  const [rows] = await pool.query(
    'SELECT * FROM users WHERE email = ? LIMIT 1',
    [email]
  );

  const user = rows[0];

  if (!user) {
    throw new AppError('Invalid email or password', 401);
  }

  const isPasswordCorrect = await bcrypt.compare(password, user.password_hash);

  if (!isPasswordCorrect) {
    throw new AppError('Invalid email or password', 401);
  }

  if (role && user.role !== role) {
    throw new AppError('You do not have permission to access this area', 403);
  }

  return buildAuthResponse(user);
}

export async function findUserById(userId) {
  const [rows] = await pool.query(
    `
      SELECT id, name, email, role, cart_json, created_at
      FROM users
      WHERE id = ?
      LIMIT 1
    `,
    [userId]
  );

  return rows[0] || null;
}
