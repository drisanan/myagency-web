// Mail status now tracked server-side; frontend no-ops to avoid local storage.
export function hasMailed(_: string, __: string): boolean {
  return false;
}

export function markMailed(_: string, __: string[]) {}

export function getMailEntries() {
  return [];
}


