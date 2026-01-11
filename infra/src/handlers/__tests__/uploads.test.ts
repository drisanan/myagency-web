/**
 * Unit tests for uploads handler
 */

import { APIGatewayProxyEventV2 } from 'aws-lambda';

// Mock AWS SDK
const mockGetSignedUrl = jest.fn();
jest.mock('@aws-sdk/s3-request-presigner', () => ({
  getSignedUrl: mockGetSignedUrl,
}));

jest.mock('@aws-sdk/client-s3', () => ({
  S3Client: jest.fn().mockImplementation(() => ({})),
  PutObjectCommand: jest.fn().mockImplementation((params) => params),
}));

// Mock session
const mockParseSessionFromRequest = jest.fn();
jest.mock('../../lib/session', () => ({
  parseSessionFromRequest: mockParseSessionFromRequest,
}));

// Mock Sentry
jest.mock('../../lib/sentry', () => ({
  withSentry: (fn: Function) => fn,
}));

// Set environment variables
process.env.MEDIA_BUCKET = 'test-media-bucket';
process.env.AWS_REGION = 'us-west-1';

// Import handler after mocks - need to use uploadsHandler directly since withSentry wraps it
// eslint-disable-next-line @typescript-eslint/no-var-requires
const uploadsModule = require('../uploads');

// Type assertion for the result
interface APIGatewayResponse {
  statusCode: number;
  body: string;
  headers?: Record<string, string>;
}

function createMockEvent(overrides: Partial<APIGatewayProxyEventV2> = {}): APIGatewayProxyEventV2 {
  return {
    version: '2.0',
    routeKey: 'POST /uploads/presigned-url',
    rawPath: '/uploads/presigned-url',
    rawQueryString: '',
    headers: {
      origin: 'https://www.myrecruiteragency.com',
    },
    requestContext: {
      accountId: '123456789',
      apiId: 'test',
      domainName: 'test.execute-api.us-west-1.amazonaws.com',
      domainPrefix: 'test',
      http: {
        method: 'POST',
        path: '/uploads/presigned-url',
        protocol: 'HTTP/1.1',
        sourceIp: '127.0.0.1',
        userAgent: 'test',
      },
      requestId: 'test-request-id',
      routeKey: 'POST /uploads/presigned-url',
      stage: 'prod',
      time: '01/Jan/2024:00:00:00 +0000',
      timeEpoch: 1704067200000,
    },
    body: JSON.stringify({
      contentType: 'video/mp4',
      fileSize: 10 * 1024 * 1024, // 10MB
      clientId: 'client-123',
      mediaType: 'video',
    }),
    isBase64Encoded: false,
    ...overrides,
  };
}

describe('uploads handler', () => {
  let handler: (event: APIGatewayProxyEventV2) => Promise<APIGatewayResponse>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetSignedUrl.mockResolvedValue('https://test-bucket.s3.amazonaws.com/presigned-url');
    mockParseSessionFromRequest.mockReturnValue({
      agencyId: 'agency-123',
      agencyEmail: 'test@agency.com',
      role: 'agency',
    });
    handler = uploadsModule.handler;
  });

  describe('authentication', () => {
    it('should return 401 if no valid session', async () => {
      mockParseSessionFromRequest.mockReturnValue(null);
      const event = createMockEvent();
      
      const result = await handler(event) as APIGatewayResponse;
      
      expect(result.statusCode).toBe(401);
      expect(JSON.parse(result.body)).toEqual({ error: 'Unauthorized' });
    });

    it('should return 401 if session has no agencyId', async () => {
      mockParseSessionFromRequest.mockReturnValue({ agencyEmail: 'test@test.com' });
      const event = createMockEvent();
      
      const result = await handler(event) as APIGatewayResponse;
      
      expect(result.statusCode).toBe(401);
    });
  });

  describe('validation', () => {
    it('should return 400 if missing required fields', async () => {
      const event = createMockEvent({
        body: JSON.stringify({ contentType: 'video/mp4' }), // missing fileSize, clientId, mediaType
      });
      
      const result = await handler(event) as APIGatewayResponse;
      
      expect(result.statusCode).toBe(400);
      expect(JSON.parse(result.body).error).toContain('Missing required fields');
    });

    it('should return 400 for invalid mediaType', async () => {
      const event = createMockEvent({
        body: JSON.stringify({
          contentType: 'video/mp4',
          fileSize: 1024,
          clientId: 'client-123',
          mediaType: 'audio', // invalid
        }),
      });
      
      const result = await handler(event) as APIGatewayResponse;
      
      expect(result.statusCode).toBe(400);
      expect(JSON.parse(result.body).error).toContain('Invalid mediaType');
    });

    it('should return 400 for invalid video content type', async () => {
      const event = createMockEvent({
        body: JSON.stringify({
          contentType: 'video/avi', // not allowed
          fileSize: 1024,
          clientId: 'client-123',
          mediaType: 'video',
        }),
      });
      
      const result = await handler(event) as APIGatewayResponse;
      
      expect(result.statusCode).toBe(400);
      expect(JSON.parse(result.body).error).toContain('Invalid content type');
    });

    it('should return 400 for invalid image content type', async () => {
      const event = createMockEvent({
        body: JSON.stringify({
          contentType: 'image/bmp', // not allowed
          fileSize: 1024,
          clientId: 'client-123',
          mediaType: 'image',
        }),
      });
      
      const result = await handler(event) as APIGatewayResponse;
      
      expect(result.statusCode).toBe(400);
      expect(JSON.parse(result.body).error).toContain('Invalid content type');
    });

    it('should return 400 if video exceeds 100MB', async () => {
      const event = createMockEvent({
        body: JSON.stringify({
          contentType: 'video/mp4',
          fileSize: 150 * 1024 * 1024, // 150MB
          clientId: 'client-123',
          mediaType: 'video',
        }),
      });
      
      const result = await handler(event) as APIGatewayResponse;
      
      expect(result.statusCode).toBe(400);
      expect(JSON.parse(result.body).error).toContain('File too large');
    });

    it('should return 400 if image exceeds 5MB', async () => {
      const event = createMockEvent({
        body: JSON.stringify({
          contentType: 'image/jpeg',
          fileSize: 10 * 1024 * 1024, // 10MB
          clientId: 'client-123',
          mediaType: 'image',
        }),
      });
      
      const result = await handler(event) as APIGatewayResponse;
      
      expect(result.statusCode).toBe(400);
      expect(JSON.parse(result.body).error).toContain('File too large');
    });
  });

  describe('successful upload URL generation', () => {
    it('should return presigned URL for valid video upload request', async () => {
      const event = createMockEvent();
      
      const result = await handler(event) as APIGatewayResponse;
      
      expect(result.statusCode).toBe(200);
      const body = JSON.parse(result.body);
      expect(body.presignedUrl).toBe('https://test-bucket.s3.amazonaws.com/presigned-url');
      expect(body.publicUrl).toContain('test-media-bucket.s3.us-west-1.amazonaws.com');
      expect(body.publicUrl).toContain('/videos/agency-123/client-123/');
      expect(body.publicUrl).toContain('.mp4');
      expect(body.key).toContain('videos/agency-123/client-123/');
    });

    it('should return presigned URL for valid image upload request', async () => {
      const event = createMockEvent({
        body: JSON.stringify({
          contentType: 'image/jpeg',
          fileSize: 2 * 1024 * 1024, // 2MB
          clientId: 'client-456',
          mediaType: 'image',
        }),
      });
      
      const result = await handler(event) as APIGatewayResponse;
      
      expect(result.statusCode).toBe(200);
      const body = JSON.parse(result.body);
      expect(body.publicUrl).toContain('/images/agency-123/client-456/');
      expect(body.publicUrl).toContain('.jpeg');
    });

    it('should handle quicktime video type', async () => {
      const event = createMockEvent({
        body: JSON.stringify({
          contentType: 'video/quicktime',
          fileSize: 5 * 1024 * 1024,
          clientId: 'client-789',
          mediaType: 'video',
        }),
      });
      
      const result = await handler(event) as APIGatewayResponse;
      
      expect(result.statusCode).toBe(200);
      const body = JSON.parse(result.body);
      expect(body.publicUrl).toContain('.mov');
    });
  });

  describe('OPTIONS request', () => {
    it('should return 200 for OPTIONS preflight', async () => {
      const event = createMockEvent({
        requestContext: {
          ...createMockEvent().requestContext,
          http: {
            ...createMockEvent().requestContext.http,
            method: 'OPTIONS',
          },
        },
      });
      
      const result = await handler(event) as APIGatewayResponse;
      
      expect(result.statusCode).toBe(200);
    });
  });

  describe('error handling', () => {
    it('should return 500 if S3 presigning fails', async () => {
      mockGetSignedUrl.mockRejectedValue(new Error('S3 error'));
      const event = createMockEvent();
      
      const result = await handler(event) as APIGatewayResponse;
      
      expect(result.statusCode).toBe(500);
      expect(JSON.parse(result.body).error).toBe('Failed to generate upload URL');
    });
  });
});
