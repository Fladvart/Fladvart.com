import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';

// GET - Public CTA Section verisi (frontend için)
export async function GET(req: NextRequest) {
  try {
    const result = await pool.query(`
      SELECT 
        cs.*,
        m.firebase_url as background_image_url
      FROM cta_section cs
      LEFT JOIN media m ON cs.background_image_media_id = m.id
      WHERE cs.is_active = true
      ORDER BY cs.id DESC
      LIMIT 1
    `);

    if (result.rows.length === 0) {
      return NextResponse.json({ 
        success: false, 
        message: 'No CTA section found' 
      });
    }

    return NextResponse.json({
      success: true,
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Error fetching CTA section:', error);
    return NextResponse.json(
      { error: 'Failed to fetch CTA section' },
      { status: 500 }
    );
  }
}
