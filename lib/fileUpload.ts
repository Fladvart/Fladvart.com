import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { app } from './firebase';

export interface FileUploadResult {
  success: boolean;
  firebaseUrl?: string;
  error?: string;
}

export async function uploadFileToFirebase(
  file: File,
  context: string, // hero_video, why_we_exist_image_1, service_image, etc.
  userId?: number
): Promise<FileUploadResult> {
  try {
    // Validate file type
    const allowedTypes = {
      video: ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo'],
      image: ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    };

    const fileType = file.type.startsWith('video/') ? 'video' : 
                     file.type.startsWith('image/') ? 'image' : 'unknown';

    if (fileType === 'unknown' || 
        !allowedTypes[fileType as keyof typeof allowedTypes].includes(file.type)) {
      return {
        success: false,
        error: 'Unsupported file type. Please upload images (JPG, PNG, WebP, GIF) or videos (MP4, WebM, MOV, AVI).'
      };
    }

    // Validate file size (100MB for images, 500MB for videos)
    const maxSize = fileType === 'video' ? 500 * 1024 * 1024 : 100 * 1024 * 1024;
    if (file.size > maxSize) {
      return {
        success: false,
        error: `File too large. Maximum size is ${fileType === 'video' ? '500MB' : '100MB'}.`
      };
    }

    // Create unique filename
    const timestamp = Date.now();
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const filename = `${timestamp}_${sanitizedName}`;

    // Create storage path
    const storagePath = `${fileType}s/${context}/${filename}`;

    // Get Firebase Storage reference
    const storage = getStorage(app);
    const storageRef = ref(storage, storagePath);

    // Upload file with metadata
    const metadata = {
      contentType: file.type,
      customMetadata: {
        uploadedBy: userId?.toString() || 'unknown',
        context: context,
        originalFilename: file.name,
      }
    };

    // Upload to Firebase Storage
    await uploadBytes(storageRef, file, metadata);

    // Get download URL
    const downloadURL = await getDownloadURL(storageRef);

    return {
      success: true,
      firebaseUrl: downloadURL
    };

  } catch (error) {
    console.error('Firebase upload error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed. Please try again.'
    };
  }
}

export async function deleteFileFromFirebase(fileUrl: string): Promise<boolean> {
  try {
    // Extract file path from Firebase Storage URL
    const storage = getStorage(app);
    const storageRef = ref(storage, fileUrl);
    
    await deleteObject(storageRef);
    return true;
  } catch (error) {
    console.error('File deletion error:', error);
    return false;
  }
}