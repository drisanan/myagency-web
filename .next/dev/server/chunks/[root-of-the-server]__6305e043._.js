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
"[externals]/path [external] (path, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("path", () => require("path"));

module.exports = mod;
}),
"[externals]/fs [external] (fs, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("fs", () => require("fs"));

module.exports = mod;
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
const FILE_PATH = (()=>{
    try {
        const path = __turbopack_context__.r("[externals]/path [external] (path, cjs)");
        return path.join(process.cwd(), 'tmp-forms-submissions.json');
    } catch  {
        return null;
    }
})();
const fs = (()=>{
    try {
        return __turbopack_context__.r("[externals]/fs [external] (fs, cjs)");
    } catch  {
        return null;
    }
})();
function readStore() {
    if ("TURBOPACK compile-time truthy", 1) {
        if (fs && FILE_PATH && fs.existsSync(FILE_PATH)) {
            try {
                const raw = fs.readFileSync(FILE_PATH, 'utf-8');
                return raw ? JSON.parse(raw) : {};
            } catch  {
                return {};
            }
        }
        return {};
    }
    //TURBOPACK unreachable
    ;
}
function writeStore(data) {
    if ("TURBOPACK compile-time truthy", 1) {
        try {
            if (fs && FILE_PATH) {
                const path = __turbopack_context__.r("[externals]/path [external] (path, cjs)");
                const dir = path.dirname(FILE_PATH);
                if (!fs.existsSync(dir)) fs.mkdirSync(dir, {
                    recursive: true
                });
                fs.writeFileSync(FILE_PATH, JSON.stringify(data), 'utf-8');
            }
        } catch  {
        // ignore
        }
    } else //TURBOPACK unreachable
    ;
}
function syncFromStorage() {
    const latest = readStore();
    // Replace in-memory with latest
    Object.keys(SUBMISSIONS).forEach((k)=>delete SUBMISSIONS[k]);
    Object.entries(latest).forEach(([k, v])=>{
        SUBMISSIONS[k] = v;
    });
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
    syncFromStorage();
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
"[project]/app/api/forms/submissions/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$api$2f$forms$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/api/forms/store.ts [app-route] (ecmascript)");
;
;
async function GET(req) {
    const { searchParams } = new URL(req.url);
    const agencyEmail = (searchParams.get('agencyEmail') || '').trim();
    if (!agencyEmail) return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
        ok: false,
        error: 'Missing agencyEmail'
    }, {
        status: 400
    });
    const items = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$api$2f$forms$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["listSubmissions"])(agencyEmail, false);
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
        ok: true,
        items
    });
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__6305e043._.js.map