import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { pool } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { getTranslation, getLocaleFromRequest } from '@/lib/i18n';

// PUT - Şifre değiştir
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
    const { currentPassword, newPassword, confirmPassword } = body;

    // Validasyonlar
    if (!currentPassword || !newPassword || !confirmPassword) {
      return NextResponse.json(
        { error: t('api.user.all_fields_required') },
        { status: 400 }
      );
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { error: t('api.user.passwords_not_match') },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: t('api.user.password_min_length') },
        { status: 400 }
      );
    }

    // Mevcut kullanıcıyı ve şifresini getir
    const userResult = await pool.query(
      'SELECT password_hash FROM users WHERE id = $1',
      [session.user.id]
    );

    if (userResult.rows.length === 0) {
      return NextResponse.json(
        { error: t('api.user.not_found') },
        { status: 404 }
      );
    }

    const user = userResult.rows[0];

    // Mevcut şifreyi kontrol et
    const isValidPassword = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isValidPassword) {
      return NextResponse.json(
        { error: t('api.user.current_password_wrong') },
        { status: 400 }
      );
    }

    // Yeni şifreyi hash'le
    const newPasswordHash = await bcrypt.hash(newPassword, 10);

    // Şifreyi güncelle
    await pool.query(
      'UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2',
      [newPasswordHash, session.user.id]
    );

    return NextResponse.json({
      message: 'Şifre başarıyla değiştirildi'
    });
  } catch (error) {
    console.error('Password change error:', error);
    const locale = getLocaleFromRequest(request);
    const t = (key: string) => getTranslation(key, locale);
    return NextResponse.json(
      { error: t('api.user.password_change_error') },
      { status: 500 }
    );
  }
}

