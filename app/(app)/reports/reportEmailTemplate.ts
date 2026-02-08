/**
 * Builds an HTML email body from report data and selected sections.
 */

export type ReportEmailData = {
  agencyName: string;
  generatedAt: string;
  kpis?: {
    totalAthletes: number;
    emailsSent: number;
    profileViews: number;
    clickRate: string;
    tasksDone: number;
    campaigns: number;
  };
  emailActivity?: Array<{ date: string; sends: number; opens: number }>;
  profileViews?: Array<{ date: string; views: number }>;
  leaderboard?: Array<{
    rank: number;
    name: string;
    emailsSent: number;
    profileViews: number;
    tasksCompleted: number;
    engagementScore: number;
  }>;
};

export type ReportSection = 'kpis' | 'emailActivity' | 'profileViews' | 'leaderboard';

const LIME = '#CCFF00';
const BG = '#0A0A0A';
const CARD_BG = '#1a1a2e';

function kpiRow(data: ReportEmailData['kpis']) {
  if (!data) return '';
  const items = [
    { label: 'Total Athletes', value: String(data.totalAthletes) },
    { label: 'Emails Sent', value: String(data.emailsSent) },
    { label: 'Profile Views', value: String(data.profileViews) },
    { label: 'Click Rate', value: data.clickRate },
    { label: 'Tasks Done', value: String(data.tasksDone) },
    { label: 'Campaigns', value: String(data.campaigns) },
  ];
  const cells = items
    .map(
      (i) => `
    <td style="padding:12px 16px;text-align:center;background:${CARD_BG};border-radius:4px;">
      <div style="font-size:24px;font-weight:800;color:${LIME};margin-bottom:4px;">${i.value}</div>
      <div style="font-size:11px;text-transform:uppercase;letter-spacing:0.08em;color:#ffffff80;">${i.label}</div>
    </td>`,
    )
    .join('');
  return `
    <table width="100%" cellpadding="0" cellspacing="8" style="margin-bottom:24px;">
      <tr>${cells}</tr>
    </table>`;
}

function leaderboardTable(rows: NonNullable<ReportEmailData['leaderboard']>) {
  if (!rows.length) return '';
  const header = `
    <tr style="background:${CARD_BG};">
      <th style="padding:8px 12px;text-align:left;font-size:11px;text-transform:uppercase;color:#ffffff80;letter-spacing:0.06em;">Rank</th>
      <th style="padding:8px 12px;text-align:left;font-size:11px;text-transform:uppercase;color:#ffffff80;">Athlete</th>
      <th style="padding:8px 12px;text-align:center;font-size:11px;text-transform:uppercase;color:#ffffff80;">Emails</th>
      <th style="padding:8px 12px;text-align:center;font-size:11px;text-transform:uppercase;color:#ffffff80;">Views</th>
      <th style="padding:8px 12px;text-align:center;font-size:11px;text-transform:uppercase;color:#ffffff80;">Tasks</th>
      <th style="padding:8px 12px;text-align:center;font-size:11px;text-transform:uppercase;color:#ffffff80;">Score</th>
    </tr>`;
  const body = rows
    .slice(0, 15)
    .map(
      (r) => `
    <tr style="border-bottom:1px solid #ffffff08;">
      <td style="padding:8px 12px;color:${LIME};font-weight:700;">#${r.rank}</td>
      <td style="padding:8px 12px;color:#fff;font-weight:600;">${r.name}</td>
      <td style="padding:8px 12px;text-align:center;color:#ffffffcc;">${r.emailsSent}</td>
      <td style="padding:8px 12px;text-align:center;color:#ffffffcc;">${r.profileViews}</td>
      <td style="padding:8px 12px;text-align:center;color:#ffffffcc;">${r.tasksCompleted}</td>
      <td style="padding:8px 12px;text-align:center;color:${LIME};font-weight:700;">${r.engagementScore}</td>
    </tr>`,
    )
    .join('');
  return `
    <h3 style="color:${LIME};font-size:13px;text-transform:uppercase;letter-spacing:0.1em;margin:24px 0 12px;">Athlete Leaderboard</h3>
    <table width="100%" cellpadding="0" cellspacing="0" style="background:${CARD_BG};border-radius:4px;border-collapse:collapse;">
      ${header}${body}
    </table>`;
}

function activitySummary(
  emailData: ReportEmailData['emailActivity'],
  viewData: ReportEmailData['profileViews'],
) {
  let html = '';
  if (emailData?.length) {
    const totalSent = emailData.reduce((s, d) => s + d.sends, 0);
    const totalOpened = emailData.reduce((s, d) => s + d.opens, 0);
    html += `
      <h3 style="color:${LIME};font-size:13px;text-transform:uppercase;letter-spacing:0.1em;margin:24px 0 12px;">Email Activity (30 days)</h3>
      <p style="color:#ffffffcc;font-size:14px;margin:0 0 8px;">Sent: <strong style="color:#fff;">${totalSent}</strong> &nbsp;|&nbsp; Opened: <strong style="color:#fff;">${totalOpened}</strong></p>`;
  }
  if (viewData?.length) {
    const totalViews = viewData.reduce((s, d) => s + d.views, 0);
    html += `
      <h3 style="color:${LIME};font-size:13px;text-transform:uppercase;letter-spacing:0.1em;margin:24px 0 12px;">Profile Views (7 days)</h3>
      <p style="color:#ffffffcc;font-size:14px;margin:0 0 8px;">Total: <strong style="color:#fff;">${totalViews}</strong></p>`;
  }
  return html;
}

export function buildReportHtml(
  data: ReportEmailData,
  sections: ReportSection[],
): string {
  let body = '';
  if (sections.includes('kpis')) body += kpiRow(data.kpis);
  if (sections.includes('emailActivity') || sections.includes('profileViews')) {
    body += activitySummary(
      sections.includes('emailActivity') ? data.emailActivity : undefined,
      sections.includes('profileViews') ? data.profileViews : undefined,
    );
  }
  if (sections.includes('leaderboard') && data.leaderboard) {
    body += leaderboardTable(data.leaderboard);
  }

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"/></head>
<body style="margin:0;padding:0;background:${BG};font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:${BG};">
    <tr><td align="center">
      <table width="640" cellpadding="0" cellspacing="0" style="max-width:640px;margin:0 auto;padding:32px 24px;">
        <tr><td>
          <h1 style="color:#fff;font-size:22px;font-weight:800;letter-spacing:-0.02em;margin:0 0 4px;">
            ${data.agencyName} — Report
          </h1>
          <p style="color:#ffffff60;font-size:12px;margin:0 0 24px;">
            Generated ${data.generatedAt}
          </p>
          ${body}
          <p style="color:#ffffff40;font-size:11px;margin-top:32px;text-align:center;">
            Powered by My Recruiter Agency
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
