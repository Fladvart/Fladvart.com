import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET - Fetch hero video data
export async function GET() {
  try {
    const result = await pool.query(`
      SELECT 
        hv.*, 
        m.firebase_url as video_url, 
        m.original_filename, 
        m.file_type,
        mm.firebase_url as mobile_video_url,
        mm.original_filename as mobile_original_filename,
        mm.file_type as mobile_file_type
      FROM hero_videos hv
      LEFT JOIN media m ON hv.media_id = m.id
      LEFT JOIN media mm ON hv.mobile_media_id = mm.id
      WHERE hv.is_active = true 
      ORDER BY hv.created_at DESC 
      LIMIT 1
    `);

    if (result.rows.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No hero video found'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Hero video fetch error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch hero video'
    }, { status: 500 });
  }
}

// PUT - Update hero video
export async function PUT(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({
        success: false,
        error: 'Unauthorized'
      }, { status: 401 });
    }

    const body = await request.json();
    const { media_id, mobile_media_id, title_en, title_tr, description_en, description_tr } = body;

    // Validate required fields
    if (!media_id) {
      return NextResponse.json({
        success: false,
        error: 'Media ID is required'
      }, { status: 400 });
    }

    // Get current active hero video
    const currentResult = await pool.query(`
      SELECT id FROM hero_videos WHERE is_active = true LIMIT 1
    `);

    if (currentResult.rows.length > 0) {
      // Update existing
      const result = await pool.query(`
        UPDATE hero_videos 
        SET media_id = $1, mobile_media_id = $2, title_en = $3, title_tr = $4, 
            description_en = $5, description_tr = $6, updated_at = CURRENT_TIMESTAMP
        WHERE id = $7
        RETURNING *
      `, [media_id, mobile_media_id, title_en, title_tr, description_en, description_tr, currentResult.rows[0].id]);

      return NextResponse.json({
        success: true,
        data: result.rows[0],
        message: 'Hero video updated successfully'
      });
    } else {
      // Create new
      const result = await pool.query(`
        INSERT INTO hero_videos (media_id, mobile_media_id, title_en, title_tr, description_en, description_tr)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
      `, [media_id, mobile_media_id, title_en, title_tr, description_en, description_tr]);

      return NextResponse.json({
        success: true,
        data: result.rows[0],
        message: 'Hero video created successfully'
      });
    }

  } catch (error) {
    console.error('Hero video update error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to update hero video'
    }, { status: 500 });
  }
}
