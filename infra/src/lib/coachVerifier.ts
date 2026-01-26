export type ScrapedCoach = {
  name: string;
  title?: string;
  email?: string;
};

const HTML_ENTITIES: Record<string, string> = {
  '&nbsp;': ' ',
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&#39;': "'",
  '&quot;': '"',
};

export function decodeHtml(input: string): string {
  return Object.keys(HTML_ENTITIES).reduce((acc, key) => acc.split(key).join(HTML_ENTITIES[key]), input);
}

export function stripTags(input: string): string {
  const noTags = input.replace(/<[^>]*>/g, ' ');
  return decodeHtml(noTags).replace(/\s+/g, ' ').trim();
}

export function normalizeName(input: string): string {
  return (input || '').toLowerCase().replace(/[^a-z]/g, '');
}

function pickName(cells: string[]): string {
  const candidates = cells.filter((c) => c.split(' ').length >= 2);
  return candidates.find((c) => !/staff directory|name|title|email/i.test(c)) || candidates[0] || '';
}

function pickTitle(cells: string[]): string | undefined {
  return cells.find((c) => /coach|coordinator|assistant|director|head/i.test(c));
}

export function extractCoachRows(html: string): ScrapedCoach[] {
  const rows = html.match(/<tr[\s\S]*?<\/tr>/gi) || [];
  const parsed: ScrapedCoach[] = [];

  for (const row of rows) {
    const cells = row.match(/<t[dh][^>]*>[\s\S]*?<\/t[dh]>/gi) || [];
    if (!cells.length) continue;

    const textCells = cells.map((c) => stripTags(c)).filter(Boolean);
    const rowEmail = (row.match(/mailto:([^"'>\s]+)/i) || [])[1];
    const emailCell = textCells.find((c) => c.includes('@'));
    const email = rowEmail || emailCell;

    const name = pickName(textCells);
    const title = pickTitle(textCells);
    if (!name) continue;

    parsed.push({ name, title, email });
  }

  // Fallback: look for mailto links with surrounding text
  const mailtos = html.match(/mailto:[^"'\s>]+/gi) || [];
  if (!parsed.length && mailtos.length) {
    for (const mailto of mailtos) {
      parsed.push({ name: mailto.replace('mailto:', ''), email: mailto.replace('mailto:', '') });
    }
  }

  return parsed;
}

export function selectLandingPage(schoolInfo?: Record<string, any>): string | null {
  if (!schoolInfo) return null;
  const candidates = [
    schoolInfo.LandingPage,
    schoolInfo.landingPage,
    schoolInfo.SportURL,
    schoolInfo.SportUrl,
    schoolInfo.SportSite,
    schoolInfo.LandingPageUrl,
    schoolInfo.Url,
    schoolInfo.URL,
    schoolInfo.Website,
    schoolInfo.website,
  ].filter(Boolean);

  const match = candidates.find((c) => typeof c === 'string' && /^https?:\/\//i.test(c));
  return match || null;
}

