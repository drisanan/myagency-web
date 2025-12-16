// Local/form storage removed in favor of API + DynamoDB. Kept as no-op to avoid breaking imports.
export type Submission = { id: string; createdAt: number; data: any; consumed?: boolean };

export function putSubmission(_: string, __: any): Submission {
  return { id: '', createdAt: Date.now(), data: {}, consumed: false };
}

export function listSubmissions(_: string, __ = false): Submission[] {
  return [];
}

export function consumeSubmissions(_: string, __: string[]) {}


