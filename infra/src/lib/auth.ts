import bcrypt from 'bcryptjs';

export async function hashAccessCode(code: string) {
  return bcrypt.hash(code, 10);
}

export async function verifyAccessCode(code: string, hash: string) {
  return bcrypt.compare(code, hash);
}

