import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { uploadFileToFirebase } from '@/lib/fileUpload';
import { pool } from '@/lib/db';

// Configure larger body size limit for video uploads
export const runtime = 'nodejs';
export const maxDuration = 300; // 5 minutes for video uploads

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

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const context = formData.get('context') as string;

    if (!file) {
      return NextResponse.json({
        success: false,
        error: 'No file provided'
      }, { status: 400 });
    }

    if (!context) {
      return NextResponse.json({
        success: false,
        error: 'Upload context is required'
      }, { status: 400 });
    }

    console.log('[Upload API] File details:', {
      name: file.name,
      size: file.size,
      type: file.type,
      context: context
    });

    // Get user ID from database
    const userResult = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [session.user.email]
    );

    const userId = userResult.rows[0]?.id;

    // Upload file to Firebase
    const uploadResult = await uploadFileToFirebase(file, context, userId);

    if (uploadResult.success) {
      // Save to media table
      const fileType = file.type.startsWith('video/') ? 'video' : 
                       file.type.startsWith('image/') ? 'image' : 'other';
      
      const mediaResult = await pool.query(`
        INSERT INTO media (
          original_filename, 
          firebase_url, 
          file_type, 
          file_size, 
          upload_context, 
          uploaded_by
        )
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id
      `, [
        file.name, 
        uploadResult.firebaseUrl, 
        fileType, 
        file.size, 
        context, 
        userId
      ]);

      return NextResponse.json({
        success: true,
        firebaseUrl: uploadResult.firebaseUrl,
        mediaId: mediaResult.rows[0].id,
        message: 'File uploaded successfully'
      });
    } else {
      return NextResponse.json({
        success: false,
        error: uploadResult.error
      }, { status: 400 });
    }

  } catch (error) {
    console.error('File upload API error:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'File upload failed'
    }, { status: 500 });
  }
}