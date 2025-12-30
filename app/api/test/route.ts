import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function GET() {
  try {
    
    // Database connection test
    const result = await pool.query('SELECT NOW() as current_time');
    
    // Tables check
    const tables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    
    return NextResponse.json({
      success: true,
      message: 'Database connection successful!',
      env_check: {
        DB_USER: !!process.env.DB_USER,
        DB_HOST: !!process.env.DB_HOST,
        DB_NAME: !!process.env.DB_NAME,
        DB_PASSWORD: !!process.env.DB_PASSWORD,
        DB_PORT: !!process.env.DB_PORT
      },
      current_time: result.rows[0].current_time,
      available_tables: tables.rows.map(row => row.table_name)
    });
  } catch (error) {
    console.error('❌ Database test error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        env_check: {
          DB_USER: !!process.env.DB_USER,
          DB_HOST: !!process.env.DB_HOST,
          DB_NAME: !!process.env.DB_NAME,
          DB_PASSWORD: !!process.env.DB_PASSWORD,
          DB_PORT: !!process.env.DB_PORT
        }
      },
      { status: 500 }
    );
  }
}
