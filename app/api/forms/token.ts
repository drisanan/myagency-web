import crypto from 'crypto';

const ALG = 'sha256';
function getFormsSecret(): string | null {
  const secret = process.env.FORMS_SECRET?.trim();
  return secret || null;
}

export function sign(payload: object): string {
  const secret = getFormsSecret();
  if (!secret) {
    throw new Error('FORMS_SECRET is not configured');
  }
  const header = { alg: 'HS256', typ: 'JWT' };
  const enc = (o: any) => Buffer.from(JSON.stringify(o)).toString('base64url');
  const head = enc(header);
  const body = enc(payload);
  const hmac = crypto.createHmac(ALG, secret).update(`${head}.${body}`).digest('base64url');
  return `${head}.${body}.${hmac}`;
}

export function verify<T = any>(token: string): T | null {
  const secret = getFormsSecret();
  if (!secret) return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const [head, body, sig] = parts;
  const hmac = crypto.createHmac(ALG, secret).update(`${head}.${body}`).digest('base64url');
  if (hmac !== sig) return null;
  try {
    const json = JSON.parse(Buffer.from(body, 'base64url').toString('utf-8'));
    if (json.exp && Date.now() > Number(json.exp)) return null;
    return json as T;
  } catch {
    return null;
  }
}


