import { NextResponse } from 'next/server';

const INTRO_URL = 'https://sjdvjfu3u5eaukakzmqitoxtme0hvvqw.lambda-url.us-west-2.on.aws/';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const upstream = await fetch(INTRO_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(body),
    });
    const text = await upstream.text();
    if (!upstream.ok) {
      return NextResponse.json({ error: `Upstream ${upstream.status}: ${text}` }, { status: 502 });
    }
    let data: any;
    try {
      data = JSON.parse(text);
    } catch {
      data = { intro: text };
    }
    if (data?.error) {
      return NextResponse.json({ error: data.error }, { status: 502 });
    }
    return NextResponse.json({ intro: data.intro ?? '' });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Proxy error' }, { status: 500 });
  }
}


