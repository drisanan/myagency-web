/**
 * Strips all non-digit characters from a phone string.
 * Both storage and comparison should use this to avoid format mismatches
 * (e.g. "1-(234)-567-8901" vs "12345678901").
 */
export function normalizePhoneDigits(phone: string | undefined | null): string {
  return String(phone || '').replace(/\D/g, '');
}
