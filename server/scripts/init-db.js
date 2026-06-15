import fs from 'fs';
import mysql from 'mysql2/promise';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from server/.env
dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function init() {
  const dbHost = process.env.DB_HOST;
  const dbPort = Number(process.env.DB_PORT || 3306);
  const dbUser = process.env.DB_USER;
  const dbPassword = process.env.DB_PASSWORD || process.env.DB_PASS || '';
  const dbName = process.env.DB_NAME;

  if (!dbHost || !dbUser || !dbName) {
    console.error('Error: Please fill in DB_HOST, DB_USER, and DB_NAME in your server/.env file.');
    process.exit(1);
  }

  console.log(`Connecting to database at ${dbHost}:${dbPort} as ${dbUser}...`);

  let connection;
  try {
    const connectionConfig = {
      host: dbHost,
      port: dbPort,
      user: dbUser,
      password: dbPassword,
    };

    if (dbHost && !dbHost.includes('localhost') && !dbHost.includes('127.0.0.1')) {
      connectionConfig.ssl = {
        rejectUnauthorized: false
      };
    }

    // Connect to database
    connection = await mysql.createConnection(connectionConfig);

    console.log('Connected successfully!');

    // Create database if it doesn't exist (if permitted)
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``).catch(err => {
      console.log('Note: Could not run CREATE DATABASE (normal for cloud MySQL where database is pre-created).');
    });
    
    // Select the database
    await connection.query(`USE \`${dbName}\``);

    // Helper to run queries from SQL file
    const runSqlFile = async (filePath) => {
      const sql = fs.readFileSync(filePath, 'utf8');
      
      // Split by semicolon followed by newline/carriage return to avoid breaking inline semicolons
      const statements = sql
        .split(/;\s*[\r\n]+/)
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('USE') && !s.startsWith('CREATE DATABASE'));

      for (const statement of statements) {
        await connection.query(statement);
      }
    };

    const schemaPath = path.resolve(__dirname, '../src/database/schema.sql');
    console.log('Applying schema.sql...');
    await runSqlFile(schemaPath);
    console.log('Schema applied successfully.');

    const seedPath = path.resolve(__dirname, '../src/database/seed.sql');
    console.log('Applying seed.sql...');
    await runSqlFile(seedPath);
    console.log('Seed data applied successfully!');

    console.log('Database initialization complete! Your database is ready.');
  } catch (error) {
    console.error('Database initialization failed:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

init();
