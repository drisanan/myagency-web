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
"[externals]/path [external] (path, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("path", () => require("path"));

module.exports = mod;
}),
"[externals]/os [external] (os, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("os", () => require("os"));

module.exports = mod;
}),
"[externals]/node:fs/promises [external] (node:fs/promises, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:fs/promises", () => require("node:fs/promises"));

module.exports = mod;
}),
"[externals]/stream [external] (stream, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("stream", () => require("stream"));

module.exports = mod;
}),
"[externals]/buffer [external] (buffer, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("buffer", () => require("buffer"));

module.exports = mod;
}),
"[externals]/process [external] (process, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("process", () => require("process"));

module.exports = mod;
}),
"[externals]/http [external] (http, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("http", () => require("http"));

module.exports = mod;
}),
"[externals]/https [external] (https, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("https", () => require("https"));

module.exports = mod;
}),
"[externals]/node:fs [external] (node:fs, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:fs", () => require("node:fs"));

module.exports = mod;
}),
"[project]/infra/src/lib/session.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "buildClearCookie",
    ()=>buildClearCookie,
    "buildSessionCookie",
    ()=>buildSessionCookie,
    "encodeSession",
    ()=>encodeSession,
    "parseSession",
    ()=>parseSession,
    "parseSessionFromRequest",
    ()=>parseSessionFromRequest
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/crypto [external] (crypto, cjs)");
;
const SECRET = process.env.SESSION_SECRET || 'dev-secret-change-me';
const COOKIE_NAME = 'an_session';
function sign(payload) {
    const sig = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__["createHmac"])('sha256', SECRET).update(payload).digest('base64url');
    return `${payload}.${sig}`;
}
function verify(token) {
    const idx = token.lastIndexOf('.');
    if (idx < 0) return null;
    const payload = token.slice(0, idx);
    const sig = token.slice(idx + 1);
    const expected = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__["createHmac"])('sha256', SECRET).update(payload).digest('base64url');
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !(0, __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__["timingSafeEqual"])(a, b)) return null;
    try {
        return JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    } catch  {
        return null;
    }
}
function encodeSession(session) {
    const payload = Buffer.from(JSON.stringify(session)).toString('base64url');
    return sign(payload);
}
function parseSession(token) {
    if (!token) return null;
    return verify(token);
}
function parseCookie(header) {
    if (!header) return {};
    return header.split(';').reduce((acc, part)=>{
        const [k, v] = part.trim().split('=');
        if (k && v) acc[k] = v;
        return acc;
    }, {});
}
function parseSessionFromRequest(event) {
    const cookieHeader = event.headers.cookie || event.headers.Cookie;
    const cookies = parseCookie(cookieHeader);
    const token = cookies[COOKIE_NAME];
    return parseSession(token);
}
function buildSessionCookie(token) {
    const attrs = [
        `${COOKIE_NAME}=${token}`,
        'HttpOnly',
        'Path=/',
        'SameSite=Lax',
        'Secure',
        'Max-Age=604800'
    ];
    return attrs.join('; ');
}
function buildClearCookie() {
    const attrs = [
        `${COOKIE_NAME}=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax; Secure`
    ];
    return attrs.join('; ');
}
}),
"[project]/infra/src/handlers/common.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "badRequest",
    ()=>badRequest,
    "docClient",
    ()=>docClient,
    "getSession",
    ()=>getSession,
    "jsonResponse",
    ()=>jsonResponse,
    "notImplemented",
    ()=>notImplemented,
    "ok",
    ()=>ok,
    "requireSession",
    ()=>requireSession
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$aws$2d$sdk$2f$client$2d$dynamodb$2f$dist$2d$es$2f$DynamoDBClient$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@aws-sdk/client-dynamodb/dist-es/DynamoDBClient.js [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$aws$2d$sdk$2f$lib$2d$dynamodb$2f$dist$2d$es$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@aws-sdk/lib-dynamodb/dist-es/index.js [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$aws$2d$sdk$2f$lib$2d$dynamodb$2f$dist$2d$es$2f$DynamoDBDocumentClient$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@aws-sdk/lib-dynamodb/dist-es/DynamoDBDocumentClient.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$infra$2f$src$2f$lib$2f$session$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/infra/src/lib/session.ts [app-route] (ecmascript)");
;
;
;
const client = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$aws$2d$sdk$2f$client$2d$dynamodb$2f$dist$2d$es$2f$DynamoDBClient$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["DynamoDBClient"]({});
const docClient = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$aws$2d$sdk$2f$lib$2d$dynamodb$2f$dist$2d$es$2f$DynamoDBDocumentClient$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["DynamoDBDocumentClient"].from(client);
function jsonResponse(statusCode, body) {
    return {
        statusCode,
        headers: {
            'content-type': 'application/json'
        },
        body: JSON.stringify(body)
    };
}
function notImplemented(resource, method) {
    return jsonResponse(501, {
        ok: false,
        message: `${method} ${resource} not implemented`
    });
}
function badRequest(message) {
    return jsonResponse(400, {
        ok: false,
        message
    });
}
function ok(body) {
    return jsonResponse(200, body);
}
function getSession(event) {
    const parsed = (0, __TURBOPACK__imported__module__$5b$project$5d2f$infra$2f$src$2f$lib$2f$session$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["parseSessionFromRequest"])(event);
    if (parsed) return parsed;
    // Fallback for temporary header-based dev mode
    const agencyId = event.headers['x-agency-id'] || event.headers['X-Agency-Id'];
    const agencyEmail = event.headers['x-agency-email'] || event.headers['X-Agency-Email'];
    const role = event.headers['x-role'] || 'agency';
    if (!agencyId) return null;
    return {
        agencyId,
        agencyEmail,
        role
    };
}
function requireSession(event) {
    return getSession(event);
}
}),
"[project]/infra/src/lib/dynamo.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "deleteItem",
    ()=>deleteItem,
    "getItem",
    ()=>getItem,
    "putItem",
    ()=>putItem,
    "queryByPK",
    ()=>queryByPK,
    "queryGSI1",
    ()=>queryGSI1,
    "updateItem",
    ()=>updateItem
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$aws$2d$sdk$2f$lib$2d$dynamodb$2f$dist$2d$es$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@aws-sdk/lib-dynamodb/dist-es/index.js [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$aws$2d$sdk$2f$lib$2d$dynamodb$2f$dist$2d$es$2f$commands$2f$GetCommand$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@aws-sdk/lib-dynamodb/dist-es/commands/GetCommand.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$aws$2d$sdk$2f$lib$2d$dynamodb$2f$dist$2d$es$2f$commands$2f$PutCommand$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@aws-sdk/lib-dynamodb/dist-es/commands/PutCommand.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$aws$2d$sdk$2f$lib$2d$dynamodb$2f$dist$2d$es$2f$commands$2f$QueryCommand$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@aws-sdk/lib-dynamodb/dist-es/commands/QueryCommand.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$aws$2d$sdk$2f$lib$2d$dynamodb$2f$dist$2d$es$2f$commands$2f$UpdateCommand$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@aws-sdk/lib-dynamodb/dist-es/commands/UpdateCommand.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$aws$2d$sdk$2f$lib$2d$dynamodb$2f$dist$2d$es$2f$commands$2f$DeleteCommand$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@aws-sdk/lib-dynamodb/dist-es/commands/DeleteCommand.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$infra$2f$src$2f$handlers$2f$common$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/infra/src/handlers/common.ts [app-route] (ecmascript)");
;
;
const TABLE_NAME = process.env.TABLE_NAME || 'agency-narrative-crm';
async function putItem(item) {
    await __TURBOPACK__imported__module__$5b$project$5d2f$infra$2f$src$2f$handlers$2f$common$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["docClient"].send(new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$aws$2d$sdk$2f$lib$2d$dynamodb$2f$dist$2d$es$2f$commands$2f$PutCommand$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["PutCommand"]({
        TableName: TABLE_NAME,
        Item: item
    }));
    return item;
}
async function getItem(key) {
    const res = await __TURBOPACK__imported__module__$5b$project$5d2f$infra$2f$src$2f$handlers$2f$common$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["docClient"].send(new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$aws$2d$sdk$2f$lib$2d$dynamodb$2f$dist$2d$es$2f$commands$2f$GetCommand$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["GetCommand"]({
        TableName: TABLE_NAME,
        Key: key
    }));
    return res.Item;
}
async function queryByPK(PK, beginsWith) {
    const res = await __TURBOPACK__imported__module__$5b$project$5d2f$infra$2f$src$2f$handlers$2f$common$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["docClient"].send(new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$aws$2d$sdk$2f$lib$2d$dynamodb$2f$dist$2d$es$2f$commands$2f$QueryCommand$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["QueryCommand"]({
        TableName: TABLE_NAME,
        KeyConditionExpression: beginsWith ? 'PK = :pk AND begins_with(SK, :sk)' : 'PK = :pk',
        ExpressionAttributeValues: beginsWith ? {
            ':pk': PK,
            ':sk': beginsWith
        } : {
            ':pk': PK
        }
    }));
    return res.Items ?? [];
}
async function queryGSI1(GSI1PK, beginsWith) {
    const res = await __TURBOPACK__imported__module__$5b$project$5d2f$infra$2f$src$2f$handlers$2f$common$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["docClient"].send(new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$aws$2d$sdk$2f$lib$2d$dynamodb$2f$dist$2d$es$2f$commands$2f$QueryCommand$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["QueryCommand"]({
        TableName: TABLE_NAME,
        IndexName: 'GSI1',
        KeyConditionExpression: beginsWith ? 'GSI1PK = :g1pk AND begins_with(GSI1SK, :g1sk)' : 'GSI1PK = :g1pk',
        ExpressionAttributeValues: beginsWith ? {
            ':g1pk': GSI1PK,
            ':g1sk': beginsWith
        } : {
            ':g1pk': GSI1PK
        }
    }));
    return res.Items ?? [];
}
async function updateItem(params) {
    const res = await __TURBOPACK__imported__module__$5b$project$5d2f$infra$2f$src$2f$handlers$2f$common$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["docClient"].send(new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$aws$2d$sdk$2f$lib$2d$dynamodb$2f$dist$2d$es$2f$commands$2f$UpdateCommand$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["UpdateCommand"]({
        TableName: TABLE_NAME,
        Key: params.key,
        UpdateExpression: params.updateExpression,
        ExpressionAttributeValues: params.expressionAttributeValues,
        ExpressionAttributeNames: params.expressionAttributeNames,
        ReturnValues: 'ALL_NEW'
    }));
    return res.Attributes;
}
async function deleteItem(key) {
    await __TURBOPACK__imported__module__$5b$project$5d2f$infra$2f$src$2f$handlers$2f$common$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["docClient"].send(new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$aws$2d$sdk$2f$lib$2d$dynamodb$2f$dist$2d$es$2f$commands$2f$DeleteCommand$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["DeleteCommand"]({
        TableName: TABLE_NAME,
        Key: key
    }));
}
}),
"[project]/infra-adapter/dynamo.ts [app-route] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
var __TURBOPACK__imported__module__$5b$project$5d2f$infra$2f$src$2f$lib$2f$dynamo$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/infra/src/lib/dynamo.ts [app-route] (ecmascript)");
;
}),
"[project]/app/api/forms/submit/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$api$2f$forms$2f$token$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/api/forms/token.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$infra$2d$adapter$2f$dynamo$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/infra-adapter/dynamo.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$infra$2f$src$2f$lib$2f$dynamo$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/infra/src/lib/dynamo.ts [app-route] (ecmascript)");
;
;
;
function newId(prefix) {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}
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
        const id = newId('form');
        const rec = {
            id,
            createdAt: Date.now(),
            consumed: false,
            agencyEmail: payload.agencyEmail,
            data: {
                email: safeForm.email || '',
                phone: safeForm.phone || '',
                password: safeForm.password || '',
                firstName: safeForm.firstName || '',
                lastName: safeForm.lastName || '',
                sport: safeForm.sport || '',
                division: safeForm.division || '',
                graduationYear: safeForm.graduationYear || '',
                profileImageUrl: safeForm.profileImageUrl || '',
                radar: safeForm.radar || {}
            }
        };
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$infra$2f$src$2f$lib$2f$dynamo$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["putItem"])({
            PK: `AGENCY#${payload.agencyEmail}`,
            SK: `FORM#${id}`,
            ...rec
        });
        console.info('[intake-api:submit:success]', {
            id,
            agencyEmail: payload.agencyEmail
        });
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            ok: true,
            id
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

//# sourceMappingURL=%5Broot-of-the-server%5D__3f9b8895._.js.map