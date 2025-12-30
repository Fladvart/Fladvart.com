import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function GET() {
  try {
    const result = await pool.query(`
      SELECT pc.*, p.title as page_title 
      FROM page_contents pc
      JOIN pages p ON pc.page_id = p.id
      WHERE p.slug = 'homepage' AND pc.is_active = true
      ORDER BY pc.order_no ASC
    `);

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error fetching homepage content:', error);
    return NextResponse.json(
      { error: 'Failed to fetch content' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { content_type, content_text, order_no } = body;

    if (!content_type || !content_text) {
      return NextResponse.json(
        { error: 'Content type and text are required' },
        { status: 400 }
      );
    }

    // Get homepage id
    const pageResult = await pool.query(
      'SELECT id FROM pages WHERE slug = $1',
      ['homepage']
    );

    if (pageResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Homepage not found' },
        { status: 404 }
      );
    }

    const pageId = pageResult.rows[0].id;

    const result = await pool.query(`
      INSERT INTO page_contents (page_id, content_type, content_text, order_no)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [pageId, content_type, content_text, order_no || 1]);

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error('Error creating homepage content:', error);
    return NextResponse.json(
      { error: 'Failed to create content' },
      { status: 500 }
    );
  }
}
