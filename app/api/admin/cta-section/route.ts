import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { pool } from '@/lib/db';

// GET - CTA Section verisini getir
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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


    // if (result.rows.length === 0) {
      
      // Default data from extend.sql
      // const defaultMarqueeItems = [
      //   { "text_en": "CREATIVE CONSULTANCY", "text_tr": "KREATİF DANIŞMANLIK" },
      //   { "text_en": "DIGITAL & MOTION EXPERIENCES", "text_tr": "DİJİTAL & HAREKET DENEYİMLERİ" },
      //   { "text_en": "CAMPAIGN & BRAND DESIGN", "text_tr": "KAMPANYA & MARKA TASARIMI" },
      //   { "text_en": "CREATIVE CONSULTANCY", "text_tr": "KREATİF DANIŞMANLIK" },
      //   { "text_en": "DIGITAL & MOTION EXPERIENCES", "text_tr": "DİJİTAL & HAREKET DENEYİMLERİ" }
      // ];

      // const insertResult = await pool.query(`
      //   INSERT INTO cta_section (
      //     main_title_en, main_title_tr,
      //     description_en, description_tr,
      //     button_text_en, button_text_tr,
      //     button_link,
      //     marquee_items,
      //     is_active
      //   ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true)
      //   RETURNING *
      // `, [
      //   'YOUR VISION DESERVES A TAILORED SOLUTION',
      //   'VİZYONUNUZ ÖZEL BİR ÇÖZÜM HAK EDİYOR',
      //   "SHARE YOUR GOALS AND WE'LL CRAFT A CUSTOM OFFER FOR YOUR BRAND.",
      //   'HEDEFLERİNİZİ PAYLAŞIN, MARKANIZ İÇİN ÖZEL BİR TEKLİF HAZIRLAYALIM.',
      //   "LET'S COLLABORATE",
      //   'İŞBİRLİĞİ YAPALIM',
      //   '#contact',
      //   JSON.stringify(defaultMarqueeItems)
      // ]);

    //   return NextResponse.json({
    //     success: true,
    //     data: insertResult.rows[0]
    //   });
    // }

    // Data transformation if needed
    let data = result.rows[0];
    
    // Fix legacy marquee_items format (string array -> object array)
    if (Array.isArray(data.marquee_items) && data.marquee_items.length > 0 && typeof data.marquee_items[0] === 'string') {
      data.marquee_items = data.marquee_items.map((text: string) => ({
        text_en: text,
        text_tr: text // Fallback for legacy data
      }));
    }

    return NextResponse.json({
      success: true,
      data: data
    });

  } catch (error) {
    console.error('Error fetching CTA section:', error);
    // Log the full error details
    if (error instanceof Error) {
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    return NextResponse.json(
      { 
        error: 'Failed to fetch CTA section',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// PUT - CTA Section güncelle
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      main_title_en,
      main_title_tr,
      description_en,
      description_tr,
      button_text_en,
      button_text_tr,
      button_link,
      background_image_media_id,
      marquee_items
    } = body;

    // Validation
    if (!main_title_en || !main_title_tr || !description_en || !description_tr) {
      return NextResponse.json(
        { error: 'Required fields are missing' },
        { status: 400 }
      );
    }

    // Marquee items array validation
    if (!Array.isArray(marquee_items)) {
      return NextResponse.json(
        { error: 'Marquee items must be an array' },
        { status: 400 }
      );
    }

    // Validate each marquee item has text_en and text_tr
    const invalidItems = marquee_items.filter(
      (item: any) => !item.text_en || !item.text_tr
    );
    
    if (invalidItems.length > 0) {
      return NextResponse.json(
        { error: 'Each marquee item must have text_en and text_tr' },
        { status: 400 }
      );
    }

    // Check if CTA section exists
    const checkResult = await pool.query('SELECT id FROM cta_section LIMIT 1');

    let result;
    if (checkResult.rows.length === 0) {
      // Insert new record
      result = await pool.query(`
        INSERT INTO cta_section (
          main_title_en, main_title_tr,
          description_en, description_tr,
          button_text_en, button_text_tr,
          button_link,
          background_image_media_id,
          marquee_items,
          updated_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
        RETURNING *
      `, [
        main_title_en, main_title_tr,
        description_en, description_tr,
        button_text_en, button_text_tr,
        button_link || '#contact',
        background_image_media_id || null,
        JSON.stringify(marquee_items)
      ]);
    } else {
      // Update existing record
      result = await pool.query(`
        UPDATE cta_section
        SET 
          main_title_en = $1,
          main_title_tr = $2,
          description_en = $3,
          description_tr = $4,
          button_text_en = $5,
          button_text_tr = $6,
          button_link = $7,
          background_image_media_id = $8,
          marquee_items = $9,
          updated_at = NOW()
        WHERE id = $10
        RETURNING *
      `, [
        main_title_en, main_title_tr,
        description_en, description_tr,
        button_text_en, button_text_tr,
        button_link || '#contact',
        background_image_media_id || null,
        JSON.stringify(marquee_items),
        checkResult.rows[0].id
      ]);
    }

    return NextResponse.json({
      success: true,
      message: 'CTA section updated successfully',
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Error updating CTA section:', error);
    return NextResponse.json(
      { error: 'Failed to update CTA section' },
      { status: 500 }
    );
  }
}
