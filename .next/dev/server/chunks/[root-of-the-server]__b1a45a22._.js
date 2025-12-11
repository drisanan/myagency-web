module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[project]/app/api/google/tokenStore.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "clearTokens",
    ()=>clearTokens,
    "getTokens",
    ()=>getTokens,
    "saveTokens",
    ()=>saveTokens
]);
// WARNING: In-memory store is only for local testing. Replace with a secure DB in production.
const TOKENS = {};
function saveTokens(clientId, tokens) {
    const key = clientId || 'default';
    console.info('[gmail-token:save]', {
        clientId: key,
        hasAccess: Boolean(tokens?.access_token),
        hasRefresh: Boolean(tokens?.refresh_token),
        expiry: tokens?.expiry_date
    });
    TOKENS[key] = {
        ...TOKENS[key] || {},
        ...tokens
    };
}
function getTokens(clientId) {
    const key = clientId || 'default';
    const t = TOKENS[key];
    console.info('[gmail-token:get]', {
        clientId: key,
        exists: Boolean(t),
        hasAccess: Boolean(t?.access_token),
        hasRefresh: Boolean(t?.refresh_token)
    });
    return t;
}
function clearTokens(clientId) {
    if (clientId) {
        delete TOKENS[clientId];
    } else {
        Object.keys(TOKENS).forEach((k)=>delete TOKENS[k]);
    }
}
}),
"[project]/app/api/google/oauth/callback/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$api$2f$google$2f$tokenStore$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/api/google/tokenStore.ts [app-route] (ecmascript)");
;
async function GET(req) {
    const url = new URL(req.url);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state') || '';
    console.info('[gmail-oauth:callback:start]', {
        state,
        hasCode: Boolean(code)
    });
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
</body></html>`, {
            headers: {
                'Content-Type': 'text/html'
            }
        });
    }
    try {
        const { google } = await __turbopack_context__.A("[project]/node_modules/googleapis/build/src/index.js [app-route] (ecmascript, async loader)");
        const oAuth2Client = new google.auth.OAuth2(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET, process.env.GOOGLE_REDIRECT_URI);
        const { tokens } = await oAuth2Client.getToken(code);
        console.info('[gmail-oauth:callback:tokens]', {
            state,
            hasAccess: Boolean(tokens?.access_token),
            hasRefresh: Boolean(tokens?.refresh_token),
            scope: tokens?.scope,
            expiry: tokens?.expiry_date
        });
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$api$2f$google$2f$tokenStore$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["saveTokens"])(state || 'default', tokens);
        console.info('[gmail-oauth:callback:save]', {
            state,
            saved: true
        });
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
</body></html>`, {
            headers: {
                'Content-Type': 'text/html'
            }
        });
    } catch (e) {
        console.error('[gmail-oauth:callback:error]', {
            state,
            message: e?.message
        });
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
</body></html>`, {
            headers: {
                'Content-Type': 'text/html'
            }
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__b1a45a22._.js.map