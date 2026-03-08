import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { withSentry } from '../lib/sentry';
import { response } from './cors';
import { parseSessionFromRequest } from '../lib/session';
import { verify } from '../lib/formsToken';
import { getItem, queryGSI1 } from '../lib/dynamo';

const s3 = new S3Client({ region: process.env.AWS_REGION || 'us-west-1' });
const BUCKET = process.env.MEDIA_BUCKET || '';

const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100MB
const MAX_IMAGE_SIZE = 25 * 1024 * 1024;  // 25MB
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/quicktime', 'video/webm'];
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

type PublicFormTokenPayload = {
  agencyEmail: string;
  agencyId?: string;
  clientId?: string;
  type?: 'intake' | 'update';
};

function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function isAllowedPublicClientId(clientId: string, payload: PublicFormTokenPayload) {
  if (payload.type === 'update') {
    return Boolean(payload.clientId && payload.clientId === clientId);
  }
  return clientId.startsWith('temp-');
}

async function resolveUploadAccess(event: APIGatewayProxyEventV2, body: Record<string, any>) {
  const session = parseSessionFromRequest(event);
  if (session?.agencyId) {
    return {
      agencyId: session.agencyId,
      accessType: 'session' as const,
      tokenPayload: null,
    };
  }

  const { formToken, clientId } = body;
  if (!formToken) return null;

  const payload = verify<PublicFormTokenPayload>(formToken);
  if (!payload?.agencyEmail) return null;
  if (!clientId || !isAllowedPublicClientId(clientId, payload)) return null;

  const agencies = await queryGSI1(`EMAIL#${payload.agencyEmail}`, 'AGENCY#');
  const agency = payload.agencyId
    ? (agencies || []).find((item: any) => item.id === payload.agencyId) || agencies?.[0]
    : agencies?.[0];
  if (!agency?.id) return null;

  return {
    agencyId: agency.id,
    accessType: 'public-token' as const,
    tokenPayload: payload,
  };
}

async function validateUploadTarget(
  agencyId: string,
  clientId: string,
  accessType: 'session' | 'public-token',
  tokenPayload: PublicFormTokenPayload | null,
) {
  if (accessType === 'public-token') {
    if (!tokenPayload) return false;
    if (tokenPayload.type === 'intake') {
      return clientId.startsWith('temp-');
    }
    if (tokenPayload.type === 'update') {
      if (tokenPayload.clientId !== clientId) return false;
      const client = await getItem({ PK: `AGENCY#${agencyId}`, SK: `CLIENT#${clientId}` });
      return Boolean(client);
    }
    return false;
  }

  if (clientId.startsWith('temp-')) {
    return true;
  }

  const client = await getItem({ PK: `AGENCY#${agencyId}`, SK: `CLIENT#${clientId}` });
  return Boolean(client);
}

async function uploadsHandler(event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> {
  const origin = event.headers?.origin;
  
  if (event.requestContext.http.method === 'OPTIONS') {
    return response(200, {}, origin);
  }

  try {
    let body: Record<string, any>;
    try {
      body = JSON.parse(event.body || '{}');
    } catch {
      return response(400, { error: 'Invalid JSON body' }, origin);
    }
    const { contentType, clientId, mediaType } = body;
    const fileSize = Number(body.fileSize);

    const access = await resolveUploadAccess(event, body);
    if (!access?.agencyId) {
      console.error('[uploads:unauthorized] No valid session or form token');
      return response(401, { error: 'Unauthorized' }, origin);
    }

    console.info('[uploads:request]', { 
      agencyId: access.agencyId,
      clientId, 
      mediaType, 
      contentType, 
      fileSize,
      accessType: access.accessType,
    });

    // Validate required fields
    if (!contentType || !fileSize || !clientId || !mediaType) {
      return response(400, { error: 'Missing required fields: contentType, fileSize, clientId, mediaType' }, origin);
    }

    if (!Number.isFinite(fileSize) || fileSize <= 0) {
      return response(400, { error: 'fileSize must be a positive number' }, origin);
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

    const targetAllowed = await validateUploadTarget(access.agencyId, String(clientId), access.accessType, access.tokenPayload);
    if (!targetAllowed) {
      return response(403, { error: 'Upload target is not allowed for this session or form token' }, origin);
    }

    // Generate unique key
    const ext = contentType.split('/')[1]?.replace('quicktime', 'mov') || (mediaType === 'video' ? 'mp4' : 'jpg');
    const key = `${mediaType}s/${access.agencyId}/${clientId}/${generateUUID()}.${ext}`;

    // Generate presigned URL (valid for 15 minutes)
    const command = new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      ContentType: contentType,
      ContentLength: fileSize,
      Metadata: {
        agencyid: access.agencyId,
        clientid: String(clientId),
        mediatype: String(mediaType),
        uploadscope: access.accessType,
      },
    });

    const presignedUrl = await getSignedUrl(s3, command, { expiresIn: 900 });

    // Return the presigned URL and the final public URL
    const region = process.env.AWS_REGION || 'us-west-1';
    const publicUrl = `https://${BUCKET}.s3.${region}.amazonaws.com/${key}`;

    console.info('[uploads:success]', { key, publicUrl });

    return response(200, { 
      presignedUrl, 
      publicUrl,
      key,
      maxSize,
    }, origin);

  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('[uploads:error]', { error: errorMessage });
    return response(500, { error: 'Failed to generate upload URL' }, origin);
  }
}

export const handler = withSentry(uploadsHandler);
