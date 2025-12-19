import crypto from 'crypto';

const ALG = 'sha256';
const SECRET = process.env.FORMS_SECRET || 'dev-forms-secret-change-me';

const enc = (o: any) => Buffer.from(JSON.stringify(o)).toString('base64url');

export function sign(payload: object): string {
  const header = { alg: 'HS256', typ: 'JWT' };
  const head = enc(header);
  const body = enc(payload);
  const hmac = crypto.createHmac(ALG, SECRET).update(`${head}.${body}`).digest('base64url');
  return `${head}.${body}.${hmac}`;
}

export function verify<T = any>(token: string): T | null {
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const [head, body, sig] = parts;
  const hmac = crypto.createHmac(ALG, SECRET).update(`${head}.${body}`).digest('base64url');
  if (hmac !== sig) return null;
  try {
    const json = JSON.parse(Buffer.from(body, 'base64url').toString('utf-8'));
    if (json.exp && Date.now() > Number(json.exp)) return null;
    return json as T;
  } catch {
    return null;
  }
}