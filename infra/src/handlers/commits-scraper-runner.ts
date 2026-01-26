import { withSentry } from '../lib/sentry';
import { scrapeAndPersistCommits } from '@/services/commits';

export const handler = withSentry(async () => {
  const result = await scrapeAndPersistCommits();
  return { ok: true, result };
});
