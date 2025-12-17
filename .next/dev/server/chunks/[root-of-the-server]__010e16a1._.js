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
"[project]/services/commits.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "basketballScrapeStatus",
    ()=>basketballScrapeStatus,
    "filterCommits",
    ()=>filterCommits,
    "footballScrapeStatus",
    ()=>footballScrapeStatus,
    "listCommits",
    ()=>listCommits,
    "listCommitsServer",
    ()=>listCommitsServer,
    "upsertCommits",
    ()=>upsertCommits
]);
const footballPositions = [
    'QB',
    'RB',
    'WR',
    'DL',
    'LB',
    'CB',
    'S',
    'TE',
    'OL'
];
const basketballPositions = [
    'PG',
    'SG',
    'SF',
    'PF',
    'C'
];
const sources = [
    'ESPN',
    'Rivals',
    '247Sports'
];
const universities = [
    'Alabama',
    'Georgia',
    'Ohio State',
    'Texas',
    'Duke',
    'Kentucky',
    'Kansas',
    'Gonzaga',
    'Michigan'
];
function isoDaysAgo(days) {
    const d = new Date();
    d.setDate(d.getDate() - days);
    return d.toISOString().slice(0, 10);
}
function makeRecent(sport, prefix, positions) {
    return Array.from({
        length: 50
    }).map((_, i)=>({
            id: `${prefix}-${i + 1}`,
            sport,
            list: 'recent',
            name: `${sport} Recent ${i + 1}`,
            position: positions[i % positions.length],
            university: universities[i % universities.length],
            commitDate: isoDaysAgo(i * 5 + 1),
            source: sources[i % sources.length]
        }));
}
function makeTop(sport, prefix, positions) {
    return Array.from({
        length: 50
    }).map((_, i)=>({
            id: `${prefix}-${i + 1}`,
            sport,
            list: 'top',
            rank: i + 1,
            name: `${sport} Top ${i + 1}`,
            position: positions[i % positions.length],
            university: universities[i % universities.length],
            stars: 5 - i % 3 || 5,
            source: sources[i % sources.length]
        }));
}
const SEED = [
    ...makeRecent('Football', 'fb-rec', footballPositions),
    ...makeRecent('Basketball', 'bb-rec', basketballPositions),
    ...makeTop('Football', 'fb-top', footballPositions),
    ...makeTop('Basketball', 'bb-top', basketballPositions)
];
let COMMITS = [
    ...SEED
];
let SCRAPED_FOOTBALL = false;
let SCRAPED_BASKETBALL = false;
function listCommits(sport, list) {
    const filtered = COMMITS.filter((c)=>c.sport === sport && c.list === list);
    if (list === 'recent') {
        return filtered.sort((a, b)=>(b.commitDate || '').localeCompare(a.commitDate || '')).slice(0, 50);
    }
    return filtered.sort((a, b)=>(a.rank ?? 9999) - (b.rank ?? 9999)).slice(0, 50);
}
function filterCommits(commits, filters) {
    return commits.filter((c)=>{
        const posMatch = filters.position ? (c.position || '').toLowerCase().includes(filters.position.toLowerCase()) : true;
        const uniMatch = filters.university ? (c.university || '').toLowerCase().includes(filters.university.toLowerCase()) : true;
        return posMatch && uniMatch;
    });
}
function upsertCommits(commits) {
    COMMITS = commits;
    return COMMITS;
}
function footballScrapeStatus() {
    return {
        scraped: SCRAPED_FOOTBALL
    };
}
function basketballScrapeStatus() {
    return {
        scraped: SCRAPED_BASKETBALL
    };
}
function listCommitsServer(sport, list) {
    // server-side version that does not touch localStorage
    const filtered = COMMITS.filter((c)=>c.sport === sport && c.list === list);
    if (list === 'recent') {
        return filtered.sort((a, b)=>(b.commitDate || '').localeCompare(a.commitDate || '')).slice(0, 50);
    }
    return filtered.sort((a, b)=>(a.rank ?? 9999) - (b.rank ?? 9999)).slice(0, 50);
}
// Load live football data from scraper (server-side only) at startup
async function loadFootballFromScrape() {
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
     // client skip
    try {
        const { scrapeFootballTop } = await __turbopack_context__.A("[project]/services/commitsScraper.ts [app-route] (ecmascript, async loader)");
        const top = await scrapeFootballTop();
        if (top.length) {
            SCRAPED_FOOTBALL = true;
            const topMapped = top.slice(0, 50).map((c)=>({
                    id: c.id,
                    sport: 'Football',
                    list: 'top',
                    rank: c.rank,
                    name: c.name,
                    position: c.position,
                    university: c.university,
                    stars: 5,
                    logo: c.logo,
                    classYear: c.classYear,
                    hometown: c.hometown,
                    highSchool: c.highSchool,
                    source: 'ESPN 300'
                }));
            const recent = topMapped.map((c, idx)=>({
                    ...c,
                    id: `${c.id}-recent`,
                    list: 'recent',
                    rank: undefined,
                    commitDate: new Date(Date.now() - idx * 24 * 3600 * 1000).toISOString().slice(0, 10)
                }));
            // Merge: keep basketball from current store (may be scraped), replace football
            const existing = COMMITS.filter((c)=>c.sport === 'Basketball');
            COMMITS = [
                ...existing,
                ...topMapped,
                ...recent
            ];
        } else {
            // mark placeholders so tests can detect non-live data
            COMMITS = COMMITS.map((c)=>c.sport === 'Football' ? {
                    ...c,
                    name: `${c.name} (placeholder)`
                } : c);
        }
    } catch (e) {
    // ignore and keep seed
    }
}
async function loadBasketballFromScrape() {
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
     // client skip
    try {
        const { scrapeBasketballTop } = await __turbopack_context__.A("[project]/services/commitsScraper.ts [app-route] (ecmascript, async loader)");
        const top = await scrapeBasketballTop();
        if (top.length) {
            SCRAPED_BASKETBALL = true;
            const topMapped = top.slice(0, 50).map((c)=>({
                    id: c.id,
                    sport: 'Basketball',
                    list: 'top',
                    rank: c.rank,
                    name: c.name,
                    position: c.position,
                    university: c.university,
                    stars: 5,
                    logo: c.logo,
                    classYear: c.classYear,
                    hometown: c.hometown,
                    highSchool: c.highSchool,
                    source: 'ESPN 300'
                }));
            const recent = topMapped.map((c, idx)=>({
                    ...c,
                    id: `${c.id}-recent`,
                    list: 'recent',
                    rank: undefined,
                    commitDate: new Date(Date.now() - idx * 24 * 3600 * 1000).toISOString().slice(0, 10)
                }));
            // Merge: keep football from current store (may be scraped), replace basketball
            const existing = COMMITS.filter((c)=>c.sport === 'Football');
            COMMITS = [
                ...existing,
                ...topMapped,
                ...recent
            ];
        } else {
            COMMITS = COMMITS.map((c)=>c.sport === 'Basketball' ? {
                    ...c,
                    name: `${c.name} (placeholder)`
                } : c);
        }
    } catch (e) {
    // ignore and keep seed
    }
}
// Trigger server-side load
loadFootballFromScrape();
loadBasketballFromScrape();
}),
"[project]/services/commitsCache.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "clearCommitsCache",
    ()=>clearCommitsCache,
    "getCachedCommits",
    ()=>getCachedCommits,
    "rehydrateCommitsCache",
    ()=>rehydrateCommitsCache
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$commits$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/services/commits.ts [app-route] (ecmascript)");
;
const ONE_DAY_MS = 24 * 60 * 60 * 1000;
const cache = new Map();
async function getCachedCommits(sport, list, ttlMs = ONE_DAY_MS) {
    const key = `${sport}-${list}`;
    const now = Date.now();
    const hit = cache.get(key);
    if (hit && now - hit.ts < ttlMs) {
        return hit.data;
    }
    const data = (0, __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$commits$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["listCommitsServer"])(sport, list);
    cache.set(key, {
        data,
        ts: now
    });
    return data;
}
function clearCommitsCache() {
    cache.clear();
}
async function rehydrateCommitsCache() {
    cache.clear();
    const sports = [
        'Football',
        'Basketball'
    ];
    const lists = [
        'recent',
        'top'
    ];
    await Promise.all(sports.flatMap((sport)=>lists.map((list)=>getCachedCommits(sport, list, 0))));
}
}),
"[project]/app/api/commits/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$commitsCache$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/services/commitsCache.ts [app-route] (ecmascript)");
;
;
async function GET(req) {
    const { searchParams } = new URL(req.url);
    const sport = searchParams.get('sport') || 'Football';
    const list = searchParams.get('list') || 'recent';
    const data = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$commitsCache$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getCachedCommits"])(sport, list);
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
        ok: true,
        data
    }, {
        headers: {
            // small client cache plus stale-while-revalidate hint
            'Cache-Control': 'public, max-age=300, stale-while-revalidate=86400'
        }
    });
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__010e16a1._.js.map