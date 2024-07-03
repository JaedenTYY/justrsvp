import { sql } from '@vercel/postgres';

async function createEventTable() {
  const client = await sql.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS events (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        location VARCHAR(255),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        image_url VARCHAR(255) NOT NULL,
        start_date_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        end_date_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        price VARCHAR(255),
        is_free BOOLEAN DEFAULT FALSE,
        url VARCHAR(255),
        category_id INTEGER REFERENCES category(id),
        organizer_id INTEGER REFERENCES users(id)
      );
    `);
    console.log('Event table created successfully');
  } catch (error) {
    console.error('Error creating event table:', error);
  } finally {
    client.release();
  }
}

createEventTable();

export interface IEvent {
  id: number;
  title: string;
  description?: string;
  location?: string;
  created_at: Date;
  image_url: string;
  start_date_time: Date;
  end_date_time: Date;
  price?: string;
  is_free: boolean;
  url?: string;
  category_id: number;
  organizer_id: number;
}

export interface IEventWithDetails extends IEvent {
  category_name: string;
  organizer_first_name: string;
  organizer_last_name: string;
}

export class Event {
  static async create(event: Omit<IEvent, 'id' | 'created_at'>): Promise<IEvent> {
    const client = await sql.connect();
    try {
      const result = await client.query(
        `INSERT INTO events (title, description, location, image_url, start_date_time, end_date_time, price, is_free, url, category_id, organizer_id) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) 
         RETURNING *`,
        [event.title, event.description, event.location, event.image_url, event.start_date_time, event.end_date_time, event.price, event.is_free, event.url, event.category_id, event.organizer_id]
      );
      return result.rows[0];
    } finally {
      client.release();
    }
  }

  static async findById(id: number): Promise<IEventWithDetails | null> {
    const client = await sql.connect();
    try {
      const result = await client.query(`
        SELECT e.*, c.name as category_name, u.first_name as organizer_first_name, u.last_name as organizer_last_name
        FROM events e
        LEFT JOIN categories c ON e.category_id = c.id
        LEFT JOIN users u ON e.organizer_id = u.id
        WHERE e.id = $1
      `, [id]);
      return result.rows.length > 0 ? result.rows[0] : null;
    } finally {
      client.release();
    }
  }

  static async getAll(): Promise<IEventWithDetails[]> {
    const client = await sql.connect();
    try {
      const result = await client.query(`
        SELECT e.*, c.name as category_name, u.first_name as organizer_first_name, u.last_name as organizer_last_name
        FROM events e
        LEFT JOIN categories c ON e.category_id = c.id
        LEFT JOIN users u ON e.organizer_id = u.id
      `);
      return result.rows;
    } finally {
      client.release();
    }
  }

  static async update(id: number, eventData: Partial<IEvent>): Promise<IEvent | null> {
    const client = await sql.connect();
    try {
      const setClause = Object.keys(eventData)
        .map((key, index) => `${key} = $${index + 2}`)
        .join(', ');
      const values = Object.values(eventData);
      
      const result = await client.query(
        `UPDATE events SET ${setClause} WHERE id = $1 RETURNING *`,
        [id, ...values]
      );
      return result.rows.length > 0 ? result.rows[0] : null;
    } finally {
      client.release();
    }
  }

  static async delete(id: number): Promise<boolean> {
    const client = await sql.connect();
    try {
      const result = await client.query('DELETE FROM events WHERE id = $1', [id]);
      return result.rowCount ? result.rowCount > 0 : false;
    } finally {
      client.release();
    }
  }

  static async getEventsByOrganizer(organizerId: number): Promise<IEvent[]> {
    const client = await sql.connect();
    try {
      const result = await client.query('SELECT * FROM events WHERE organizer_id = $1', [organizerId]);
      return result.rows;
    } finally {
      client.release();
    }
  }

  static async removeOrganizer(organizerId: number): Promise<void> {
    const client = await sql.connect();
    try {
      await client.query('UPDATE events SET organizer_id = NULL WHERE organizer_id = $1', [organizerId]);
    } finally {
      client.release();
    }
  }
}

export default Event;