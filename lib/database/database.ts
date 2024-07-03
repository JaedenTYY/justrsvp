import { sql } from '@vercel/postgres';

export async function connectToDatabase() {
  try {
    await sql`SELECT 1`; // This is a simple query to test the connection
    console.log('Connected to the database successfully');
  } catch (error) {
    console.error('Failed to connect to the database:', error);
    throw error;
  }
}

// You can export the sql function if you need to use it elsewhere
export { sql };