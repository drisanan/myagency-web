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
"[project]/services/agencies.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AGENCIES",
    ()=>AGENCIES,
    "deleteAgency",
    ()=>deleteAgency,
    "getAgencies",
    ()=>getAgencies,
    "getAgencyByEmail",
    ()=>getAgencyByEmail,
    "getAgencyById",
    ()=>getAgencyById,
    "getAgencySettings",
    ()=>getAgencySettings,
    "listAgencies",
    ()=>listAgencies,
    "updateAgencySettings",
    ()=>updateAgencySettings,
    "upsertAgency",
    ()=>upsertAgency
]);
const STORAGE_KEY = 'agencies_data';
function readStore() {
    if ("TURBOPACK compile-time truthy", 1) return [];
    //TURBOPACK unreachable
    ;
    const raw = undefined;
}
function writeStore(items) {
    if ("TURBOPACK compile-time truthy", 1) return;
    //TURBOPACK unreachable
    ;
}
const SEED_AGENCIES = [
    {
        id: 'agency-001',
        name: 'Prime Sports',
        email: 'agency1@an.test',
        settings: {
            primaryColor: '#1976d2'
        }
    },
    {
        id: 'agency-002',
        name: 'NextGen',
        email: 'agency2@an.test',
        settings: {
            primaryColor: '#9c27b0'
        }
    },
    {
        id: 'agency-003',
        name: 'Elite Edge',
        email: 'agency3@an.test',
        settings: {
            primaryColor: '#2e7d32'
        }
    }
];
let AGENCIES = (()=>{
    const fromStore = readStore();
    if (fromStore.length > 0) return fromStore;
    writeStore(SEED_AGENCIES);
    return [
        ...SEED_AGENCIES
    ];
})();
;
async function listAgencies() {
    return AGENCIES.map((a)=>({
            id: a.id,
            name: a.name
        }));
}
async function getAgencies() {
    return [
        ...AGENCIES
    ];
}
async function getAgencyByEmail(email) {
    return AGENCIES.find((a)=>a.email === email) ?? null;
}
async function getAgencyById(id) {
    return AGENCIES.find((a)=>a.id === id) ?? null;
}
async function getAgencySettings(email) {
    const a = AGENCIES.find((x)=>x.email === email);
    return a?.settings ?? {};
}
async function updateAgencySettings(email, settings) {
    const a = AGENCIES.find((x)=>x.email === email);
    if (!a) return {
        ok: false
    };
    a.settings = {
        ...a.settings ?? {},
        ...settings
    };
    writeStore(AGENCIES);
    return {
        ok: true,
        settings: a.settings
    };
}
async function upsertAgency(input) {
    if (input.id) {
        const idx = AGENCIES.findIndex((a)=>a.id === input.id);
        if (idx >= 0) {
            AGENCIES[idx] = {
                ...AGENCIES[idx],
                ...input,
                id: input.id
            };
            writeStore(AGENCIES);
            return {
                id: input.id
            };
        }
    }
    const id = `agency-${(Math.random() * 1e6).toFixed(0)}`;
    AGENCIES.push({
        id,
        name: input.name,
        email: input.email,
        password: input.password,
        ownerFirstName: input.ownerFirstName,
        ownerLastName: input.ownerLastName,
        ownerEmail: input.ownerEmail,
        ownerPhone: input.ownerPhone,
        active: input.active ?? true,
        settings: input.settings ?? {}
    });
    writeStore(AGENCIES);
    return {
        id
    };
}
async function deleteAgency(id) {
    const idx = AGENCIES.findIndex((a)=>a.id === id);
    if (idx >= 0) {
        AGENCIES.splice(idx, 1);
        writeStore(AGENCIES);
        return {
            ok: true
        };
    }
    return {
        ok: false
    };
}
}),
"[project]/app/api/forms/agency/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$api$2f$forms$2f$token$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/api/forms/token.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$agencies$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/services/agencies.ts [app-route] (ecmascript)");
;
;
;
async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const token = (searchParams.get('token') || '').trim();
        const payload = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$api$2f$forms$2f$token$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["verify"])(token || '');
        if (!payload?.agencyEmail) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                ok: false,
                error: 'Invalid token'
            }, {
                status: 400
            });
        }
        const agency = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$agencies$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getAgencyByEmail"])(payload.agencyEmail);
        if (!agency) return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            ok: false,
            error: 'Agency not found'
        }, {
            status: 404
        });
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            ok: true,
            agency: {
                name: agency.name,
                email: agency.email,
                settings: agency.settings || {}
            }
        });
    } catch (e) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            ok: false,
            error: e?.message || 'Failed to resolve agency'
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__fac2169b._.js.map