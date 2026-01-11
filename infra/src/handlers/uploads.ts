import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { withSentry } from '../lib/sentry';
import { response } from './cors';
import { parseSessionFromRequest } from '../lib/session';

const s3 = new S3Client({ region: process.env.AWS_REGION || 'us-west-1' });
const BUCKET = process.env.MEDIA_BUCKET || '';

const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100MB
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;   // 5MB
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/quicktime', 'video/webm'];
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

async function uploadsHandler(event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> {
  const origin = event.headers?.origin;
  
  if (event.requestContext.http.method === 'OPTIONS') {
    return response(200, {}, origin);
  }

  // Verify session
  const session = parseSessionFromRequest(event);
  if (!session?.agencyId) {
    console.error('[uploads:unauthorized] No valid session found');
    return response(401, { error: 'Unauthorized' }, origin);
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const { contentType, fileSize, clientId, mediaType } = body;

    console.info('[uploads:request]', { 
      agencyId: session.agencyId, 
      clientId, 
      mediaType, 
      contentType, 
      fileSize 
    });

    // Validate required fields
    if (!contentType || !fileSize || !clientId || !mediaType) {
      return response(400, { error: 'Missing required fields: contentType, fileSize, clientId, mediaType' }, origin);
    }

    // Validate media type
    if (!['video', 'image'].includes(mediaType)) {
      return response(400, { error: 'Invalid mediaType. Must be "video" or "image"' }, origin);
    }

    // Validate content type
    const allowedTypes = mediaType === 'video' ? ALLOWED_VIDEO_TYPES : ALLOWED_IMAGE_TYPES;
    if (!allowedTypes.includes(contentType)) {
      return response(400, { error: `Invalid content type: ${contentType}. Allowed: ${allowedTypes.join(', ')}` }, origin);
    }

    // Validate file size
    const maxSize = mediaType === 'video' ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE;
    if (fileSize > maxSize) {
      return response(400, { error: `File too large. Max ${Math.round(maxSize / 1024 / 1024)}MB for ${mediaType}s` }, origin);
    }

    // Generate unique key
    const ext = contentType.split('/')[1]?.replace('quicktime', 'mov') || (mediaType === 'video' ? 'mp4' : 'jpg');
    const key = `${mediaType}s/${session.agencyId}/${clientId}/${generateUUID()}.${ext}`;

    // Generate presigned URL (valid for 15 minutes)
    const command = new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      ContentType: contentType,
    });

    const presignedUrl = await getSignedUrl(s3, command, { expiresIn: 900 });

    // Return the presigned URL and the final public URL
    const region = process.env.AWS_REGION || 'us-west-1';
    const publicUrl = `https://${BUCKET}.s3.${region}.amazonaws.com/${key}`;

    console.info('[uploads:success]', { key, publicUrl });

    return response(200, { 
      presignedUrl, 
      publicUrl,
      key 
    }, origin);

  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('[uploads:error]', { error: errorMessage });
    return response(500, { error: 'Failed to generate upload URL' }, origin);
  }
}

export const handler = withSentry(uploadsHandler);
