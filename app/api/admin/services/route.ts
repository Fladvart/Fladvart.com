import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET - Fetch services with collection info
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

    // Get all services
    const servicesResult = await pool.query(`
      SELECT 
        s.id,
        s.collection_id,
        s.order_number,
        s.title_en,
        s.title_tr,
        s.slug,
        s.is_active,
        sc.middle_title_en,
        sc.middle_title_tr,
        sc.paragraph_1_en,
        sc.paragraph_1_tr,
        sc.paragraph_2_en,
        sc.paragraph_2_tr,
        m.firebase_url as image_url,
        sc.image_media_id
      FROM services s
      LEFT JOIN service_contents sc ON s.id = sc.service_id
      LEFT JOIN media m ON sc.image_media_id = m.id
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

// POST - Create new service
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      order_number,
      title_en,
      title_tr,
      slug,
      image_media_id,
      middle_title_en,
      middle_title_tr,
      paragraph_1_en,
      paragraph_1_tr,
      paragraph_2_en,
      paragraph_2_tr,
      tags,
      is_active = true
    } = body;

    // Get or create collection
    let collectionResult = await pool.query('SELECT id FROM service_collections LIMIT 1');
    let collectionId;

    if (collectionResult.rows.length === 0) {
      const newCollection = await pool.query(
        `INSERT INTO service_collections (main_title_en, main_title_tr) 
         VALUES ('SERVICES', 'HİZMETLER') RETURNING id`
      );
      collectionId = newCollection.rows[0].id;
    } else {
      collectionId = collectionResult.rows[0].id;
    }

    // Create service
    const serviceResult = await pool.query(
      `INSERT INTO services (collection_id, order_number, title_en, title_tr, slug, is_active)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [collectionId, order_number, title_en, title_tr, slug, is_active]
    );

    const serviceId = serviceResult.rows[0].id;

    // Create service content
    await pool.query(
      `INSERT INTO service_contents (
        service_id, image_media_id, middle_title_en, middle_title_tr,
        paragraph_1_en, paragraph_1_tr, paragraph_2_en, paragraph_2_tr
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        serviceId, image_media_id, middle_title_en, middle_title_tr,
        paragraph_1_en, paragraph_1_tr, paragraph_2_en, paragraph_2_tr
      ]
    );

    // Add tags if provided
    if (tags && Array.isArray(tags)) {
      for (const tag of tags) {
        if (tag.tag_en || tag.tag_tr) {
          await pool.query(
            `INSERT INTO service_tags (service_id, tag_en, tag_tr)
             VALUES ($1, $2, $3)`,
            [serviceId, tag.tag_en, tag.tag_tr]
          );
        }
      }
    }

    return NextResponse.json(serviceResult.rows[0]);
  } catch (error) {
    console.error('Service creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create service' },
      { status: 500 }
    );
  }
}

// PUT - Update service collection or individual service
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
    const { 
      type, // 'collection' or 'service'
      id,
      title_tr, title_en, hero_media_id, // for collection
      name_tr, name_en, media_id, content_tr, content_en, extra_media_id // for service
    } = body;

    if (type === 'collection') {
      // Update service collection
      const result = await pool.query(`
        UPDATE service_collections 
        SET title_tr = $1, title_en = $2, hero_media_id = $3, updated_at = CURRENT_TIMESTAMP
        WHERE slug = 'homepage_services'
        RETURNING *
      `, [title_tr, title_en, hero_media_id]);

      return NextResponse.json({
        success: true,
        data: result.rows[0],
        message: 'Service collection updated successfully'
      });
    } else if (type === 'service') {
      if (!id) {
        return NextResponse.json({
          success: false,
          error: 'Service ID is required'
        }, { status: 400 });
      }

      // Update service
      const serviceResult = await pool.query(`
        UPDATE services 
        SET name_tr = $1, name_en = $2, media_id = $3, updated_at = CURRENT_TIMESTAMP
        WHERE id = $4
        RETURNING *
      `, [name_tr, name_en, media_id, id]);

      if (serviceResult.rows.length === 0) {
        return NextResponse.json({
          success: false,
          error: 'Service not found'
        }, { status: 404 });
      }

      // Update service content
      const contentExists = await pool.query(`
        SELECT id FROM service_contents WHERE service_id = $1
      `, [id]);

      if (contentExists.rows.length > 0) {
        await pool.query(`
          UPDATE service_contents 
          SET content_tr = $1, content_en = $2, extra_media_id = $3, updated_at = CURRENT_TIMESTAMP
          WHERE service_id = $4
        `, [content_tr, content_en, extra_media_id, id]);
      } else {
        await pool.query(`
          INSERT INTO service_contents (service_id, content_tr, content_en, extra_media_id)
          VALUES ($1, $2, $3, $4)
        `, [id, content_tr, content_en, extra_media_id]);
      }

      return NextResponse.json({
        success: true,
        data: serviceResult.rows[0],
        message: 'Service updated successfully'
      });
    }

    return NextResponse.json({
      success: false,
      error: 'Invalid type specified'
    }, { status: 400 });

  } catch (error) {
    console.error('Service update error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to update service'
    }, { status: 500 });
  }
}
