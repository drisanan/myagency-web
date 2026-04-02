/**
 * Shared subject line builder for recruiter emails.
 * Rotates through variants so multi-send batches get varied subjects.
 */
export function buildSubjectLine(
  athleteName: string,
  gradYear: string,
  positionOrSport: string,
  index: number,
): string {
  const safeAthlete = athleteName.trim() || 'Athlete';
  const parts = [safeAthlete, gradYear, positionOrSport].filter(Boolean).join(' ').trim();
  const base = parts || safeAthlete;
  const variants = [
    `${base} Introduction`,
    `${base} Intro`,
    `${base} Recruiting Intro`,
    `${base} Profile`,
    `${base} Highlights`,
  ];
  return variants[index % variants.length];
}
