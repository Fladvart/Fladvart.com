import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET - Fetch why we exist data (section + videos)
export async function GET() {
  try {
    // Get latest why section data
    const sectionResult = await pool.query(`
      SELECT * FROM why_sections
      ORDER BY created_at DESC
      LIMIT 1
    `);

    if (sectionResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No why we exist content found' },
        { status: 404 }
      );
    }

    const section = sectionResult.rows[0];

    // Get videos for this section (position 1-2)
    const videosResult = await pool.query(
      `
      SELECT wv.*, m.firebase_url as url, m.original_filename as filename, m.file_type
      FROM why_videos wv
      LEFT JOIN media m ON wv.media_id = m.id
      WHERE wv.section_id = $1
      ORDER BY wv.video_position ASC
      `,
      [section.id]
    );

    return NextResponse.json({
      success: true,
      data: {
        section,
        videos: videosResult.rows,
      },
    });
  } catch (error) {
    console.error('Why we exist fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch why we exist content' },
      { status: 500 }
    );
  }
}

// PUT - Update why we exist content (section + videos)
export async function PUT(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    const {
      main_title_tr,
      main_title_en,
      left_title_tr,
      left_title_en,
      right_paragraph_1_tr,
      right_paragraph_1_en,
      right_paragraph_2_tr,
      right_paragraph_2_en,
      bottom_text_tr,
      bottom_text_en,

      // NEW:
      video_1_media_id,
      video_2_media_id,
    } = body;

    // Validate required fields
    if (!main_title_en || !main_title_tr) {
      return NextResponse.json(
        { success: false, error: 'Main title in both languages is required' },
        { status: 400 }
      );
    }

    // Get current section (latest)
    const currentResult = await pool.query(`
      SELECT id FROM why_sections
      ORDER BY created_at DESC
      LIMIT 1
    `);

    let sectionId: number;

    if (currentResult.rows.length > 0) {
      sectionId = currentResult.rows[0].id;

      await pool.query(
        `
        UPDATE why_sections
        SET main_title_tr = $1, main_title_en = $2,
            left_title_tr = $3, left_title_en = $4,
            right_paragraph_1_tr = $5, right_paragraph_1_en = $6,
            right_paragraph_2_tr = $7, right_paragraph_2_en = $8,
            bottom_text_tr = $9, bottom_text_en = $10,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $11
        `,
        [
          main_title_tr,
          main_title_en,
          left_title_tr,
          left_title_en,
          right_paragraph_1_tr,
          right_paragraph_1_en,
          right_paragraph_2_tr,
          right_paragraph_2_en,
          bottom_text_tr,
          bottom_text_en,
          sectionId,
        ]
      );
    } else {
      const newSectionResult = await pool.query(
        `
        INSERT INTO why_sections (
          main_title_tr, main_title_en,
          left_title_tr, left_title_en,
          right_paragraph_1_tr, right_paragraph_1_en,
          right_paragraph_2_tr, right_paragraph_2_en,
          bottom_text_tr, bottom_text_en
        )
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
        RETURNING id
        `,
        [
          main_title_tr,
          main_title_en,
          left_title_tr,
          left_title_en,
          right_paragraph_1_tr,
          right_paragraph_1_en,
          right_paragraph_2_tr,
          right_paragraph_2_en,
          bottom_text_tr,
          bottom_text_en,
        ]
      );
      sectionId = newSectionResult.rows[0].id;
    }

    // Helper: Upsert each video slot
    const upsertVideo = async (position: 1 | 2, mediaId: number | null) => {
      // If mediaId is null/undefined, we still want the row to exist; we can store NULL
      await pool.query(
        `
        INSERT INTO why_videos (section_id, video_position, media_id)
        VALUES ($1, $2, $3)
        ON CONFLICT (section_id, video_position)
        DO UPDATE SET media_id = EXCLUDED.media_id
        `,
        [sectionId, position, mediaId]
      );
    };

    // Upsert 2 slots (even if null, keeps consistency)
    await upsertVideo(1, video_1_media_id ?? null);
    await upsertVideo(2, video_2_media_id ?? null);

    // Return updated data
    const updatedSection = await pool.query(`SELECT * FROM why_sections WHERE id = $1`, [sectionId]);

    const updatedVideos = await pool.query(
      `
      SELECT wv.*, m.firebase_url as url, m.original_filename as filename, m.file_type
      FROM why_videos wv
      LEFT JOIN media m ON wv.media_id = m.id
      WHERE wv.section_id = $1
      ORDER BY wv.video_position ASC
      `,
      [sectionId]
    );

    return NextResponse.json({
      success: true,
      data: {
        section: updatedSection.rows[0],
        videos: updatedVideos.rows,
      },
      message: 'Why we exist content updated successfully',
    });
  } catch (error) {
    console.error('Why we exist update error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update why we exist content' },
      { status: 500 }
    );
  }
}