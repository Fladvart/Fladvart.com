import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { pool } from '@/lib/db';

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { main_title_en, main_title_tr, main_image_media_id } = body;

    // Check if collection exists
    const existingCollection = await pool.query(
      'SELECT id FROM service_collections LIMIT 1'
    );

    let result;
    if (existingCollection.rows.length > 0) {
      // Update existing
      result = await pool.query(
        `UPDATE service_collections 
         SET main_title_en = $1, main_title_tr = $2, main_image_media_id = $3, updated_at = NOW()
         WHERE id = $4
         RETURNING *`,
        [main_title_en, main_title_tr, main_image_media_id, existingCollection.rows[0].id]
      );
    } else {
      // Create new
      result = await pool.query(
        `INSERT INTO service_collections (main_title_en, main_title_tr, main_image_media_id)
         VALUES ($1, $2, $3)
         RETURNING *`,
        [main_title_en, main_title_tr, main_image_media_id]
      );
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating service settings:', error);
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    );
  }
}
