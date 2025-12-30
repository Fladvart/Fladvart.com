import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const result = await pool.query(`
      SELECT 
        s.id,
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
      WHERE s.slug = $1 AND s.is_active = true
    `, [slug]);

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 });
    }

    const service = result.rows[0];

    // Get tags
    const tagsResult = await pool.query(
      'SELECT tag_en, tag_tr FROM service_tags WHERE service_id = $1',
      [service.id]
    );

    return NextResponse.json({
      ...service,
      tags: tagsResult.rows
    });
  } catch (error) {
    console.error('Error fetching service:', error);
    return NextResponse.json(
      { error: 'Failed to fetch service' },
      { status: 500 }
    );
  }
}
