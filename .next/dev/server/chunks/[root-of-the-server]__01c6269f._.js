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
"[project]/services/recruitingPeriods.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "listRecruitingPeriods",
    ()=>listRecruitingPeriods,
    "upsertRecruitingPeriods",
    ()=>upsertRecruitingPeriods
]);
const STORAGE_KEY = 'recruiting_periods_data';
const SEED = [
    // Football FBS (multiple quiet/contact windows)
    {
        id: 'fb-dead-jan',
        sport: 'Football',
        label: 'Dead Period',
        type: 'dead',
        startDate: '2025-01-06',
        endDate: '2025-01-12'
    },
    {
        id: 'fb-contact-jan',
        sport: 'Football',
        label: 'Contact Period',
        type: 'contact',
        startDate: '2025-01-13',
        endDate: '2025-02-02'
    },
    {
        id: 'fb-quiet-dec',
        sport: 'Football',
        label: 'Quiet Period',
        type: 'quiet',
        startDate: '2025-12-01',
        endDate: '2025-12-21'
    },
    {
        id: 'fb-contact-dec',
        sport: 'Football',
        label: 'Contact Period',
        type: 'contact',
        startDate: '2025-12-31',
        endDate: '2026-01-04'
    },
    {
        id: 'fb-quiet-jan',
        sport: 'Football',
        label: 'Quiet Period',
        type: 'quiet',
        startDate: '2026-01-11',
        endDate: '2026-01-11'
    },
    {
        id: 'fb-quiet-feb',
        sport: 'Football',
        label: 'Quiet Period',
        type: 'quiet',
        startDate: '2026-02-01',
        endDate: '2026-02-01'
    },
    {
        id: 'fb-quiet-mar',
        sport: 'Football',
        label: 'Quiet Period',
        type: 'quiet',
        startDate: '2026-03-02',
        endDate: '2026-04-14'
    },
    {
        id: 'fb-quiet-jun',
        sport: 'Football',
        label: 'Quiet Period',
        type: 'quiet',
        startDate: '2026-05-28',
        endDate: '2026-06-22'
    },
    {
        id: 'fb-test-feb',
        sport: 'Football',
        label: 'SAT Window',
        type: 'test',
        startDate: '2025-02-08',
        endDate: '2025-02-08'
    },
    // Football FCS quiet windows
    {
        id: 'fcs-quiet-dec',
        sport: 'Football FCS',
        label: 'Quiet Period',
        type: 'quiet',
        startDate: '2025-12-19',
        endDate: '2025-12-21'
    },
    {
        id: 'fcs-quiet-dec2',
        sport: 'Football FCS',
        label: 'Quiet Period',
        type: 'quiet',
        startDate: '2025-12-31',
        endDate: '2026-01-04'
    },
    {
        id: 'fcs-quiet-jan',
        sport: 'Football FCS',
        label: 'Quiet Period',
        type: 'quiet',
        startDate: '2026-01-11',
        endDate: '2026-01-11'
    },
    {
        id: 'fcs-quiet-feb',
        sport: 'Football FCS',
        label: 'Quiet Period',
        type: 'quiet',
        startDate: '2026-02-01',
        endDate: '2026-02-01'
    },
    {
        id: 'fcs-quiet-mar',
        sport: 'Football FCS',
        label: 'Quiet Period',
        type: 'quiet',
        startDate: '2026-03-02',
        endDate: '2026-04-14'
    },
    // Baseball quiet windows
    {
        id: 'bb-quiet-aug',
        sport: 'Baseball',
        label: 'Quiet Period',
        type: 'quiet',
        startDate: '2025-08-18',
        endDate: '2025-09-11'
    },
    {
        id: 'bb-quiet-oct',
        sport: 'Baseball',
        label: 'Quiet Period',
        type: 'quiet',
        startDate: '2025-10-13',
        endDate: '2026-02-28'
    },
    {
        id: 'bb-quiet-dec',
        sport: 'Baseball',
        label: 'Quiet Period',
        type: 'quiet',
        startDate: '2025-12-08',
        endDate: '2025-12-21'
    },
    // Men's Basketball quiet/contact
    {
        id: 'mbb-quiet-aug',
        sport: "Men's Basketball",
        label: 'Quiet Period',
        type: 'quiet',
        startDate: '2025-08-01',
        endDate: '2025-09-02'
    },
    {
        id: 'mbb-contact-may',
        sport: "Men's Basketball",
        label: 'Contact Period',
        type: 'contact',
        startDate: '2026-05-01',
        endDate: '2026-06-30'
    },
    {
        id: 'mbb-quiet-dec',
        sport: "Men's Basketball",
        label: 'Quiet Period',
        type: 'quiet',
        startDate: '2025-12-08',
        endDate: '2025-12-21'
    },
    // Women's Basketball quiet/contact
    {
        id: 'wbb-quiet-aug',
        sport: "Women's Basketball",
        label: 'Quiet Period',
        type: 'quiet',
        startDate: '2025-08-01',
        endDate: '2025-08-31'
    },
    {
        id: 'wbb-contact-mar',
        sport: "Women's Basketball",
        label: 'Contact Period',
        type: 'contact',
        startDate: '2026-03-01',
        endDate: '2026-04-01'
    },
    {
        id: 'wbb-quiet-dec',
        sport: "Women's Basketball",
        label: 'Quiet Period',
        type: 'quiet',
        startDate: '2025-12-08',
        endDate: '2025-12-21'
    },
    // Women's Volleyball quiet windows
    {
        id: 'wvb-quiet-aug',
        sport: "Women's Volleyball",
        label: 'Quiet Period',
        type: 'quiet',
        startDate: '2025-08-01',
        endDate: '2025-08-31'
    },
    {
        id: 'wvb-quiet-dec',
        sport: "Women's Volleyball",
        label: 'Quiet Period',
        type: 'quiet',
        startDate: '2025-12-08',
        endDate: '2025-12-21'
    },
    // Softball quiet windows
    {
        id: 'soft-quiet-dec',
        sport: 'Softball',
        label: 'Quiet Period',
        type: 'quiet',
        startDate: '2025-12-08',
        endDate: '2025-12-21'
    },
    // Soccer quiet windows
    {
        id: 'msoc-quiet-dec',
        sport: "Men's Soccer",
        label: 'Quiet Period',
        type: 'quiet',
        startDate: '2025-12-08',
        endDate: '2025-12-21'
    },
    {
        id: 'wsoc-quiet-dec',
        sport: "Women's Soccer",
        label: 'Quiet Period',
        type: 'quiet',
        startDate: '2025-12-08',
        endDate: '2025-12-21'
    },
    // Lacrosse quiet windows
    {
        id: 'mlax-quiet-dec',
        sport: "Men's Lacrosse",
        label: 'Quiet Period',
        type: 'quiet',
        startDate: '2025-12-08',
        endDate: '2025-12-23'
    },
    {
        id: 'wlax-quiet-dec',
        sport: "Women's Lacrosse",
        label: 'Quiet Period',
        type: 'quiet',
        startDate: '2025-12-08',
        endDate: '2025-12-23'
    }
];
function readStore() {
    if ("TURBOPACK compile-time truthy", 1) return [
        ...SEED
    ];
    //TURBOPACK unreachable
    ;
    const raw = undefined;
}
function writeStore(items) {
    if ("TURBOPACK compile-time truthy", 1) return;
    //TURBOPACK unreachable
    ;
}
let PERIODS = readStore();
function buildFallbackPeriods(sport) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startQuiet = new Date(today);
    const endQuiet = new Date(today);
    endQuiet.setDate(endQuiet.getDate() + 6);
    const startContact = new Date(today);
    startContact.setDate(startContact.getDate() + 7);
    const endContact = new Date(today);
    endContact.setDate(endContact.getDate() + 13);
    const iso = (d)=>d.toISOString().slice(0, 10);
    return [
        {
            id: `${sport}-quiet-fallback`,
            sport,
            label: 'Quiet Period',
            type: 'quiet',
            startDate: iso(startQuiet),
            endDate: iso(endQuiet)
        },
        {
            id: `${sport}-contact-fallback`,
            sport,
            label: 'Contact Period',
            type: 'contact',
            startDate: iso(startContact),
            endDate: iso(endContact)
        }
    ];
}
function listRecruitingPeriods(sport) {
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    const filtered = PERIODS.filter((p)=>p.sport === sport).sort((a, b)=>a.startDate.localeCompare(b.startDate));
    if (filtered.length === 0) {
        return buildFallbackPeriods(sport);
    }
    return filtered;
}
function upsertRecruitingPeriods(periods) {
    PERIODS = periods;
    writeStore(PERIODS);
    return PERIODS;
}
}),
"[project]/app/api/recruiting-periods/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$recruitingPeriods$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/services/recruitingPeriods.ts [app-route] (ecmascript)");
;
;
async function GET(req) {
    const { searchParams } = new URL(req.url);
    const sport = searchParams.get('sport') || 'Football';
    const data = (0, __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$recruitingPeriods$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["listRecruitingPeriods"])(sport);
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
        ok: true,
        data
    });
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__01c6269f._.js.map