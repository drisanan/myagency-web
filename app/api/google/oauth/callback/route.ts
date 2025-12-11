import { NextRequest } from 'next/server';
import { saveTokens } from '../../tokenStore';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state') || '';
  console.info('[gmail-oauth:callback:start]', { state, hasCode: Boolean(code) });
  if (!code) {
    return new Response(`<!doctype html>
<html><body><script>
  (function() {
    try {
      if (window.opener) {
        window.opener.postMessage({ type: 'google-oauth-error', reason: 'missing_code' }, '${url.origin}');
      }
    } catch (e) {}
  })();
</script>
<p>Authentication complete. You can close this window.</p>
</body></html>`, { headers: { 'Content-Type': 'text/html' }});
  }

  try {
    const { google } = await import('googleapis');
    const oAuth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );
    const { tokens } = await oAuth2Client.getToken(code);
    console.info('[gmail-oauth:callback:tokens]', {
      state,
      hasAccess: Boolean(tokens?.access_token),
      hasRefresh: Boolean(tokens?.refresh_token),
      scope: tokens?.scope,
      expiry: tokens?.expiry_date,
    });
    const cleanTokens = {
      access_token: tokens?.access_token ?? undefined,
      refresh_token: tokens?.refresh_token ?? undefined,
      scope: tokens?.scope ?? undefined,
      token_type: tokens?.token_type ?? undefined,
      expiry_date: tokens?.expiry_date ?? undefined,
    };
    saveTokens(state || 'default', cleanTokens);
    console.info('[gmail-oauth:callback:save]', { state, saved: true });
    return new Response(`<!doctype html>
<html><body><script>
  (function() {
    try {
      if (window.opener) {
        window.opener.postMessage({ type: 'google-oauth-success', clientId: '${state}' }, '${url.origin}');
      }
    } catch (e) {}
  })();
</script>
<p>Authentication complete. You can close this window.</p>
</body></html>`, { headers: { 'Content-Type': 'text/html' }});
  } catch (e) {
    console.error('[gmail-oauth:callback:error]', { state, message: (e as any)?.message });
    return new Response(`<!doctype html>
<html><body><script>
  (function() {
    try {
      if (window.opener) {
        window.opener.postMessage({ type: 'google-oauth-error', reason: 'exchange_failed' }, '${url.origin}');
      }
    } catch (e) {}
  })();
</script>
<p>Authentication complete. You can close this window.</p>
</body></html>`, { headers: { 'Content-Type': 'text/html' }});
  }
}


