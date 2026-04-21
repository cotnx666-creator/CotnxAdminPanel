import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const pool = new Pool(process.env.DATABASE_URL ? {
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
} : {
  // Dummy config if no DATABASE_URL to prevent immediate crash
  host: 'localhost',
  port: 5432,
  user: 'none',
  password: 'none',
  database: 'none'
});

pool.on('connect', () => {
  console.log('Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

export const query = (text, params) => pool.query(text, params);

export const initDb = async () => {
  if (!process.env.DATABASE_URL) {
    console.warn('DATABASE_URL missing. Database initialization skipped.');
    return;
  }
  
  let client;
  try {
    client = await pool.connect();
    await client.query('BEGIN');
    
    // Users table
    await client.query(`CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      role VARCHAR(50) DEFAULT 'Staff',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);

    // Categories table
    await client.query(`CREATE TABLE IF NOT EXISTS categories (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) UNIQUE NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);

    // Subcategories table
    await client.query(`CREATE TABLE IF NOT EXISTS subcategories (
      id SERIAL PRIMARY KEY,
      category_id INTEGER REFERENCES categories(id) ON DELETE CASCADE,
      name VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(category_id, name)
    )`);

    // Products table
    await client.query(`CREATE TABLE IF NOT EXISTS products (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      buying_price DECIMAL(15,2) NOT NULL,
      selling_price DECIMAL(15,2) NOT NULL,
      category VARCHAR(255) NOT NULL,
      subcategory VARCHAR(255),
      stock INTEGER DEFAULT 0,
      sku VARCHAR(100) UNIQUE,
      discount DECIMAL(5,2) DEFAULT 0,
      sizes TEXT, -- JSON string
      colors TEXT, -- JSON string
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);

    // Product Images table
    await client.query(`CREATE TABLE IF NOT EXISTS product_images (
      id SERIAL PRIMARY KEY,
      product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
      image_url TEXT NOT NULL
    )`);

    // Customers table
    await client.query(`CREATE TABLE IF NOT EXISTS customers (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      phone VARCHAR(50) UNIQUE NOT NULL,
      address TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);

    // Orders table
    await client.query(`CREATE TABLE IF NOT EXISTS orders (
      id SERIAL PRIMARY KEY,
      customer_id INTEGER REFERENCES customers(id),
      customer_name VARCHAR(255),
      customer_phone VARCHAR(50),
      customer_address TEXT,
      total_amount DECIMAL(15,2) NOT NULL,
      status VARCHAR(50) DEFAULT 'Pending',
      payment_status VARCHAR(50) DEFAULT 'Pending',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);

    // Order Items table
    await client.query(`CREATE TABLE IF NOT EXISTS order_items (
      id SERIAL PRIMARY KEY,
      order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
      product_id INTEGER REFERENCES products(id),
      quantity INTEGER NOT NULL,
      price DECIMAL(15,2) NOT NULL
    )`);

    // Inventory Logs table
    await client.query(`CREATE TABLE IF NOT EXISTS inventory_logs (
      id SERIAL PRIMARY KEY,
      product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
      type VARCHAR(20) NOT NULL,
      quantity INTEGER NOT NULL,
      reason TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);

    // Activity Logs table
    await client.query(`CREATE TABLE IF NOT EXISTS activity_logs (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id),
      action VARCHAR(255) NOT NULL,
      details TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);

    // Partners table
    await client.query(`CREATE TABLE IF NOT EXISTS partners (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      initial_investment DECIMAL(15,2) NOT NULL DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);

    // Partner Transactions table
    await client.query(`CREATE TABLE IF NOT EXISTS partner_transactions (
      id SERIAL PRIMARY KEY,
      partner_id INTEGER REFERENCES partners(id) ON DELETE CASCADE,
      type VARCHAR(50) NOT NULL,
      amount DECIMAL(15,2) NOT NULL,
      date VARCHAR(50) NOT NULL,
      notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);

    // Expenses table
    await client.query(`CREATE TABLE IF NOT EXISTS expenses (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      amount DECIMAL(15,2) NOT NULL,
      category VARCHAR(100) NOT NULL,
      date VARCHAR(50) NOT NULL,
      notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);

    // Create Indexes for performance
    await client.query(`CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_partner_transactions_partner_id ON partner_transactions(partner_id)`);

    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error initializing database:', err);
  } finally {
    client.release();
  }
};

export default pool;
