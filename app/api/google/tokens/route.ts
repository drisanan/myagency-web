import { NextRequest } from 'next/server';
import { proxyBackendJson } from '@/app/api/_lib/backendProxy';

export async function GET(req: NextRequest) {
  return proxyBackendJson(req, '/google/tokens');
}

export async function POST(req: NextRequest) {
  return proxyBackendJson(req, '/google/tokens');
}


