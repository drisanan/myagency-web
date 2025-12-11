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
"[project]/app/api/google/tokens/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET,
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$api$2f$google$2f$tokenStore$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/api/google/tokenStore.ts [app-route] (ecmascript)");
;
;
async function GET(req) {
    const { searchParams } = new URL(req.url);
    const clientId = searchParams.get('clientId') || '';
    const tokens = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$api$2f$google$2f$tokenStore$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getTokens"])(clientId);
    console.info('[gmail-tokens:get]', {
        clientId,
        exists: Boolean(tokens),
        hasAccess: Boolean(tokens?.access_token),
        hasRefresh: Boolean(tokens?.refresh_token)
    });
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
        ok: true,
        tokens: tokens || null
    });
}
async function POST(req) {
    try {
        const { clientId, tokens } = await req.json();
        if (!clientId || !tokens) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                ok: false,
                error: 'Missing clientId or tokens'
            }, {
                status: 400
            });
        }
        console.info('[gmail-tokens:post]', {
            clientId,
            hasAccess: Boolean(tokens?.access_token),
            hasRefresh: Boolean(tokens?.refresh_token),
            expiry: tokens?.expiry_date
        });
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$api$2f$google$2f$tokenStore$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["saveTokens"])(clientId, tokens);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            ok: true
        });
    } catch (e) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            ok: false,
            error: e?.message || 'Failed to import tokens'
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__ba2e2fd5._.js.map