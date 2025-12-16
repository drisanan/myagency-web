import { Handler, ok } from './common';

export const handler: Handler = async () => {
  return ok({ ok: true, service: 'athlete-narrative-api', status: 'healthy' });
};

