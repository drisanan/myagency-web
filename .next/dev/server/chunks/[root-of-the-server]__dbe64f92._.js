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
"[externals]/crypto [external] (crypto, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("crypto", () => require("crypto"));

module.exports = mod;
}),
"[project]/app/api/forms/token.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "sign",
    ()=>sign,
    "verify",
    ()=>verify
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/crypto [external] (crypto, cjs)");
;
const ALG = 'sha256';
const SECRET = process.env.FORMS_SECRET || 'dev-forms-secret-change-me';
function sign(payload) {
    const header = {
        alg: 'HS256',
        typ: 'JWT'
    };
    const enc = (o)=>Buffer.from(JSON.stringify(o)).toString('base64url');
    const head = enc(header);
    const body = enc(payload);
    const hmac = __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__["default"].createHmac(ALG, SECRET).update(`${head}.${body}`).digest('base64url');
    return `${head}.${body}.${hmac}`;
}
function verify(token) {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const [head, body, sig] = parts;
    const hmac = __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__["default"].createHmac(ALG, SECRET).update(`${head}.${body}`).digest('base64url');
    if (hmac !== sig) return null;
    try {
        const json = JSON.parse(Buffer.from(body, 'base64url').toString('utf-8'));
        if (json.exp && Date.now() > Number(json.exp)) return null;
        return json;
    } catch  {
        return null;
    }
}
}),
"[project]/app/api/forms/store.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "consumeSubmissions",
    ()=>consumeSubmissions,
    "listSubmissions",
    ()=>listSubmissions,
    "putSubmission",
    ()=>putSubmission
]);
const SUBMISSIONS = {};
const STORAGE_KEY = 'form_submissions_v1';
function readStore() {
    if ("TURBOPACK compile-time truthy", 1) return SUBMISSIONS;
    //TURBOPACK unreachable
    ;
}
function writeStore(data) {
    if ("TURBOPACK compile-time truthy", 1) return;
    //TURBOPACK unreachable
    ;
}
// Initialize from storage
Object.assign(SUBMISSIONS, readStore());
function persist() {
    writeStore(SUBMISSIONS);
}
function putSubmission(agencyEmail, data) {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const rec = {
        id,
        createdAt: Date.now(),
        data,
        consumed: false
    };
    if (!SUBMISSIONS[agencyEmail]) SUBMISSIONS[agencyEmail] = [];
    SUBMISSIONS[agencyEmail].unshift(rec);
    persist();
    return rec;
}
function listSubmissions(agencyEmail, includeConsumed = false) {
    const all = SUBMISSIONS[agencyEmail] || [];
    return includeConsumed ? all.slice() : all.filter((s)=>!s.consumed);
}
function consumeSubmissions(agencyEmail, ids) {
    const all = SUBMISSIONS[agencyEmail] || [];
    const set = new Set(ids);
    all.forEach((s)=>{
        if (set.has(s.id)) s.consumed = true;
    });
    persist();
}
}),
"[project]/app/api/forms/submit/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$api$2f$forms$2f$token$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/api/forms/token.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$api$2f$forms$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/api/forms/store.ts [app-route] (ecmascript)");
;
;
;
async function POST(req) {
    try {
        const { searchParams } = new URL(req.url);
        const body = await req.json().catch(()=>({}));
        const token = (body.token || searchParams.get('token') || '').trim();
        const form = body.form || {};
        const payload = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$api$2f$forms$2f$token$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["verify"])(token);
        console.info('[intake-api:submit:start]', {
            hasToken: Boolean(token),
            agencyEmail: payload?.agencyEmail
        });
        if (!payload?.agencyEmail) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                ok: false,
                error: 'Invalid token'
            }, {
                status: 400
            });
        }
        const safeForm = form || {};
        const rec = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$api$2f$forms$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["putSubmission"])(payload.agencyEmail, {
            email: safeForm.email || '',
            password: safeForm.password || '',
            firstName: safeForm.firstName || '',
            lastName: safeForm.lastName || '',
            sport: safeForm.sport || '',
            division: safeForm.division || '',
            graduationYear: safeForm.graduationYear || '',
            radar: safeForm.radar || {}
        });
        console.info('[intake-api:submit:success]', {
            id: rec.id,
            agencyEmail: payload.agencyEmail
        });
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            ok: true,
            id: rec.id
        });
    } catch (e) {
        console.error('[intake-api:submit:error]', {
            error: e?.message
        });
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            ok: false,
            error: e?.message || 'Submit failed'
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__dbe64f92._.js.map