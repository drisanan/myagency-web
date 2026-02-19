import { NextRequest, NextResponse } from 'next/server';
import { verify } from '../../forms/token';
import { putItem, getItem, deleteItem, queryGSI1 } from '@/infra-adapter/dynamo';
import bcrypt from 'bcryptjs';

function newId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export async function POST(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const body = await req.json().catch(() => ({}));
    const token = (body.token || searchParams.get('token') || '').trim();
    const form = body.form || {};
    const payload = verify<{ agencyEmail: string; exp?: number }>(token);
    console.info('[intake-api:submit:start]', { hasToken: Boolean(token), agencyEmail: payload?.agencyEmail });
    if (!payload?.agencyEmail) {
      return NextResponse.json({ ok: false, error: 'Invalid token' }, { status: 400 });
    }

    const agencies = await queryGSI1(`EMAIL#${payload.agencyEmail}`, 'AGENCY#');
    const agency = (agencies || [])[0] as { id: string; email: string } | undefined;
    if (!agency) {
      return NextResponse.json({ ok: false, error: 'Agency not found' }, { status: 404 });
    }

    const formId = newId('form');
    const now = Date.now();
    const nowIso = new Date().toISOString();

    let clientId: string | undefined;
    if (form.email && form.firstName && form.lastName && form.sport) {
      clientId = newId('client');

      let accessCodeHash: string | undefined;
      if (form.accessCode) {
        accessCodeHash = await bcrypt.hash(form.accessCode, 10);
      }

      const username = form.username?.toLowerCase().replace(/[^a-z0-9-]/g, '') || undefined;

      const clientRec: Record<string, any> = {
        PK: `AGENCY#${agency.id}`,
        SK: `CLIENT#${clientId}`,
        GSI1PK: `EMAIL#${form.email}`,
        GSI1SK: `CLIENT#${clientId}`,
        ...(username ? { GSI3PK: `USERNAME#${username}`, GSI3SK: `CLIENT#${clientId}` } : {}),
        id: clientId,
        email: form.email,
        firstName: form.firstName,
        lastName: form.lastName,
        sport: form.sport,
        agencyId: agency.id,
        agencyEmail: agency.email,
        phone: form.phone || undefined,
        username,
        galleryImages: form.galleryImages || [],
        radar: form.radar || {},
        accessCodeHash,
        authEnabled: Boolean(accessCodeHash),
        accountStatus: 'pending',
        createdAt: nowIso,
        updatedAt: nowIso,
      };
      await putItem(clientRec);

      const tempGmailId = form.tempGmailClientId;
      if (tempGmailId) {
        try {
          const tempKey = { PK: `AGENCY#${agency.id}`, SK: `GMAIL_TOKEN#${tempGmailId}` };
          const tempRec = await getItem(tempKey);
          if (tempRec?.tokens) {
            await putItem({ ...tempRec, PK: `AGENCY#${agency.id}`, SK: `GMAIL_TOKEN#${clientId}`, clientId });
            await deleteItem(tempKey);
          }
        } catch (e) {
          console.error('[intake-api:submit] Gmail token remap failed', e);
        }
      }
    }

    await putItem({
      PK: `AGENCY#${agency.id}`,
      SK: `FORM#${formId}`,
      id: formId,
      createdAt: now,
      consumed: false,
      agencyEmail: agency.email,
      clientId,
      data: form,
    });

    console.info('[intake-api:submit:success]', { id: formId, agencyId: agency.id, clientId });
    return NextResponse.json({ ok: true, id: formId, clientId });
  } catch (e: any) {
    console.error('[intake-api:submit:error]', { error: e?.message });
    return NextResponse.json({ ok: false, error: e?.message || 'Submit failed' }, { status: 500 });
  }
}
