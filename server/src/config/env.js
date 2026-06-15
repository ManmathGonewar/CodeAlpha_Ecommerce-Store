import dotenv from 'dotenv';

dotenv.config();

export const env = {
  port: Number(process.env.PORT || 5000),
  dbHost: process.env.DB_HOST || '127.0.0.1',
  dbPort: Number(process.env.DB_PORT || 3306),
  dbSocket: process.env.DB_SOCKET || '',
  dbUser: process.env.DB_USER || 'root',
  dbPassword: process.env.DB_PASSWORD || '',
  dbName: process.env.DB_NAME || 'ecommerce_store',
  dbReconnectIntervalMs: Number(process.env.DB_RECONNECT_INTERVAL_MS || 15000),
  jwtSecret: process.env.JWT_SECRET || 'change_this_secret_before_production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  frontendOrigin: process.env.FRONTEND_ORIGIN || '*'
};
