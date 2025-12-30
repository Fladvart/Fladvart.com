import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { sendContactNotificationEmail, sendContactConfirmationEmail } from '@/lib/email';
import { getTranslation, getLocaleFromRequest } from '@/lib/i18n';

export async function POST(request: NextRequest) {
  try {
    // Get locale from request
    const locale = getLocaleFromRequest(request);
    const t = (key: string) => getTranslation(key, locale);

    const body = await request.json();
    const { name, email, phone, company, message, serviceInterest } = body;

    // Validate required fields
    if (!name || !email || !message) {
      return NextResponse.json({
        success: false,
        error: t('api.contact.required_fields')
      }, { status: 400 });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({
        success: false,
        error: t('api.contact.invalid_email')
      }, { status: 400 });
    }

    // Validate message length
    if (message.length < 10) {
      return NextResponse.json({
        success: false,
        error: t('api.contact.message_too_short')
      }, { status: 400 });
    }

    if (message.length > 5000) {
      return NextResponse.json({
        success: false,
        error: t('api.contact.message_too_long')
      }, { status: 400 });
    }

    // Insert into database
    const result = await pool.query(`
      INSERT INTO contact_messages (
        name, 
        email, 
        phone, 
        company, 
        message, 
        service_interest,
        is_read,
        created_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, false, CURRENT_TIMESTAMP)
      RETURNING id, created_at
    `, [
      name.trim(),
      email.trim().toLowerCase(),
      phone?.trim() || null,
      company?.trim() || null,
      message.trim(),
      serviceInterest?.trim() || null
    ]);

    const savedMessage = result.rows[0];

    // Send emails asynchronously (don't wait for completion)
    const emailData = {
      name,
      email,
      phone,
      company,
      message,
      serviceInterest
    };

    // Send notification to admin
    console.log('Sending admin notification email...');
    sendContactNotificationEmail(emailData)
      .then(result => {
        if (result.success) {
          console.log('Admin notification email sent successfully');
        } else {
          console.error('Failed to send admin notification:', result.error);
        }
      })
      .catch(err => {
        console.error('Failed to send admin notification:', err);
      });

    // Send confirmation to customer
    console.log('Sending customer confirmation email...');
    sendContactConfirmationEmail(emailData)
      .then(result => {
        if (result.success) {
          console.log('Customer confirmation email sent successfully');
        } else {
          console.error('Failed to send customer confirmation:', result.error);
        }
      })
      .catch(err => {
        console.error('Failed to send customer confirmation:', err);
      });

    return NextResponse.json({
      success: true,
      data: {
        id: savedMessage.id,
        createdAt: savedMessage.created_at
      },
      message: t('api.contact.success')
    }, { status: 201 });

  } catch (error) {
    console.error('Contact form submission error:', error);
    
    // Get locale for error messages
    const locale = getLocaleFromRequest(request);
    const t = (key: string) => getTranslation(key, locale);
    
    // Check if it's a database error
    if (error instanceof Error) {
      if (error.message.includes('duplicate key')) {
        return NextResponse.json({
          success: false,
          error: t('api.contact.duplicate')
        }, { status: 409 });
      }
    }

    return NextResponse.json({
      success: false,
      error: t('api.contact.error')
    }, { status: 500 });
  }
}
