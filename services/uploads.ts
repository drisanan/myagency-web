const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '/api';
const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100MB
const MAX_IMAGE_SIZE = 25 * 1024 * 1024; // 25MB
const MAX_IMAGE_SIZE_MB = Math.round(MAX_IMAGE_SIZE / 1024 / 1024);
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/quicktime', 'video/webm'];
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

export interface PresignedUrlResponse {
  presignedUrl: string;
  publicUrl: string;
  key: string;
}

/**
 * Request a presigned URL from the backend for direct S3 upload
 */
export async function getPresignedUploadUrl(
  clientId: string,
  file: File,
  mediaType: 'video' | 'image',
  formToken?: string
): Promise<PresignedUrlResponse> {
  const payload: Record<string, any> = {
    contentType: file.type,
    fileSize: file.size,
    clientId,
    mediaType,
  };
  if (formToken) payload.formToken = formToken;

  const res = await fetch(`${API_BASE_URL}/uploads/presigned-url`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Failed to get upload URL' }));
    throw new Error(error.error || 'Failed to get upload URL');
  }

  return res.json();
}

/**
 * Upload a file directly to S3 using a presigned URL
 */
export async function uploadToS3(presignedUrl: string, file: File): Promise<void> {
  const res = await fetch(presignedUrl, {
    method: 'PUT',
    body: file,
    headers: {
      'Content-Type': file.type,
    },
  });

  if (!res.ok) {
    throw new Error('Failed to upload file to S3');
  }
}

/**
 * Upload a media file (video or image) and return the public URL
 * This is the main function to use for uploading media
 */
export async function uploadMedia(
  clientId: string,
  file: File,
  mediaType: 'video' | 'image',
  onProgress?: (percent: number) => void,
  formToken?: string
): Promise<string> {
  // 1. Get presigned URL from backend
  onProgress?.(10);
  const { presignedUrl, publicUrl } = await getPresignedUploadUrl(clientId, file, mediaType, formToken);

  // 2. Upload directly to S3
  onProgress?.(30);
  await uploadToS3(presignedUrl, file);
  onProgress?.(100);

  // 3. Return the public URL to store in DynamoDB
  return publicUrl;
}

/**
 * Validate video file before upload
 */
export function validateVideoFile(file: File): { valid: boolean; error?: string } {
  if (!ALLOWED_VIDEO_TYPES.includes(file.type)) {
    return { 
      valid: false, 
      error: `Invalid video type: ${file.type}. Allowed: MP4, MOV, WebM` 
    };
  }

  if (file.size > MAX_VIDEO_SIZE) {
    return { 
      valid: false, 
      error: `Video too large: ${Math.round(file.size / 1024 / 1024)}MB. Max 100MB allowed` 
    };
  }

  return { valid: true };
}

/**
 * Validate image file before upload
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return { 
      valid: false, 
      error: `Invalid image type: ${file.type}. Allowed: JPEG, PNG, GIF, WebP` 
    };
  }

  if (file.size > MAX_IMAGE_SIZE) {
    return { 
      valid: false, 
      error: `Image too large: ${Math.round(file.size / 1024 / 1024)}MB. Max ${MAX_IMAGE_SIZE_MB}MB allowed` 
    };
  }

  return { valid: true };
}
