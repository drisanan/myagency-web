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
"[project]/services/notes.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "createNote",
    ()=>createNote,
    "deleteNote",
    ()=>deleteNote,
    "listNotes",
    ()=>listNotes,
    "updateNote",
    ()=>updateNote
]);
const STORAGE_KEY = 'notes_data';
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
let NOTES = readStore();
function listNotes(athleteId, agencyEmail) {
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    return NOTES.filter((n)=>n.athleteId === athleteId && n.agencyEmail === agencyEmail);
}
function createNote(input) {
    const now = Date.now();
    const note = {
        id: input.id ?? `n-${now}-${Math.random().toString(36).slice(2, 8)}`,
        athleteId: input.athleteId,
        agencyEmail: input.agencyEmail,
        author: input.author,
        title: input.title,
        body: input.body,
        type: input.type ?? 'other',
        createdAt: now,
        updatedAt: now
    };
    NOTES.unshift(note);
    writeStore(NOTES);
    return note;
}
function updateNote(id, patch, agencyEmail) {
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    const idx = NOTES.findIndex((n)=>n.id === id && n.agencyEmail === agencyEmail);
    if (idx === -1) return null;
    const merged = {
        ...NOTES[idx],
        ...patch,
        updatedAt: Date.now()
    };
    NOTES[idx] = merged;
    writeStore(NOTES);
    return merged;
}
function deleteNote(id, agencyEmail) {
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    const before = NOTES.length;
    NOTES = NOTES.filter((n)=>!(n.id === id && n.agencyEmail === agencyEmail));
    if (NOTES.length !== before) writeStore(NOTES);
    return {
        ok: true
    };
}
}),
"[project]/app/api/notes/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DELETE",
    ()=>DELETE,
    "GET",
    ()=>GET,
    "PATCH",
    ()=>PATCH,
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$notes$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/services/notes.ts [app-route] (ecmascript)");
;
;
function getAgencyEmail(req, bodyAgency) {
    return req.headers.get('x-agency-email') || bodyAgency || '';
}
async function GET(req) {
    const { searchParams } = new URL(req.url);
    const athleteId = searchParams.get('athleteId') || '';
    const agencyEmail = getAgencyEmail(req, searchParams.get('agencyEmail') || undefined);
    if (!athleteId || !agencyEmail) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            ok: false,
            error: 'athleteId and agencyEmail are required'
        }, {
            status: 400
        });
    }
    const data = (0, __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$notes$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["listNotes"])(athleteId, agencyEmail).sort((a, b)=>b.createdAt - a.createdAt);
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
        ok: true,
        data
    });
}
async function POST(req) {
    const body = await req.json();
    const agencyEmail = getAgencyEmail(req, body?.agencyEmail);
    const { athleteId, body: noteBody, title, type, author } = body || {};
    if (!agencyEmail || !athleteId || !noteBody?.trim()) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            ok: false,
            error: 'athleteId, agencyEmail, and body are required'
        }, {
            status: 400
        });
    }
    const created = (0, __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$notes$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createNote"])({
        athleteId,
        agencyEmail,
        body: noteBody.trim(),
        title,
        type,
        author
    });
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
        ok: true,
        data: created
    });
}
async function PATCH(req) {
    const body = await req.json();
    const agencyEmail = getAgencyEmail(req, body?.agencyEmail);
    const { id, ...patch } = body || {};
    if (!id || !agencyEmail) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            ok: false,
            error: 'id and agencyEmail are required'
        }, {
            status: 400
        });
    }
    const updated = (0, __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$notes$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["updateNote"])(id, patch, agencyEmail);
    if (!updated) return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
        ok: false,
        error: 'Note not found'
    }, {
        status: 404
    });
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
        ok: true,
        data: updated
    });
}
async function DELETE(req) {
    const body = await req.json().catch(()=>({}));
    const id = body?.id;
    const agencyEmail = getAgencyEmail(req, body?.agencyEmail);
    if (!id || !agencyEmail) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            ok: false,
            error: 'id and agencyEmail are required'
        }, {
            status: 400
        });
    }
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$notes$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["deleteNote"])(id, agencyEmail);
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
        ok: true
    });
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__2fdb75f6._.js.map