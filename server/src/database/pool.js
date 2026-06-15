import mysql from 'mysql2/promise';

import { env } from '../config/env.js';

const poolConfig = {
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

if (env.dbSocket) {
  poolConfig.socketPath = env.dbSocket;
} else {
  poolConfig.host = env.dbHost;
  poolConfig.port = env.dbPort;
}

poolConfig.user = env.dbUser;
poolConfig.password = env.dbPassword;
poolConfig.database = env.dbName;

// Automatically enable SSL for remote databases (like Aiven)
if (env.dbHost && !env.dbHost.includes('localhost') && !env.dbHost.includes('127.0.0.1') && !env.dbSocket) {
  poolConfig.ssl = {
    rejectUnauthorized: false
  };
}

export const pool = mysql.createPool(poolConfig);

const databaseState = {
  ready: false,
  lastCheckedAt: null,
  lastError: null
};

export function getDatabaseTarget() {
  return env.dbSocket || `${env.dbHost}:${env.dbPort}`;
}

export function getDatabaseState() {
  return { ...databaseState };
}

export async function testConnection() {
  let connection;

  try {
    connection = await pool.getConnection();
    await connection.ping();
    databaseState.ready = true;
    databaseState.lastError = null;
    databaseState.lastCheckedAt = new Date().toISOString();
    console.log(
      `Connected to MySQL database "${env.dbName}" at ${getDatabaseTarget()}`
    );
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

export async function refreshDatabaseState() {
  try {
    await testConnection();
    return true;
  } catch (error) {
    databaseState.ready = false;
    databaseState.lastError = error.message;
    databaseState.lastCheckedAt = new Date().toISOString();
    return false;
  }
}

export async function startDatabaseMonitor() {
  const checkDatabase = async () => {
    const wasReady = databaseState.ready;
    const isReady = await refreshDatabaseState();

    if (!wasReady && isReady) {
      console.log(
        `MySQL connection restored. API routes are live on ${getDatabaseTarget()}`
      );
    }

    if (wasReady && !isReady) {
      console.warn(
        `MySQL connection lost. API routes will stay in maintenance mode until the database is back.`
      );
    }

    return isReady;
  };

  const initialReady = await checkDatabase();
  const timer = setInterval(() => {
    checkDatabase().catch(() => {});
  }, env.dbReconnectIntervalMs);

  timer.unref();
  return initialReady;
}

export function isDatabaseReady() {
  return databaseState.ready;
}

