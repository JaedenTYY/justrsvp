import { sql } from '@vercel/postgres';
import { CreateCategoryParams } from '@/types';

export interface ICategory {
  id: string;
  name: string;
}

export class Category {
  static async create({ categoryName }: CreateCategoryParams): Promise<ICategory> {
    const result = await sql<ICategory>`
      INSERT INTO category (name) 
      VALUES (${categoryName}) 
      RETURNING id::text, name
    `;
    return result.rows[0];
  }

  static async findAll(): Promise<ICategory[]> {
    const result = await sql<ICategory>`
      SELECT id::text, name FROM category
    `;
    return result.rows;
  }

  static async findByName(categoryName: string): Promise<ICategory | null> {
    const result = await sql<ICategory>`
      SELECT id::text, name FROM category 
      WHERE name = ${categoryName} 
      LIMIT 1
    `;
    return result.rows[0] || null;
  }
}
