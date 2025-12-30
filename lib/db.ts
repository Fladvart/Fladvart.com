import { Pool } from 'pg';

// Environment variables kontrolü
if (!process.env.DB_PASSWORD) {
  throw new Error('DB_PASSWORD environment variable is required');
}

if (!process.env.DB_USER) {
  throw new Error('DB_USER environment variable is required');
}

if (!process.env.DB_NAME) {
  throw new Error('DB_NAME environment variable is required');
}

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT || '5432'),
  ssl: {
    rejectUnauthorized: false
  },
  // Connection pool settings
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 10000, // Return an error after 10 seconds if connection could not be established
  keepAlive: true, // Enable TCP keep-alive
  keepAliveInitialDelayMillis: 10000, // Start keep-alive after 10 seconds
});

// Handle pool errors
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  // Don't exit the process, just log the error
});

export { pool };

// Database types
export interface User {
  id: number;
  name: string;
  email: string;
  password_hash: string;
  role: 'admin' | 'editor';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Page {
  id: number;
  slug: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface PageContent {
  id: number;
  page_id: number;
  content_type: 'heading' | 'paragraph' | 'image';
  content_text?: string;
  content_url?: string;
  order_no: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
