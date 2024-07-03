import { Pool } from '@vercel/postgres';
import { sql } from '@vercel/postgres';

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL
});

export default pool;