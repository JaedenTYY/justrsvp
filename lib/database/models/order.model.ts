import pool from '../database';

async function createOrderTable() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS order (
        id SERIAL PRIMARY KEY,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        stripe_id VARCHAR(255) UNIQUE NOT NULL,
        total_amount VARCHAR(255),
        event_id INTEGER REFERENCES event(id),
        buyer_id INTEGER REFERENCES user(id)
      );
    `);
    console.log('Order table created successfully');
  } catch (error) {
    console.error('Error creating order table:', error);
  } finally {
    client.release();
  }
}
createOrderTable();

export interface IOrder {
  id: number;
  created_at: Date;
  stripe_id: string;
  total_amount: string;
  event_id: number;
  buyer_id: number;
}

export interface IOrderItem {
  id: number;
  total_amount: string;
  created_at: Date;
  event_title: string;
  event_id: number;
  buyer: string;
}

export class Order {
  static async create(order: Omit<IOrder, 'id' | 'created_at'>): Promise<IOrder> {
    const client = await pool.connect();
    try {
      const result = await client.query(
        `INSERT INTO order (stripe_id, total_amount, event_id, buyer_id) 
         VALUES ($1, $2, $3, $4) 
         RETURNING *`,
        [order.stripe_id, order.total_amount, order.event_id, order.buyer_id]
      );
      return result.rows[0];
    } finally {
      client.release();
    }
  }

  static async findByStripeId(stripeId: string): Promise<IOrder | null> {
    const client = await pool.connect();
    try {
      const result = await client.query('SELECT * FROM orders WHERE stripe_id = $1', [stripeId]);
      return result.rows.length > 0 ? result.rows[0] : null;
    } finally {
      client.release();
    }
  }

  static async getOrdersByEvent(eventId: number): Promise<IOrder[]> {
    const client = await pool.connect();
    try {
      const result = await client.query('SELECT * FROM order WHERE event_id = $1', [eventId]);
      return result.rows;
    } finally {
      client.release();
    }
  }

  static async getOrdersByUser(userId: number): Promise<IOrder[]> {
    const client = await pool.connect();
    try {
      const result = await client.query('SELECT * FROM order WHERE buyer_id = $1', [userId]);
      return result.rows;
    } finally {
      client.release();
    }
  }

  static async getOrdersWithDetails(): Promise<IOrderItem[]> {
    const client = await pool.connect();
    try {
      const result = await client.query(`
        SELECT 
          o.id, 
          o.total_amount, 
          o.created_at, 
          e.title as event_title, 
          e.id as event_id,
          CONCAT(u.first_name, ' ', u.last_name) as buyer
        FROM 
          order o
        JOIN 
          events e ON o.event_id = e.id
        JOIN 
          users u ON o.buyer_id = u.id
      `);
      return result.rows;
    } finally {
      client.release();
    }
  }
  static async removeBuyer(buyerId: number): Promise<void> {
    const client = await pool.connect();
    try {
      await client.query('UPDATE orders SET buyer_id = NULL WHERE buyer_id = $1', [buyerId]);
    } finally {
      client.release();
    }
  }
  // Add other methods as needed (update, delete, etc.)
}

export default Order;