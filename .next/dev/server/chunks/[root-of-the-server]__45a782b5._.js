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
"[project]/services/tasks.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "createTask",
    ()=>createTask,
    "deleteTask",
    ()=>deleteTask,
    "listTasks",
    ()=>listTasks,
    "tasksDueSoon",
    ()=>tasksDueSoon,
    "updateTask",
    ()=>updateTask
]);
const STORAGE_KEY = 'tasks_data';
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
let TASKS = readStore();
function listTasks(input) {
    const { agencyEmail, athleteId, status } = input;
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    return TASKS.filter((t)=>{
        if (t.agencyEmail !== agencyEmail) return false;
        if (athleteId && t.athleteId !== athleteId) return false;
        if (status && t.status !== status) return false;
        return true;
    });
}
function createTask(input) {
    const now = Date.now();
    const task = {
        id: `task-${now}-${Math.random().toString(36).slice(2, 8)}`,
        agencyEmail: input.agencyEmail,
        athleteId: input.athleteId || null,
        title: input.title,
        description: input.description,
        status: input.status ?? 'todo',
        dueAt: input.dueAt,
        createdAt: now,
        updatedAt: now
    };
    TASKS.unshift(task);
    writeStore(TASKS);
    return task;
}
function updateTask(id, patch) {
    const idx = TASKS.findIndex((t)=>t.id === id);
    if (idx < 0) return null;
    const next = {
        ...TASKS[idx],
        ...patch,
        updatedAt: Date.now()
    };
    TASKS[idx] = next;
    writeStore(TASKS);
    return next;
}
function deleteTask(id) {
    const idx = TASKS.findIndex((t)=>t.id === id);
    if (idx >= 0) {
        TASKS.splice(idx, 1);
        writeStore(TASKS);
    }
}
function tasksDueSoon(tasks, withinMs = 24 * 60 * 60 * 1000) {
    const now = Date.now();
    return tasks.filter((t)=>t.dueAt && t.status !== 'done' && t.dueAt - now <= withinMs && t.dueAt >= now);
}
}),
"[project]/app/api/tasks/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
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
var __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$tasks$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/services/tasks.ts [app-route] (ecmascript)");
;
;
function getAgencyEmail(req, bodyAgency) {
    return req.headers.get('x-agency-email') || bodyAgency || '';
}
async function GET(req) {
    const { searchParams } = new URL(req.url);
    const agencyEmail = getAgencyEmail(req, searchParams.get('agencyEmail') || undefined);
    if (!agencyEmail) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            ok: false,
            error: 'agencyEmail is required'
        }, {
            status: 400
        });
    }
    const athleteId = searchParams.get('athleteId') || undefined;
    const status = searchParams.get('status') || undefined;
    const data = (0, __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$tasks$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["listTasks"])({
        agencyEmail,
        athleteId,
        status
    });
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
        ok: true,
        data
    });
}
async function POST(req) {
    const body = await req.json();
    const agencyEmail = getAgencyEmail(req, body?.agencyEmail);
    const { title, description, status, dueAt, athleteId } = body || {};
    if (!agencyEmail || !title?.trim()) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            ok: false,
            error: 'agencyEmail and title are required'
        }, {
            status: 400
        });
    }
    const created = (0, __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$tasks$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createTask"])({
        agencyEmail,
        title: title.trim(),
        description: description?.trim(),
        status,
        dueAt: Number.isFinite(dueAt) ? Number(dueAt) : undefined,
        athleteId: athleteId || null
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
    const updated = (0, __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$tasks$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["updateTask"])(id, patch);
    if (!updated) return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
        ok: false,
        error: 'Task not found'
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
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$tasks$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["deleteTask"])(id);
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
        ok: true
    });
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__45a782b5._.js.map