import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { pool } from '@/lib/db';
import { getTranslation, getLocaleFromRequest } from '@/lib/i18n';

// GET - Kullanıcı profil bilgilerini getir
export async function GET(request: NextRequest) {
  try {
    const locale = getLocaleFromRequest(request);
    const t = (key: string) => getTranslation(key, locale);
    
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: t('api.user.unauthorized') },
        { status: 401 }
      );
    }

    const result = await pool.query(
      'SELECT id, name, email, role, created_at FROM users WHERE id = $1',
      [session.user.id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: t('api.user.not_found') },
        { status: 404 }
      );
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Profile fetch error:', error);
    const locale = getLocaleFromRequest(request);
    const t = (key: string) => getTranslation(key, locale);
    return NextResponse.json(
      { error: t('api.user.profile_fetch_error') },
      { status: 500 }
    );
  }
}

// PUT - Kullanıcı profil bilgilerini güncelle
export async function PUT(request: NextRequest) {
  try {
    const locale = getLocaleFromRequest(request);
    const t = (key: string) => getTranslation(key, locale);
    
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: t('api.user.unauthorized') },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, email } = body;

    if (!name || !email) {
      return NextResponse.json(
        { error: t('api.user.name_email_required') },
        { status: 400 }
      );
    }

    // Email zaten kullanılıyor mu kontrol et (başka bir kullanıcı tarafından)
    const emailCheck = await pool.query(
      'SELECT id FROM users WHERE email = $1 AND id != $2',
      [email, session.user.id]
    );

    if (emailCheck.rows.length > 0) {
      return NextResponse.json(
        { error: t('api.user.email_in_use') },
        { status: 400 }
      );
    }

    // Profil bilgilerini güncelle
    const result = await pool.query(
      'UPDATE users SET name = $1, email = $2, updated_at = NOW() WHERE id = $3 RETURNING id, name, email, role',
      [name, email, session.user.id]
    );

    return NextResponse.json({
      message: 'Profil başarıyla güncellendi',
      user: result.rows[0]
    });
  } catch (error) {
    console.error('Profile update error:', error);
    const locale = getLocaleFromRequest(request);
    const t = (key: string) => getTranslation(key, locale);
    return NextResponse.json(
      { error: t('api.user.profile_update_error') },
      { status: 500 }
    );
  }
}

