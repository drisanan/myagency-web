import { NextResponse } from 'next/server';

const bearerToken_new = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjb21wYW55X2lkIjoiMVVsY3o1akRSNjU3SHBQQUhTRXIiLCJ2ZXJzaW9uIjoxLCJpYXQiOjE3NjU1NjAxNDk2MzAsInN1YiI6ImJmaXRFa2pvM2tBenFlaXlkMmhmIn0.d4IzBIrDouTnSq4EraYL0YmfZP54lpDW4rMP3MkCXKY';
const accessCodeFieldId = 't6VuS58tw4n5DEfHTAmp';

const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || 'https://master.d2yp6hyv6u0efd.amplifyapp.com';

function cors(origin: string) {
  const allowOrigin = origin || ALLOWED_ORIGIN;
  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    'Access-Control-Allow-Methods': 'POST,OPTIONS',
  };
}

export async function OPTIONS(req: Request) {
  const origin = req.headers.get('origin') || req.headers.get('Origin') || ALLOWED_ORIGIN;
  return new NextResponse(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { ...cors(origin), 'Content-Type': 'application/json' },
  });
}

export async function POST(req: Request) {
  const origin = req.headers.get('origin') || req.headers.get('Origin') || ALLOWED_ORIGIN;
  const headers = { ...cors(origin), 'Content-Type': 'application/json' };
  try {
    const { email, phone, accessCode } = await req.json();
    if (!email || !phone || !accessCode) {
      return NextResponse.json({ ok: false, error: 'Missing credentials' }, { status: 400, headers });
    }
    const emailTrim = String(email).trim();
    const phoneTrim = String(phone).trim();
    const accessCodeInput = String(accessCode).trim();
    if (!/^\+?\d+$/.test(phoneTrim)) {
      return NextResponse.json({ ok: false, error: 'Invalid phone' }, { status: 400 });
    }
    if (!/^\d+$/.test(accessCodeInput)) {
      return NextResponse.json({ ok: false, error: 'Invalid access code format' }, { status: 400 });
    }

    const encodedEmail = encodeURIComponent(emailTrim);
    const encodedPhone = encodeURIComponent(phoneTrim);
    const apiUrl = `https://rest.gohighlevel.com/v1/contacts/lookup?email=${encodedEmail}&phone=${encodedPhone}`;

    const res = await fetch(apiUrl, {
      headers: {
        Authorization: `Bearer ${bearerToken}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    const data = await res.json();
    if (!res.ok) {
      const errMsg = data?.message || 'Lookup failed';
      return NextResponse.json({ ok: false, error: errMsg }, { status: res.status, headers });
    }
    const contact = data?.contacts?.[0];
    if (!contact) return NextResponse.json({ ok: false, error: 'Contact not found' }, { status: 404, headers });

    const accessField = (contact.customField || []).find((f: any) => f.id === accessCodeFieldId);
    const storedAccessCode = accessField?.value;
    const storedAccessCodeStr = storedAccessCode === undefined || storedAccessCode === null ? '' : String(storedAccessCode).trim();
    if (!storedAccessCodeStr || storedAccessCodeStr !== accessCodeInput) {
      return NextResponse.json({ ok: false, error: 'Invalid access code' }, { status: 401 });
    }

    return NextResponse.json(
      {
        ok: true,
        contact: {
          id: contact.id,
          email: contact.email,
          firstName: contact.firstName,
          lastName: contact.lastName,
          phone: contact.phone,
          accessCode: storedAccessCode,
        },
      },
      { status: 200, headers },
    );
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'Server error' }, { status: 500, headers });
  }
}

