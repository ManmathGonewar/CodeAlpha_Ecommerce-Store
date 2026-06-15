import cors from 'cors';
import express from 'express';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';

import { env } from './src/config/env.js';
import {
  getDatabaseState,
  getDatabaseTarget,
  startDatabaseMonitor
} from './src/database/pool.js';
import { requireDatabase } from './src/middleware/databaseMiddleware.js';
import { errorHandler, notFound } from './src/middleware/errorHandler.js';
import apiRouter from './src/routes/index.js';

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const clientPath = path.resolve(__dirname, '../client');
const uploadsPath = path.resolve(__dirname, './uploads');

app.use(
  cors({
    origin: env.frontendOrigin === '*' ? true : env.frontendOrigin
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

app.use('/uploads', express.static(uploadsPath));
app.use(express.static(clientPath));

app.get('/health', (req, res) => {
  const database = getDatabaseState();

  res.json({
    status: database.ready ? 'ok' : 'degraded',
    service: 'codealpha-store-api',
    database: {
      name: env.dbName,
      target: getDatabaseTarget(),
      ready: database.ready,
      lastCheckedAt: database.lastCheckedAt,
      lastError: database.lastError
    }
  });
});

app.use('/api', requireDatabase, apiRouter);

app.use(notFound);
app.use(errorHandler);

async function startServer() {
  const databaseReady = await startDatabaseMonitor();

  app.listen(env.port, () => {
    console.log(`CodeAlpha Store running on http://localhost:${env.port}`);

    if (databaseReady) {
      console.log(`API is connected to MySQL database "${env.dbName}"`);
    } else {
      console.warn(
        `MySQL is not available at ${getDatabaseTarget()}. Static UI is live, but API routes will return 503 until the database starts.`
      );
    }
  });
}

startServer();
