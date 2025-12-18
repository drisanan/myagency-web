'use client';

import React from 'react';
import { getServiceConfig } from '@/config';

export default function GoogleOauthCallbackPage() {
  const [status, setStatus] = React.useState<'pending' | 'ok' | 'error'>('pending');
  const [message, setMessage] = React.useState<string>('Completing Google OAuth...');

  React.useEffect(() => {
    async function run() {
      try {
        const params = new URLSearchParams(window.location.search);
        const code = params.get('code');
        const state = params.get('state');
        if (!code || !state) {
          setStatus('error');
          setMessage('Missing code or state');
          window.opener?.postMessage({ type: 'google-oauth-error', error: 'missing_code_or_state' }, '*');
          return;
        }
        const { apiBaseUrl } = getServiceConfig();
        const url = `${apiBaseUrl}/google/oauth/callback?code=${encodeURIComponent(code)}&state=${encodeURIComponent(state)}`;
        const res = await fetch(url, { credentials: 'include' });
        if (!res.ok) {
          const text = await res.text().catch(() => '');
          setStatus('error');
          setMessage(`OAuth callback failed: ${res.status} ${text}`);
          window.opener?.postMessage({ type: 'google-oauth-error', error: text || res.status }, '*');
          return;
        }
        setStatus('ok');
        setMessage('Google account connected. You may close this window.');
        window.opener?.postMessage({ type: 'google-oauth-success' }, '*');
        setTimeout(() => window.close(), 1200);
      } catch (e: any) {
        setStatus('error');
        setMessage(e?.message || 'OAuth callback failed');
        window.opener?.postMessage({ type: 'google-oauth-error', error: e?.message }, '*');
      }
    }
    run();
  }, []);

  return (
    <div style={{ fontFamily: 'sans-serif', padding: 24 }}>
      <h2>Google OAuth</h2>
      <p>{message}</p>
      {status === 'pending' && <p>Please wait...</p>}
    </div>
  );
}

