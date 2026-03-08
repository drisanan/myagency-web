import { NextRequest } from 'next/server';
import { proxyBackendJson } from '@/app/api/_lib/backendProxy';

export async function GET(req: NextRequest) {
  return proxyBackendJson(req, '/forms/agency');
}


