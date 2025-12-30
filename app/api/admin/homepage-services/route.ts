import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET - Fetch homepage services
export async function GET() {
  try {
    const result = await pool.query(`
      SELECT * FROM homepage_services 
      WHERE is_active = true 
      ORDER BY order_no ASC
    `);

    return NextResponse.json({
      success: true,
      data: result.rows
    });

  } catch (error) {
    console.error('Homepage services fetch error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch homepage services'
    }, { status: 500 });
  }
}

// POST - Create new homepage service
export async function POST(request: NextRequest) {
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
      title_en, title_tr, main_image_url,
      service_1_en, service_1_tr,
      service_2_en, service_2_tr,
      service_3_en, service_3_tr,
      service_4_en, service_4_tr,
      service_5_en, service_5_tr,
      order_no
    } = body;

    // Validate required fields
    if (!title_en || !title_tr) {
      return NextResponse.json({
        success: false,
        error: 'Title in both languages is required'
      }, { status: 400 });
    }

    const result = await pool.query(`
      INSERT INTO homepage_services (
        title_en, title_tr, main_image_url,
        service_1_en, service_1_tr,
        service_2_en, service_2_tr,
        service_3_en, service_3_tr,
        service_4_en, service_4_tr,
        service_5_en, service_5_tr,
        order_no
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING *
    `, [
      title_en, title_tr, main_image_url,
      service_1_en, service_1_tr,
      service_2_en, service_2_tr,
      service_3_en, service_3_tr,
      service_4_en, service_4_tr,
      service_5_en, service_5_tr,
      order_no || 0
    ]);

    return NextResponse.json({
      success: true,
      data: result.rows[0],
      message: 'Homepage service created successfully'
    });

  } catch (error) {
    console.error('Homepage service creation error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to create homepage service'
    }, { status: 500 });
  }
}

// PUT - Update homepage service
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
      id, title_en, title_tr, main_image_url,
      service_1_en, service_1_tr,
      service_2_en, service_2_tr,
      service_3_en, service_3_tr,
      service_4_en, service_4_tr,
      service_5_en, service_5_tr,
      order_no
    } = body;

    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'Service ID is required'
      }, { status: 400 });
    }

    const result = await pool.query(`
      UPDATE homepage_services 
      SET title_en = $1, title_tr = $2, main_image_url = $3,
          service_1_en = $4, service_1_tr = $5,
          service_2_en = $6, service_2_tr = $7,
          service_3_en = $8, service_3_tr = $9,
          service_4_en = $10, service_4_tr = $11,
          service_5_en = $12, service_5_tr = $13,
          order_no = $14, updated_at = CURRENT_TIMESTAMP
      WHERE id = $15
      RETURNING *
    `, [
      title_en, title_tr, main_image_url,
      service_1_en, service_1_tr,
      service_2_en, service_2_tr,
      service_3_en, service_3_tr,
      service_4_en, service_4_tr,
      service_5_en, service_5_tr,
      order_no, id
    ]);

    if (result.rows.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Service not found'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: result.rows[0],
      message: 'Homepage service updated successfully'
    });

  } catch (error) {
    console.error('Homepage service update error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to update homepage service'
    }, { status: 500 });
  }
}
