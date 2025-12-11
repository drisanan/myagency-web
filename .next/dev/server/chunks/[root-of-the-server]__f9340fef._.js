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
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

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
"[project]/app/api/gmail/utils.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "toBase64Url",
    ()=>toBase64Url
]);
function toBase64Url(str) {
    return Buffer.from(str).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
}),
"[project]/app/api/gmail/create-draft/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$api$2f$google$2f$tokenStore$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/api/google/tokenStore.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$api$2f$gmail$2f$utils$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/api/gmail/utils.ts [app-route] (ecmascript)");
;
;
;
function stripMailto(s) {
    let out = s.trim();
    if (out.toLowerCase().startsWith('mailto:')) {
        out = out.slice(7);
    }
    const q = out.indexOf('?');
    if (q >= 0) out = out.slice(0, q);
    return out.trim();
}
function extractAngleBracketEmails(s) {
    const out = [];
    const regex = /<([^<>\s@]+@[^<>\s@]+\.[^<>\s@]+)>/g;
    let m;
    while((m = regex.exec(s)) !== null){
        out.push(m[1]);
    }
    return out;
}
function splitEmails(input) {
    return input.split(/[,\s;]+/g).map((s)=>s.trim()).filter(Boolean);
}
function isValidEmail(s) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s) && !/[\r\n]/.test(s);
}
async function POST(req) {
    try {
        const { clientId, to, subject, html, tokens: inlineTokens } = await req.json();
        console.info('[gmail-draft:start]', {
            clientId,
            toCount: to?.length || 0,
            subjectLength: subject?.length || 0,
            hasInlineTokens: Boolean(inlineTokens)
        });
        if (!clientId) return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            ok: false,
            error: 'Missing clientId'
        }, {
            status: 400
        });
        if (!to?.length) return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            ok: false,
            error: 'Missing recipients'
        }, {
            status: 400
        });
        const candidates = [];
        (to || []).forEach((raw)=>{
            if (typeof raw !== 'string') return;
            // Prefer angle-bracket extraction if present: "Name <email@domain>"
            const angled = extractAngleBracketEmails(raw);
            if (angled.length) {
                angled.forEach((e)=>candidates.push(e));
                return;
            }
            // Otherwise split on separators and strip mailto/query and quotes
            splitEmails(raw).forEach((tok)=>{
                const cleaned = stripMailto(tok.replace(/^["'()]+|["'()]+$/g, ''));
                if (cleaned) candidates.push(cleaned);
            });
        });
        const validRecipients = Array.from(new Set(candidates.filter(isValidEmail)));
        console.info('[gmail-draft:recipients]', {
            clientId,
            requested: to?.length || 0,
            candidates: candidates.length,
            valid: validRecipients.length
        });
        if (!validRecipients.length) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                ok: false,
                error: 'No valid recipient emails'
            }, {
                status: 400
            });
        }
        const storeTokens = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$api$2f$google$2f$tokenStore$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getTokens"])(clientId);
        const tokens = inlineTokens || storeTokens;
        console.info('[gmail-draft:tokens]', {
            clientId,
            inline: Boolean(inlineTokens),
            exists: Boolean(tokens),
            hasAccess: Boolean(tokens?.access_token),
            hasRefresh: Boolean(tokens?.refresh_token)
        });
        if (!tokens?.refresh_token && !tokens?.access_token) {
            console.warn('[gmail-draft:unauthorized]', {
                clientId
            });
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                ok: false,
                error: 'Gmail not connected for this client'
            }, {
                status: 401
            });
        }
        const { google } = await __turbopack_context__.A("[project]/node_modules/googleapis/build/src/index.js [app-route] (ecmascript, async loader)");
        const oAuth2Client = new google.auth.OAuth2(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET, process.env.GOOGLE_REDIRECT_URI);
        oAuth2Client.setCredentials(tokens);
        const gmail = google.gmail({
            version: 'v1',
            auth: oAuth2Client
        });
        // RFC 2047 encode subject to safely include unicode in header
        const encodedSubjectHeader = subject ? `Subject: =?UTF-8?B?${Buffer.from(subject).toString('base64')}?=` : 'Subject: ';
        console.log('[gmail-draft:pre = to-header]', {
            recipients: validRecipients
        });
        const toHeader = validRecipients.join(', ');
        console.info('[gmail-draft:to-header]', {
            toHeader,
            recipients: validRecipients
        });
        const raw = [
            `To: ${toHeader}`,
            encodedSubjectHeader,
            'MIME-Version: 1.0',
            'Content-Type: text/html; charset=utf-8',
            '',
            html || ''
        ].join('\r\n');
        const encoded = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$api$2f$gmail$2f$utils$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toBase64Url"])(raw);
        const draft = await gmail.users.drafts.create({
            userId: 'me',
            requestBody: {
                message: {
                    raw: encoded
                }
            }
        });
        const openUrl = `https://mail.google.com/mail/u/0/#search/${encodeURIComponent(`in:drafts subject:\"${subject}\"`)}`;
        console.info('[gmail-draft:success]', {
            clientId,
            draftId: draft.data.id,
            messageId: draft.data.message?.id
        });
        // TODO: audit log (agency, impersonatedBy, clientId, to, subject, draftId)
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            ok: true,
            id: draft.data.id,
            messageId: draft.data.message?.id,
            openUrl
        });
    } catch (e) {
        const detail = e?.response?.data?.error?.message || e?.response?.data?.error || e?.message || 'Failed to create draft';
        console.error('[gmail-draft:error]', {
            detail
        });
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            ok: false,
            error: detail
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__f9340fef._.js.map