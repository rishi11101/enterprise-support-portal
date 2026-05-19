import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();
const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

pool.connect()
  .then(() => console.log('Database connection: SUCCESS 🔥'))
  .catch(err => console.error('Database connection: FAILED ❌', err.stack));

export const query = (text, params) => pool.query(text, params);