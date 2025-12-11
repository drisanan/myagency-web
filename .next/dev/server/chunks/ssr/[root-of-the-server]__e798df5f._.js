module.exports = [
"[externals]/node:http [external] (node:http, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:http", () => require("node:http"));

module.exports = mod;
}),
"[externals]/node:https [external] (node:https, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:https", () => require("node:https"));

module.exports = mod;
}),
"[externals]/node:zlib [external] (node:zlib, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:zlib", () => require("node:zlib"));

module.exports = mod;
}),
"[externals]/node:stream [external] (node:stream, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:stream", () => require("node:stream"));

module.exports = mod;
}),
"[externals]/node:buffer [external] (node:buffer, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:buffer", () => require("node:buffer"));

module.exports = mod;
}),
"[externals]/node:util [external] (node:util, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:util", () => require("node:util"));

module.exports = mod;
}),
"[externals]/node:process [external] (node:process, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:process", () => require("node:process"));

module.exports = mod;
}),
"[externals]/node:stream/web [external] (node:stream/web, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:stream/web", () => require("node:stream/web"));

module.exports = mod;
}),
"[externals]/buffer [external] (buffer, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("buffer", () => require("buffer"));

module.exports = mod;
}),
"[externals]/node:url [external] (node:url, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:url", () => require("node:url"));

module.exports = mod;
}),
"[externals]/node:net [external] (node:net, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:net", () => require("node:net"));

module.exports = mod;
}),
"[externals]/node:fs [external] (node:fs, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:fs", () => require("node:fs"));

module.exports = mod;
}),
"[externals]/node:path [external] (node:path, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:path", () => require("node:path"));

module.exports = mod;
}),
"[externals]/worker_threads [external] (worker_threads, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("worker_threads", () => require("worker_threads"));

module.exports = mod;
}),
"[project]/services/commitsScraper.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "scrapeFootballTop",
    ()=>scrapeFootballTop
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$node$2d$fetch$2f$src$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/node-fetch/src/index.js [app-ssr] (ecmascript) <locals>");
(()=>{
    const e = new Error("Cannot find module 'cheerio'");
    e.code = 'MODULE_NOT_FOUND';
    throw e;
})();
;
;
async function scrapeESPNClass(year) {
    const url = `https://www.espn.com/college-sports/football/recruiting/rankings/scnext300boys/_/view/rn300?class=${year}`;
    const res = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$node$2d$fetch$2f$src$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["default"])(url);
    if (!res.ok) throw new Error(`Failed to fetch ESPN ${year}: ${res.status}`);
    const html = await res.text();
    const $ = cheerio.load(html);
    const rows = [];
    $('tbody tr').each((_, el)=>{
        const cols = $(el).find('td');
        const rank = parseInt($(cols[0]).text().trim(), 10);
        const name = $(cols[1]).text().trim();
        const position = $(cols[2]).text().trim();
        const school = $(cols[3]).text().trim();
        const logo = $(cols[3]).find('img').attr('src') || '';
        if (name) {
            rows.push({
                id: `fb-top-${year}-${rank || rows.length + 1}`,
                rank: isNaN(rank) ? undefined : rank,
                name,
                position,
                university: school || undefined,
                logo: logo || undefined,
                classYear: year
            });
        }
    });
    return rows;
}
async function scrapeFootballTop() {
    const classes = [
        '2026',
        '2027'
    ];
    const all = [];
    for (const yr of classes){
        try {
            const rows = await scrapeESPNClass(yr);
            all.push(...rows);
        } catch (e) {
        // continue
        }
    }
    const sorted = all.sort((a, b)=>(a.rank ?? 9999) - (b.rank ?? 9999));
    return sorted.slice(0, 50);
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__e798df5f._.js.map