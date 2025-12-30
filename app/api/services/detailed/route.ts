import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function GET() {
  try {
    // Get all active services with full details
    const servicesResult = await pool.query(`
      SELECT 
        s.id,
        s.order_number,
        s.title_en,
        s.title_tr,
        s.slug,
        sc.middle_title_en,
        sc.middle_title_tr,
        sc.paragraph_1_en,
        sc.paragraph_1_tr,
        sc.paragraph_2_en,
        sc.paragraph_2_tr,
        m.firebase_url as image_url
      FROM services s
      LEFT JOIN service_contents sc ON s.id = sc.service_id
      LEFT JOIN media m ON sc.image_media_id = m.id
      WHERE s.is_active = true
      ORDER BY s.order_number ASC
      LIMIT 5
    `);

    const services = servicesResult.rows;

    // Get tags for each service
    for (let service of services) {
      const tagsResult = await pool.query(`
        SELECT tag_en, tag_tr
        FROM service_tags
        WHERE service_id = $1
        ORDER BY id ASC
      `, [service.id]);
      
      service.tags = tagsResult.rows;
    }

    return NextResponse.json({
      success: true,
      services
    });

  } catch (error) {
    console.error('Detailed services fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch services' },
      { status: 500 }
    );
  }
}
