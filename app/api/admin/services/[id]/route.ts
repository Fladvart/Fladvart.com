import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { pool } from '@/lib/db';

// GET - Fetch single service
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: serviceId } = await params;

    const result = await pool.query(`
      SELECT 
        s.*,
        sc.image_media_id,
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
      WHERE s.id = $1
    `, [serviceId]);

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 });
    }

    // Get tags
    const tagsResult = await pool.query(
      'SELECT id, tag_en, tag_tr FROM service_tags WHERE service_id = $1',
      [serviceId]
    );

    const service = {
      ...result.rows[0],
      tags: tagsResult.rows
    };

    return NextResponse.json(service);
  } catch (error) {
    console.error('Error fetching service:', error);
    return NextResponse.json(
      { error: 'Failed to fetch service' },
      { status: 500 }
    );
  }
}

// PUT - Update service
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: serviceId } = await params;
    const body = await req.json();
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
      is_active
    } = body;

    // Update service
    const serviceResult = await pool.query(
      `UPDATE services 
       SET order_number = $1, title_en = $2, title_tr = $3, slug = $4, is_active = $5, updated_at = NOW()
       WHERE id = $6
       RETURNING *`,
      [order_number, title_en, title_tr, slug, is_active, serviceId]
    );

    if (serviceResult.rows.length === 0) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 });
    }

    // Update or create service content
    const contentExists = await pool.query(
      'SELECT id FROM service_contents WHERE service_id = $1',
      [serviceId]
    );

    if (contentExists.rows.length > 0) {
      await pool.query(
        `UPDATE service_contents 
         SET image_media_id = $1, middle_title_en = $2, middle_title_tr = $3,
             paragraph_1_en = $4, paragraph_1_tr = $5, paragraph_2_en = $6, paragraph_2_tr = $7,
             updated_at = NOW()
         WHERE service_id = $8`,
        [
          image_media_id, middle_title_en, middle_title_tr,
          paragraph_1_en, paragraph_1_tr, paragraph_2_en, paragraph_2_tr,
          serviceId
        ]
      );
    } else {
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
    }

    // Update tags - delete all and recreate
    await pool.query('DELETE FROM service_tags WHERE service_id = $1', [serviceId]);

    if (tags && Array.isArray(tags)) {
      for (const tag of tags) {
        if (tag.tag_en || tag.tag_tr) {
          await pool.query(
            'INSERT INTO service_tags (service_id, tag_en, tag_tr) VALUES ($1, $2, $3)',
            [serviceId, tag.tag_en, tag.tag_tr]
          );
        }
      }
    }

    return NextResponse.json(serviceResult.rows[0]);
  } catch (error) {
    console.error('Error updating service:', error);
    return NextResponse.json(
      { error: 'Failed to update service' },
      { status: 500 }
    );
  }
}

// DELETE - Delete service
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: serviceId } = await params;

    // Delete tags
    await pool.query('DELETE FROM service_tags WHERE service_id = $1', [serviceId]);

    // Delete content
    await pool.query('DELETE FROM service_contents WHERE service_id = $1', [serviceId]);

    // Delete service
    const result = await pool.query(
      'DELETE FROM services WHERE id = $1 RETURNING *',
      [serviceId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting service:', error);
    return NextResponse.json(
      { error: 'Failed to delete service' },
      { status: 500 }
    );
  }
}
