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
"[project]/app/api/metrics/store.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getStats",
    ()=>getStats,
    "recordClick",
    ()=>recordClick,
    "recordOpen",
    ()=>recordOpen,
    "recordSend",
    ()=>recordSend,
    "todayISO",
    ()=>todayISO
]);
const sends = {};
const opens = {};
const clicks = {};
function todayISO(d = new Date()) {
    return d.toISOString().slice(0, 10);
}
function ensureCount(map, agency, day) {
    if (!map[agency]) map[agency] = {};
    if (!map[agency][day]) map[agency][day] = 0;
}
function ensureSet(map, agency, day) {
    if (!map[agency]) map[agency] = {};
    if (!map[agency][day]) map[agency][day] = new Set();
}
function recordSend(agencyEmail, day, count) {
    if (!agencyEmail || !day || !Number.isFinite(count)) return;
    ensureCount(sends, agencyEmail, day);
    sends[agencyEmail][day] += Math.max(0, count);
}
function recordOpen(agencyEmail, day, tid) {
    if (!agencyEmail || !day || !tid) return;
    ensureSet(opens, agencyEmail, day);
    opens[agencyEmail][day].add(tid);
}
function recordClick(agencyEmail, day, tid) {
    if (!agencyEmail || !day || !tid) return;
    ensureSet(clicks, agencyEmail, day);
    clicks[agencyEmail][day].add(tid);
}
function getStats(agencyEmail, days) {
    const out = [];
    const base = new Date();
    let totalSends = 0;
    let totalOpens = 0;
    for(let i = days - 1; i >= 0; i--){
        const d = new Date(base);
        d.setDate(base.getDate() - i);
        const k = todayISO(d);
        const s = sends[agencyEmail]?.[k] || 0;
        const o = opens[agencyEmail]?.[k]?.size || 0;
        const c = clicks[agencyEmail]?.[k]?.size || 0;
        totalSends += s;
        totalOpens += o;
        out.push({
            date: k,
            sends: s,
            opens: o,
            clicks: c
        });
    }
    const openRate = totalSends > 0 ? totalOpens / totalSends : 0;
    return {
        days: out,
        totals: {
            sends: totalSends,
            opens: totalOpens
        },
        openRate
    };
}
}),
"[project]/app/api/metrics/stats/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$api$2f$metrics$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/api/metrics/store.ts [app-route] (ecmascript)");
;
;
async function GET(req) {
    const { searchParams } = new URL(req.url);
    const agencyEmail = (searchParams.get('agencyEmail') || '').trim();
    const days = Math.max(1, Math.min(60, Number(searchParams.get('days') || 14)));
    if (!agencyEmail) return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
        ok: false,
        error: 'Missing agencyEmail'
    }, {
        status: 400
    });
    const stats = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$api$2f$metrics$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getStats"])(agencyEmail, days);
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
        ok: true,
        ...stats
    });
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__c7f59553._.js.map