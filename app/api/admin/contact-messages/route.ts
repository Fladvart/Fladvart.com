import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET - Fetch contact messages (admin only)
export async function GET(request: NextRequest) {
  try {
    // Check authentication for admin routes
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({
        success: false,
        error: 'Unauthorized'
      }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status') || 'all';
    const offset = (page - 1) * limit;

    let whereClause = '';
    const queryParams: any[] = [limit, offset];
    
    if (status !== 'all') {
      whereClause = 'WHERE status = $3';
      queryParams.push(status);
    }

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total FROM contact_messages 
      ${whereClause}
    `;
    const countResult = await pool.query(countQuery, status !== 'all' ? [status] : []);
    const totalMessages = parseInt(countResult.rows[0].total);

    // Get messages
    const messagesQuery = `
      SELECT * FROM contact_messages 
      ${whereClause}
      ORDER BY created_at DESC 
      LIMIT $1 OFFSET $2
    `;
    const result = await pool.query(messagesQuery, queryParams);

    return NextResponse.json({
      success: true,
      data: {
        messages: result.rows,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalMessages / limit),
          totalMessages,
          hasNextPage: (page * limit) < totalMessages,
          hasPrevPage: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Contact messages fetch error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch contact messages'
    }, { status: 500 });
  }
}

// POST - Create new contact message (public endpoint)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, subject, message, source } = body;

    // Validate required fields
    if (!name || !email || !message) {
      return NextResponse.json({
        success: false,
        error: 'Name, email, and message are required'
      }, { status: 400 });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid email format'
      }, { status: 400 });
    }

    const result = await pool.query(`
      INSERT INTO contact_messages (
        name, email, phone, subject, message, source
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, created_at
    `, [name, email, phone || null, subject || null, message, source || 'contact_form']);

    // Here you can add email sending logic (using Resend)
    // await sendContactNotificationEmail(body);

    return NextResponse.json({
      success: true,
      data: result.rows[0],
      message: 'Message sent successfully'
    });

  } catch (error) {
    console.error('Contact message creation error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to send message'
    }, { status: 500 });
  }
}

// PUT - Update message status (admin only)
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
    const { id, is_read, is_processed } = body;

    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'Message ID is required'
      }, { status: 400 });
    }

    const result = await pool.query(`
      UPDATE contact_messages 
      SET is_read = COALESCE($1, is_read),
          is_processed = COALESCE($2, is_processed),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
      RETURNING *
    `, [is_read, is_processed, id]);

    if (result.rows.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Message not found'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: result.rows[0],
      message: 'Message updated successfully'
    });

  } catch (error) {
    console.error('Contact message update error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to update message'
    }, { status: 500 });
  }
}
