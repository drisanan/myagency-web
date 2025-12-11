import { NextRequest, NextResponse } from 'next/server';
import { recordSend, recordOpen, recordClick } from '../store';

type SeedDay = { date: string; sends?: number; opens?: number; clicks?: number };

const ALLOW_SEED = process.env.NODE_ENV !== 'production' || process.env.ALLOW_METRICS_SEED === 'true';

function iso(date: string) {
  try {
    return new Date(date).toISOString().slice(0, 10);
  } catch {
    return '';
  }
}

export async function POST(req: NextRequest) {
  if (!ALLOW_SEED) {
    return NextResponse.json({ ok: false, error: 'Seeding disabled' }, { status: 403 });
  }
  const body = await req.json().catch(() => null);
  const agencyEmail = body?.agencyEmail?.trim?.();
  const days: SeedDay[] = Array.isArray(body?.days) ? body.days : [];
  if (!agencyEmail || !days.length) {
    return NextResponse.json({ ok: false, error: 'agencyEmail and days are required' }, { status: 400 });
  }

  days.forEach((d, dayIdx) => {
    const k = iso(d.date);
    if (!k) return;
    const sends = Number(d.sends) || 0;
    const opens = Number(d.opens) || 0;
    const clicks = Number(d.clicks) || 0;
    if (sends > 0) recordSend(agencyEmail, k, sends);
    for (let i = 0; i < opens; i++) {
      recordOpen(agencyEmail, k, `${k}-open-${dayIdx}-${i}`);
    }
    for (let i = 0; i < clicks; i++) {
      recordClick(agencyEmail, k, `${k}-click-${dayIdx}-${i}`);
    }
  });

  return NextResponse.json({ ok: true });
}

