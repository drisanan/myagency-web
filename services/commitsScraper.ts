import fetch from 'node-fetch';
// lightweight cheerio import (installed in dev deps)
import * as cheerio from 'cheerio';

export type ScrapedCommit = {
  id: string;
  rank?: number;
  name: string;
  position?: string;
  university?: string;
  logo?: string;
  commitDate?: string;
  classYear?: string;
  hometown?: string;
  highSchool?: string;
};

function cleanName(raw: string) {
  return raw
    .replace(/video/gi, '')
    .replace(/scouts? report/gi, '')
    .replace(/\|/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

function parseSchoolFromHref(href?: string) {
  if (!href) return '';
  const parts = href.split('/').filter(Boolean);
  const last = parts[parts.length - 1] || '';
  return last
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (m) => m.toUpperCase())
    .trim();
}

function extractImgParam(src?: string) {
  if (!src) return '';
  const idx = src.indexOf('img=');
  if (idx === -1) return src || '';
  const val = src.slice(idx + 4);
  return val ? `https://a.espncdn.com/combiner/i?img=${val}` : src || '';
}

function splitSchoolCell(raw: string) {
  const parts = raw.split('(');
  const cityState = parts[0]?.trim();
  const hs = parts[1]?.replace(')', '').trim();
  let hometown: string | undefined;
  let highSchool: string | undefined;
  if (cityState) hometown = cityState;
  if (hs) highSchool = hs;
  return { hometown, highSchool };
}

async function scrapeESPNClass(year: string): Promise<ScrapedCommit[]> {
  const url = `https://www.espn.com/college-sports/football/recruiting/rankings/scnext300boys/_/view/rn300?class=${year}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ESPN ${year}: ${res.status}`);
  const html = await res.text();
  const $ = cheerio.load(html);
  const rows: ScrapedCommit[] = [];

  $('tbody tr').each((_: any, el: any) => {
    const cols = $(el).find('td');
    const rank = parseInt($(cols[0]).text().trim(), 10);
    const nameRaw = $(cols[1]).text().trim();
    const name = cleanName(nameRaw);
    const position = $(cols[2]).text().trim();

    // SCHOOL column: committed school + logo
    const schoolTd = $(cols[cols.length - 1]);
    const schoolAnchor = schoolTd.find('a').first();
    const schoolHref = schoolAnchor.attr('href') || '';
    const universityText = schoolTd.find('.school-name').text().replace(/\s+/g, ' ').trim();
    const university = (universityText || parseSchoolFromHref(schoolHref) || '').trim() || undefined;

    const schoolImg = schoolTd.find('img').attr('src') || '';
    const logo = extractImgParam(schoolImg) || undefined;
    if (!logo) return; // skip entries without a committed school/logo

    const { hometown, highSchool } = splitSchoolCell($(cols[3]).text().trim());
    if (name) {
      rows.push({
        id: `fb-top-${year}-${rank || rows.length + 1}`,
        rank: isNaN(rank) ? undefined : rank,
        name,
        position,
        university,
        logo,
        classYear: year,
        hometown,
        highSchool,
      });
    }
  });
  return rows;
}

export async function scrapeFootballTop(): Promise<ScrapedCommit[]> {
  const classes = ['2026', '2027'];
  const all: ScrapedCommit[] = [];
  for (const yr of classes) {
    try {
      const rows = await scrapeESPNClass(yr);
      all.push(...rows);
    } catch (e) {
      // continue
    }
  }
  const sorted = all.sort((a, b) => (a.rank ?? 9999) - (b.rank ?? 9999));
  return sorted.slice(0, 50);
}

async function scrapeESPNBasketballClass(year: string): Promise<ScrapedCommit[]> {
  const url = `https://www.espn.com/college-sports/basketball/recruiting/rankings/scnext300boys?class=${year}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ESPN basketball ${year}: ${res.status}`);
  const html = await res.text();
  const $ = cheerio.load(html);
  const rows: ScrapedCommit[] = [];

  $('tbody tr').each((_: any, el: any) => {
    const cols = $(el).find('td');
    const rank = parseInt($(cols[0]).text().trim(), 10);
    const nameRaw = $(cols[1]).text().trim();
    const name = cleanName(nameRaw);
    const position = $(cols[2]).text().trim();
    const schoolTd = $(cols[cols.length - 1]);
    const schoolAnchor = schoolTd.find('a').first();
    const schoolHref = schoolAnchor.attr('href') || '';
    const universityText = schoolTd.find('.school-name').text().replace(/\s+/g, ' ').trim();
    const university = (universityText || parseSchoolFromHref(schoolHref) || '').trim() || undefined;

    const schoolImg = schoolTd.find('img').attr('src') || '';
    const logo = extractImgParam(schoolImg) || undefined;
    if (!logo) return; // skip entries without a committed school/logo

    const { hometown, highSchool } = splitSchoolCell($(cols[3]).text().trim());
    if (name) {
      rows.push({
        id: `bb-top-${year}-${rank || rows.length + 1}`,
        rank: isNaN(rank) ? undefined : rank,
        name,
        position,
        university,
        logo,
        classYear: year,
        hometown,
        highSchool,
      });
    }
  });
  return rows;
}

export async function scrapeBasketballTop(): Promise<ScrapedCommit[]> {
  const classes = ['2026', '2027'];
  const all: ScrapedCommit[] = [];
  for (const yr of classes) {
    try {
      const rows = await scrapeESPNBasketballClass(yr);
      all.push(...rows);
    } catch (e) {
      // continue
    }
  }
  const sorted = all.sort((a, b) => (a.rank ?? 9999) - (b.rank ?? 9999));
  return sorted.slice(0, 50);
}


