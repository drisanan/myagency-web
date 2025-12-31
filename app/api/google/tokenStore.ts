export type TokenData = {
  access_token?: string;
  refresh_token?: string;
  scope?: string;
  token_type?: string;
  expiry_date?: number;
};

/**
 * In-memory token cache.
 * 
 * NOTE: This is a cache layer only. Primary token storage is in DynamoDB via the backend API.
 * The create-draft route fetches from DynamoDB if this cache is empty.
 * This cache helps reduce API calls for tokens during a single request lifecycle.
 */
const TOKENS: Record<string, TokenData> = {};

export function saveTokens(clientId: string, tokens: TokenData) {
  const key = clientId || 'default';
  console.info('[gmail-token:save]', {
    clientId: key,
    hasAccess: Boolean(tokens?.access_token),
    hasRefresh: Boolean(tokens?.refresh_token),
    expiry: tokens?.expiry_date,
  });
  TOKENS[key] = { ...(TOKENS[key] || {}), ...tokens };
}

export function getTokens(clientId: string): TokenData | undefined {
  const key = clientId || 'default';
  const t = TOKENS[key];
  console.info('[gmail-token:get]', {
    clientId: key,
    exists: Boolean(t),
    hasAccess: Boolean(t?.access_token),
    hasRefresh: Boolean(t?.refresh_token),
  });
  return t;
}

export function clearTokens(clientId?: string) {
  if (clientId) {
    delete TOKENS[clientId];
  } else {
    Object.keys(TOKENS).forEach((k) => delete TOKENS[k]);
  }
}


