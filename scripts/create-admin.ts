import bcrypt from 'bcryptjs';
import { pool } from '@/lib/db';

async function createAdminUser() {
  try {
    // Şifreyi hash'le
    const hashedPassword = await bcrypt.hash('admin123', 12);
    
    // Admin kullanıcısını oluştur
    const result = await pool.query(`
      INSERT INTO users (name, email, password_hash, role, is_active)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (email) 
      DO UPDATE SET 
        password_hash = EXCLUDED.password_hash,
        is_active = EXCLUDED.is_active
      RETURNING *
    `, ['Admin User', 'admin@fladvart.com', hashedPassword, 'admin', true]);

    console.log('Admin user created/updated:', result.rows[0]);
    console.log('Email: admin@fladvart.com');
    console.log('Password: admin123');
    
  } catch (error) {
    console.error(' Error creating admin user:', error);
  } finally {
    await pool.end();
  }
}

createAdminUser();
