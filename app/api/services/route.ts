import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function GET() {
  try {
    // Get service collection
    const collectionResult = await pool.query(`
      SELECT sc.*, m.firebase_url as main_image_url
      FROM service_collections sc
      LEFT JOIN media m ON sc.main_image_media_id = m.id
      LIMIT 1
    `);

    const collection = collectionResult.rows[0] || null;

    // Get all active services
    const servicesResult = await pool.query(`
      SELECT 
        s.id,
        s.order_number,
        s.title_en,
        s.title_tr,
        s.slug
      FROM services s
      WHERE s.is_active = true
      ORDER BY s.order_number ASC
    `);

    return NextResponse.json({
      collection,
      services: servicesResult.rows
    });

  } catch (error) {
    console.error('Services fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch services' },
      { status: 500 }
    );
  }
}
