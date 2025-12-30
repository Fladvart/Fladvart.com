import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function GET() {
  try {
    // latest section
    const sectionResult = await pool.query(`
      SELECT *
      FROM why_sections
      ORDER BY created_at DESC
      LIMIT 1
    `);

    if (sectionResult.rows.length === 0) {
      return NextResponse.json({ success: false, error: "No content found" }, { status: 404 });
    }

    const section = sectionResult.rows[0];

    // videos (why_videos + media)
    const videosResult = await pool.query(
      `
      SELECT wv.video_position, wv.media_id, m.firebase_url AS url
      FROM why_videos wv
      LEFT JOIN media m ON m.id = wv.media_id
      WHERE wv.section_id = $1
      ORDER BY wv.video_position ASC
      `,
      [section.id]
    );

    const videosObj: { video_1: string | null; video_2: string | null } = {
      video_1: null,
      video_2: null,
    };

    for (const row of videosResult.rows) {
      if (row.video_position === 1) videosObj.video_1 = row.url ?? null;
      if (row.video_position === 2) videosObj.video_2 = row.url ?? null;
    }

    // (Opsiyonel) eski image sistemi kalsın istiyorsan:
    const imagesResult = await pool.query(
      `
      SELECT wi.image_position, wi.media_id, m.firebase_url AS url
      FROM why_images wi
      LEFT JOIN media m ON m.id = wi.media_id
      WHERE wi.section_id = $1
      ORDER BY wi.image_position ASC
      `,
      [section.id]
    );

    const imagesObj: { image_1: string | null; image_2: string | null; image_3: string | null } = {
      image_1: null,
      image_2: null,
      image_3: null,
    };

    for (const row of imagesResult.rows) {
      if (row.image_position === 1) imagesObj.image_1 = row.url ?? null;
      if (row.image_position === 2) imagesObj.image_2 = row.url ?? null;
      if (row.image_position === 3) imagesObj.image_3 = row.url ?? null;
    }

    return NextResponse.json({
      success: true,
      data: {
        ...section,
        videos: videosObj,
        images: imagesObj, // istersen bunu kaldırabiliriz
      },
    });
  } catch (error) {
    console.error("Public why-we-exist error:", error);
    return NextResponse.json({ success: false, error: "Failed" }, { status: 500 });
  }
}