import pool from '../database';
import { sql } from '@vercel/postgres';

async function createCategoryTable() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS category (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL
      );
    `);
    console.log('Category table created successfully');
  } catch (error) {
    console.error('Error creating category table:', error);
  } finally {
    client.release();
  }
}
createCategoryTable();

export interface ICategory {
  id: string;
  name: string;
}

export class Category {
  static async create(name: string): Promise<ICategory> {
    const client = await pool.connect();
    try {
      const result = await client.query(
        'INSERT INTO category (name) VALUES ($1) RETURNING *',
        [name]
      );
      return result.rows[0];
    } finally {
      client.release();
    }
  }

  static async findAll(): Promise<ICategory[]> {
    const client = await pool.connect();
    try {
      const result = await client.query('SELECT * FROM category');
      return result.rows;
    } finally {
      client.release();
    }
  }

  // Add other methods as needed (findById, update, delete, etc.)
}