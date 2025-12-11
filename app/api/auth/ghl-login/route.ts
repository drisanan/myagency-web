import { NextResponse } from 'next/server';

const bearerToken =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJsb2NhdGlvbl9pZCI6InNreFdlMVVIV29URXJURHBienFVIiwiY29tcGFueV9pZCI6IlFEQUxhVGNVQWNpNTdVT2hwaUVxIiwidmVyc2lvbiI6MSwiaWF0IjoxNjk0NzEyNDAzMDYzLCJzdWIiOiJ1c2VyX2lkIn0.N_UmYQr-Ls_THm8iYDBBEZI1_RKqZGlOUPI2t0ncfRE';

const accessCodeFieldId = 't6VuS58tw4n5DEfHTAmp';

export async function POST(req: Request) {
  try {
    const { email, phone, accessCode } = await req.json();
    if (!email || !phone || !accessCode) {
      return NextResponse.json({ ok: false, error: 'Missing credentials' }, { status: 400 });
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
      return NextResponse.json({ ok: false, error: errMsg }, { status: res.status });
    }
    const contact = data?.contacts?.[0];
    if (!contact) return NextResponse.json({ ok: false, error: 'Contact not found' }, { status: 404 });

    const accessField = (contact.customField || []).find((f: any) => f.id === accessCodeFieldId);
    const storedAccessCode = accessField?.value;
    const storedAccessCodeStr = storedAccessCode === undefined || storedAccessCode === null ? '' : String(storedAccessCode).trim();
    if (!storedAccessCodeStr || storedAccessCodeStr !== accessCodeInput) {
      return NextResponse.json({ ok: false, error: 'Invalid access code' }, { status: 401 });
    }

    return NextResponse.json({
      ok: true,
      contact: {
        id: contact.id,
        email: contact.email,
        firstName: contact.firstName,
        lastName: contact.lastName,
        phone: contact.phone,
        accessCode: storedAccessCode,
      },
    });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'Server error' }, { status: 500 });
  }
}

