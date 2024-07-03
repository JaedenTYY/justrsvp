import pool from '../database';
import { CreateUserParams, UpdateUserParams } from '@/types';
import { sql } from '@vercel/postgres';


async function createUserTable() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        clerk_id VARCHAR(255) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        username VARCHAR(255) UNIQUE NOT NULL,
        first_name VARCHAR(255) NOT NULL,
        last_name VARCHAR(255) NOT NULL,
        photo VARCHAR(255) NOT NULL
      );
    `);
    console.log('User table created successfully');
  } catch (error) {
    console.error('Error creating user table:', error);
  } finally {
    client.release();
  }
}

createUserTable();

export interface IUser {
  id: number;
  clerk_id: string;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  photo: string;
}

export class User {
  static async create(user: CreateUserParams): Promise<IUser> {
    const client = await pool.connect();
    try {
      const result = await client.query(
        `INSERT INTO users (clerk_id, email, username, first_name, last_name, photo) 
         VALUES ($1, $2, $3, $4, $5, $6) 
         RETURNING *`,
        [user.clerkId, user.email, user.username, user.firstName, user.lastName, user.photo]
      );
      return result.rows[0];
    } finally {
      client.release();
    }
  }

  static async findById(id: number): Promise<IUser | null> {
    const client = await pool.connect();
    try {
      const result = await client.query('SELECT * FROM users WHERE id = $1', [id]);
      return result.rows.length > 0 ? result.rows[0] : null;
    } finally {
      client.release();
    }
  }

  static async findByClerkId(clerkId: string): Promise<IUser | null> {
    const client = await pool.connect();
    try {
      const result = await client.query('SELECT * FROM users WHERE clerk_id = $1', [clerkId]);
      return result.rows.length > 0 ? result.rows[0] : null;
    } finally {
      client.release();
    }
  }

  static async updateByClerkId(clerkId: string, updateData: UpdateUserParams): Promise<IUser | null> {
    const client = await pool.connect();
    try {
      const setClause = Object.keys(updateData)
        .map((key, index) => `${key} = $${index + 2}`)
        .join(', ');
      const values = Object.values(updateData);
      
      const result = await client.query(
        `UPDATE users SET ${setClause} WHERE clerk_id = $1 RETURNING *`,
        [clerkId, ...values]
      );
      return result.rows.length > 0 ? result.rows[0] : null;
    } finally {
      client.release();
    }
  }

  static async delete(id: number): Promise<IUser | null> {
    const client = await pool.connect();
    try {
      const result = await client.query('DELETE FROM users WHERE id = $1 RETURNING *', [id]);
      return result.rows.length > 0 ? result.rows[0] : null;
    } finally {
      client.release();
    }
  }
}