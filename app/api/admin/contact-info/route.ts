import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET - Fetch contact info
export async function GET() {
  try {
    const result = await pool.query(`
      SELECT * FROM contact_info 
      LIMIT 1
    `);

    if (result.rows.length === 0) {
      return NextResponse.json(null);
    }

    return NextResponse.json(result.rows[0]);

  } catch (error) {
    console.error('Contact info fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch contact info' },
      { status: 500 }
    );
  }
}

// PUT - Update contact info
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      email,
      phone,
      address_tr,
      address_en,
      linkedin_url,
      instagram_url
    } = body;

    // Check if contact info exists
    const existingResult = await pool.query('SELECT id FROM contact_info LIMIT 1');

    let result;
    if (existingResult.rows.length > 0) {
      // Update existing
      result = await pool.query(
        `UPDATE contact_info 
         SET email = $1, phone = $2, address_tr = $3, address_en = $4,
             linkedin_url = $5, instagram_url = $6, updated_at = NOW()
         WHERE id = $7
         RETURNING *`,
        [email, phone, address_tr, address_en, linkedin_url, instagram_url, existingResult.rows[0].id]
      );
    } else {
      // Create new
      result = await pool.query(
        `INSERT INTO contact_info (email, phone, address_tr, address_en, linkedin_url, instagram_url)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [email, phone, address_tr, address_en, linkedin_url, instagram_url]
      );
    }

    return NextResponse.json(result.rows[0]);

  } catch (error) {
    console.error('Contact info update error:', error);
    return NextResponse.json(
      { error: 'Failed to update contact info' },
      { status: 500 }
    );
  }
}
