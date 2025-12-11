(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/services/agencies.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
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
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    try {
        return JSON.parse(raw);
    } catch  {
        return [];
    }
}
function writeStore(items) {
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
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
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/services/clients.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "deleteClient",
    ()=>deleteClient,
    "getClient",
    ()=>getClient,
    "getClientGmailTokens",
    ()=>getClientGmailTokens,
    "getClients",
    ()=>getClients,
    "listClientsByAgency",
    ()=>listClientsByAgency,
    "listClientsByAgencyEmail",
    ()=>listClientsByAgencyEmail,
    "setClientGmailTokens",
    ()=>setClientGmailTokens,
    "upsertClient",
    ()=>upsertClient
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$agencies$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/services/agencies.ts [app-client] (ecmascript)");
;
const STORAGE_KEY = 'clients_data';
const SEED_CLIENTS = [
    {
        id: 'ag1-c1',
        email: 'a1@athletes.test',
        firstName: 'Ava',
        lastName: 'Smith',
        sport: 'Football',
        agencyEmail: 'agency1@an.test'
    },
    {
        id: 'ag1-c2',
        email: 'a2@athletes.test',
        firstName: 'Ben',
        lastName: 'Jones',
        sport: 'Basketball',
        agencyEmail: 'agency1@an.test'
    },
    {
        id: 'ag2-c1',
        email: 'b1@athletes.test',
        firstName: 'Cara',
        lastName: 'Lee',
        sport: 'Baseball',
        agencyEmail: 'agency2@an.test'
    },
    {
        id: 'ag3-c1',
        email: 'c1@athletes.test',
        firstName: 'Dan',
        lastName: 'Kim',
        sport: 'Soccer',
        agencyEmail: 'agency3@an.test'
    }
];
function readStore() {
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [
        ...SEED_CLIENTS
    ];
    try {
        const parsed = JSON.parse(raw);
        return parsed.length ? parsed : [
            ...SEED_CLIENTS
        ];
    } catch  {
        return [
            ...SEED_CLIENTS
        ];
    }
}
function writeStore(items) {
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}
let CLIENTS = readStore();
async function listClientsByAgencyEmail(agencyEmail) {
    return CLIENTS.filter((c)=>c.agencyEmail === agencyEmail);
}
async function listClientsByAgency(agencyId) {
    const agency = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$agencies$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getAgencyById"])(agencyId);
    if (!agency) return [];
    return listClientsByAgencyEmail(agency.email);
}
async function upsertClient(input) {
    const id = input.id ?? `c-${(Math.random() * 1e6).toFixed(0)}`;
    const idx = CLIENTS.findIndex((c)=>c.id === id);
    const next = {
        ...CLIENTS[idx],
        ...input,
        id
    };
    if (idx >= 0) {
        CLIENTS[idx] = next;
    } else {
        CLIENTS.push(next);
    }
    writeStore(CLIENTS);
    return next;
}
async function getClient(id) {
    const found = CLIENTS.find((c)=>c.id === id);
    return found ?? {
        id,
        email: 'athlete1@example.com',
        firstName: 'A1',
        lastName: 'L1',
        sport: 'Football',
        agencyEmail: ''
    };
}
async function deleteClient(id) {
    const idx = CLIENTS.findIndex((c)=>c.id === id);
    if (idx >= 0) {
        CLIENTS.splice(idx, 1);
        writeStore(CLIENTS);
    }
    return {
        ok: true
    };
}
async function getClients() {
    // Determine current session from localStorage to enforce tenancy
    const raw = ("TURBOPACK compile-time truthy", 1) ? window.localStorage.getItem('session') : "TURBOPACK unreachable";
    if (raw) {
        try {
            const s = JSON.parse(raw);
            if (s.role === 'agency') {
                return listClientsByAgencyEmail(s.email);
            }
        } catch  {
        // fall through
        }
    }
    return [];
}
function setClientGmailTokens(clientId, tokens) {
    const idx = CLIENTS.findIndex((c)=>c.id === clientId);
    if (idx >= 0) {
        CLIENTS[idx] = {
            ...CLIENTS[idx],
            gmailTokens: tokens,
            gmailConnected: true
        };
        writeStore(CLIENTS);
    }
}
function getClientGmailTokens(clientId) {
    const found = CLIENTS.find((c)=>c.id === clientId);
    return found?.gmailTokens ?? null;
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/services/mailStatus.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getMailEntries",
    ()=>getMailEntries,
    "hasMailed",
    ()=>hasMailed,
    "markMailed",
    ()=>markMailed
]);
const STORAGE_KEY = 'mail_log_v1';
function read() {
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch  {
        return [];
    }
}
function write(items) {
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}
function hasMailed(clientId, email) {
    const all = read();
    return all.some((e)=>e.clientId === clientId && e.email === email);
}
function markMailed(clientId, emails) {
    const now = Date.now();
    const all = read();
    const next = [
        ...all
    ];
    emails.forEach((e)=>{
        const email = (e || '').trim();
        if (!email) return;
        if (!next.some((x)=>x.clientId === clientId && x.email === email)) {
            next.push({
                clientId,
                email,
                mailedAt: now
            });
        }
    });
    write(next);
}
function getMailEntries() {
    return read();
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/services/scholarships.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getScholarships",
    ()=>getScholarships,
    "setScholarships",
    ()=>setScholarships
]);
const KEY = 'dashboard_scholarships_v1';
function getScholarships(agencyEmail) {
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    try {
        const raw = localStorage.getItem(KEY);
        const obj = raw ? JSON.parse(raw) : {};
        return obj[agencyEmail] ?? 0;
    } catch  {
        return 0;
    }
}
function setScholarships(agencyEmail, n) {
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    try {
        const raw = localStorage.getItem(KEY);
        const obj = raw ? JSON.parse(raw) : {};
        obj[agencyEmail] = Math.max(0, Number(n) || 0);
        localStorage.setItem(KEY, JSON.stringify(obj));
    } catch  {}
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/services/analytics.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getOpensClicksByDate",
    ()=>getOpensClicksByDate,
    "setOpensClicks",
    ()=>setOpensClicks
]);
const KEY = 'dashboard_open_clicks_v1';
function todayISO(d = new Date()) {
    return d.toISOString().slice(0, 10);
}
function getOpensClicksByDate(agencyEmail, days = 14) {
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    try {
        const raw = localStorage.getItem(KEY);
        const obj = raw ? JSON.parse(raw) : {};
        const map = obj[agencyEmail] || {};
        const out = [];
        const base = new Date();
        for(let i = days - 1; i >= 0; i--){
            const d = new Date(base);
            d.setDate(base.getDate() - i);
            const k = todayISO(d);
            const row = map[k] || {
                opens: 0,
                clicks: 0
            };
            out.push({
                date: k,
                opens: row.opens || 0,
                clicks: row.clicks || 0
            });
        }
        return out;
    } catch  {
        return [];
    }
}
function setOpensClicks(agencyEmail, dateISO, metrics) {
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    try {
        const raw = localStorage.getItem(KEY);
        const obj = raw ? JSON.parse(raw) : {};
        const perAgency = obj[agencyEmail] || {};
        const prev = perAgency[dateISO] || {
            opens: 0,
            clicks: 0
        };
        perAgency[dateISO] = {
            opens: Math.max(0, Number(metrics.opens ?? prev.opens)),
            clicks: Math.max(0, Number(metrics.clicks ?? prev.clicks))
        };
        obj[agencyEmail] = perAgency;
        localStorage.setItem(KEY, JSON.stringify(obj));
    } catch  {}
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/(app)/dashboard/page.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>DashboardPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$features$2f$auth$2f$session$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/features/auth/session.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@tanstack/react-query/build/modern/useQuery.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$agencies$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/services/agencies.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$clients$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/services/clients.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Typography$2f$Typography$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Typography$3e$__ = __turbopack_context__.i("[project]/node_modules/@mui/material/esm/Typography/Typography.js [app-client] (ecmascript) <export default as Typography>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Box$2f$Box$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Box$3e$__ = __turbopack_context__.i("[project]/node_modules/@mui/material/esm/Box/Box.js [app-client] (ecmascript) <export default as Box>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Card$2f$Card$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Card$3e$__ = __turbopack_context__.i("[project]/node_modules/@mui/material/esm/Card/Card.js [app-client] (ecmascript) <export default as Card>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$CardContent$2f$CardContent$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CardContent$3e$__ = __turbopack_context__.i("[project]/node_modules/@mui/material/esm/CardContent/CardContent.js [app-client] (ecmascript) <export default as CardContent>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$TextField$2f$TextField$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__TextField$3e$__ = __turbopack_context__.i("[project]/node_modules/@mui/material/esm/TextField/TextField.js [app-client] (ecmascript) <export default as TextField>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Button$2f$Button$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Button$3e$__ = __turbopack_context__.i("[project]/node_modules/@mui/material/esm/Button/Button.js [app-client] (ecmascript) <export default as Button>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Divider$2f$Divider$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Divider$3e$__ = __turbopack_context__.i("[project]/node_modules/@mui/material/esm/Divider/Divider.js [app-client] (ecmascript) <export default as Divider>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$x$2d$data$2d$grid$2f$esm$2f$DataGrid$2f$DataGrid$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@mui/x-data-grid/esm/DataGrid/DataGrid.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$mailStatus$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/services/mailStatus.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$scholarships$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/services/scholarships.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$analytics$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/services/analytics.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
;
;
;
;
;
;
;
function DashboardPage() {
    _s();
    const { session } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$features$2f$auth$2f$session$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSession"])();
    const isParent = session?.role === 'parent';
    const q = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQuery"])({
        queryKey: [
            'dashboard',
            session?.role,
            session?.agencyId
        ],
        queryFn: {
            "DashboardPage.useQuery[q]": ()=>isParent ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$agencies$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["listAgencies"])() : (0, __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$clients$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["listClientsByAgencyEmail"])(session.email)
        }["DashboardPage.useQuery[q]"]
    });
    const [schInput, setSchInput] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].useState('');
    const [trend, setTrend] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].useState([]);
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].useEffect({
        "DashboardPage.useEffect": ()=>{
            if (!session?.email || isParent) return;
            setTrend((0, __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$analytics$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getOpensClicksByDate"])(session.email, 14));
            setSchInput(String((0, __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$scholarships$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getScholarships"])(session.email)));
        }
    }["DashboardPage.useEffect"], [
        session?.email,
        isParent
    ]);
    if (!session) return null;
    if (!q.data) return null;
    if (isParent) {
        const rows = q.data;
        const columns = [
            {
                field: 'name',
                headerName: 'Agency',
                flex: 1
            }
        ];
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Typography$2f$Typography$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Typography$3e$__["Typography"], {
                    variant: "h4",
                    gutterBottom: true,
                    children: "Dashboard"
                }, void 0, false, {
                    fileName: "[project]/app/(app)/dashboard/page.tsx",
                    lineNumber: 36,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: {
                        height: 520
                    },
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$x$2d$data$2d$grid$2f$esm$2f$DataGrid$2f$DataGrid$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DataGrid"], {
                        rows: rows,
                        columns: columns,
                        getRowId: (r)=>r.id
                    }, void 0, false, {
                        fileName: "[project]/app/(app)/dashboard/page.tsx",
                        lineNumber: 38,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/app/(app)/dashboard/page.tsx",
                    lineNumber: 37,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true);
    }
    // Agency dashboard
    const clients = q.data;
    const clientIds = new Set(clients.map((c)=>c.id));
    const totalClients = clients.length;
    // Emails sent (count mail logs whose clientId belongs to this agency)
    const mail = (0, __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$mailStatus$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getMailEntries"])().filter((m)=>clientIds.has(m.clientId));
    const emailsSent = mail.length;
    // Grad year breakdown: current year..current+3 (inclusive)
    const thisYear = new Date().getFullYear();
    const years = [
        thisYear,
        thisYear + 1,
        thisYear + 2,
        thisYear + 3
    ];
    const byYear = {
        [years[0]]: 0,
        [years[1]]: 0,
        [years[2]]: 0,
        [years[3]]: 0
    };
    clients.forEach((c)=>{
        const gy = Number(c?.radar?.graduationYear || c?.graduationYear || 0);
        if (years.includes(gy)) byYear[gy] = (byYear[gy] || 0) + 1;
    });
    function saveScholarships() {
        if (!session?.email) return;
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$scholarships$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["setScholarships"])(session.email, Number(schInput) || 0);
        setSchInput(String((0, __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$scholarships$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getScholarships"])(session.email)));
    }
    function updateTrend(date, key, val) {
        if (!session?.email) return;
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$analytics$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["setOpensClicks"])(session.email, date, {
            [key]: Number(val) || 0
        });
        setTrend((0, __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$analytics$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getOpensClicksByDate"])(session.email, 14));
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Typography$2f$Typography$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Typography$3e$__["Typography"], {
                variant: "h4",
                gutterBottom: true,
                children: "Dashboard"
            }, void 0, false, {
                fileName: "[project]/app/(app)/dashboard/page.tsx",
                lineNumber: 76,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Box$2f$Box$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Box$3e$__["Box"], {
                sx: {
                    display: 'grid',
                    gridTemplateColumns: {
                        xs: '1fr',
                        md: 'repeat(4, 1fr)'
                    },
                    gap: 2,
                    mb: 3
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Card$2f$Card$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Card$3e$__["Card"], {
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$CardContent$2f$CardContent$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CardContent$3e$__["CardContent"], {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Typography$2f$Typography$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Typography$3e$__["Typography"], {
                                    variant: "subtitle2",
                                    color: "text.secondary",
                                    children: "Emails Sent"
                                }, void 0, false, {
                                    fileName: "[project]/app/(app)/dashboard/page.tsx",
                                    lineNumber: 80,
                                    columnNumber: 11
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Typography$2f$Typography$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Typography$3e$__["Typography"], {
                                    variant: "h5",
                                    children: emailsSent
                                }, void 0, false, {
                                    fileName: "[project]/app/(app)/dashboard/page.tsx",
                                    lineNumber: 81,
                                    columnNumber: 11
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/(app)/dashboard/page.tsx",
                            lineNumber: 79,
                            columnNumber: 15
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/app/(app)/dashboard/page.tsx",
                        lineNumber: 79,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Card$2f$Card$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Card$3e$__["Card"], {
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$CardContent$2f$CardContent$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CardContent$3e$__["CardContent"], {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Typography$2f$Typography$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Typography$3e$__["Typography"], {
                                    variant: "subtitle2",
                                    color: "text.secondary",
                                    children: "Total Clients"
                                }, void 0, false, {
                                    fileName: "[project]/app/(app)/dashboard/page.tsx",
                                    lineNumber: 84,
                                    columnNumber: 11
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Typography$2f$Typography$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Typography$3e$__["Typography"], {
                                    variant: "h5",
                                    children: totalClients
                                }, void 0, false, {
                                    fileName: "[project]/app/(app)/dashboard/page.tsx",
                                    lineNumber: 85,
                                    columnNumber: 11
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/(app)/dashboard/page.tsx",
                            lineNumber: 83,
                            columnNumber: 15
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/app/(app)/dashboard/page.tsx",
                        lineNumber: 83,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Card$2f$Card$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Card$3e$__["Card"], {
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$CardContent$2f$CardContent$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CardContent$3e$__["CardContent"], {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Typography$2f$Typography$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Typography$3e$__["Typography"], {
                                    variant: "subtitle2",
                                    color: "text.secondary",
                                    children: "Scholarships Awarded"
                                }, void 0, false, {
                                    fileName: "[project]/app/(app)/dashboard/page.tsx",
                                    lineNumber: 88,
                                    columnNumber: 11
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Box$2f$Box$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Box$3e$__["Box"], {
                                    sx: {
                                        display: 'flex',
                                        gap: 1,
                                        alignItems: 'center',
                                        mt: 1
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$TextField$2f$TextField$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__TextField$3e$__["TextField"], {
                                            size: "small",
                                            type: "number",
                                            value: schInput,
                                            onChange: (e)=>setSchInput(e.target.value),
                                            sx: {
                                                width: 100
                                            }
                                        }, void 0, false, {
                                            fileName: "[project]/app/(app)/dashboard/page.tsx",
                                            lineNumber: 90,
                                            columnNumber: 13
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Button$2f$Button$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Button$3e$__["Button"], {
                                            size: "small",
                                            variant: "outlined",
                                            onClick: saveScholarships,
                                            children: "Save"
                                        }, void 0, false, {
                                            fileName: "[project]/app/(app)/dashboard/page.tsx",
                                            lineNumber: 91,
                                            columnNumber: 13
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/(app)/dashboard/page.tsx",
                                    lineNumber: 89,
                                    columnNumber: 11
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/(app)/dashboard/page.tsx",
                            lineNumber: 87,
                            columnNumber: 15
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/app/(app)/dashboard/page.tsx",
                        lineNumber: 87,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Card$2f$Card$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Card$3e$__["Card"], {
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$CardContent$2f$CardContent$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CardContent$3e$__["CardContent"], {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Typography$2f$Typography$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Typography$3e$__["Typography"], {
                                    variant: "subtitle2",
                                    color: "text.secondary",
                                    children: "Window"
                                }, void 0, false, {
                                    fileName: "[project]/app/(app)/dashboard/page.tsx",
                                    lineNumber: 95,
                                    columnNumber: 11
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Typography$2f$Typography$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Typography$3e$__["Typography"], {
                                    variant: "body2",
                                    children: "Last 14 days"
                                }, void 0, false, {
                                    fileName: "[project]/app/(app)/dashboard/page.tsx",
                                    lineNumber: 96,
                                    columnNumber: 11
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/(app)/dashboard/page.tsx",
                            lineNumber: 94,
                            columnNumber: 15
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/app/(app)/dashboard/page.tsx",
                        lineNumber: 94,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/(app)/dashboard/page.tsx",
                lineNumber: 78,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Box$2f$Box$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Box$3e$__["Box"], {
                sx: {
                    display: 'grid',
                    gridTemplateColumns: {
                        xs: '1fr',
                        md: '1.2fr 1fr'
                    },
                    gap: 3,
                    mb: 3
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Card$2f$Card$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Card$3e$__["Card"], {
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$CardContent$2f$CardContent$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CardContent$3e$__["CardContent"], {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Typography$2f$Typography$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Typography$3e$__["Typography"], {
                                    variant: "h6",
                                    gutterBottom: true,
                                    children: "Open & Click Trends (manual)"
                                }, void 0, false, {
                                    fileName: "[project]/app/(app)/dashboard/page.tsx",
                                    lineNumber: 103,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Box$2f$Box$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Box$3e$__["Box"], {
                                    sx: {
                                        display: 'grid',
                                        gridTemplateColumns: '140px 1fr 1fr',
                                        gap: 1,
                                        alignItems: 'center'
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Typography$2f$Typography$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Typography$3e$__["Typography"], {
                                            variant: "subtitle2",
                                            color: "text.secondary",
                                            children: "Date"
                                        }, void 0, false, {
                                            fileName: "[project]/app/(app)/dashboard/page.tsx",
                                            lineNumber: 105,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Typography$2f$Typography$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Typography$3e$__["Typography"], {
                                            variant: "subtitle2",
                                            color: "text.secondary",
                                            children: "Opens"
                                        }, void 0, false, {
                                            fileName: "[project]/app/(app)/dashboard/page.tsx",
                                            lineNumber: 106,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Typography$2f$Typography$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Typography$3e$__["Typography"], {
                                            variant: "subtitle2",
                                            color: "text.secondary",
                                            children: "Clicks"
                                        }, void 0, false, {
                                            fileName: "[project]/app/(app)/dashboard/page.tsx",
                                            lineNumber: 107,
                                            columnNumber: 15
                                        }, this),
                                        trend.map((row)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].Fragment, {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Typography$2f$Typography$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Typography$3e$__["Typography"], {
                                                        variant: "body2",
                                                        children: row.date
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/(app)/dashboard/page.tsx",
                                                        lineNumber: 110,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$TextField$2f$TextField$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__TextField$3e$__["TextField"], {
                                                        size: "small",
                                                        type: "number",
                                                        value: row.opens,
                                                        onChange: (e)=>updateTrend(row.date, 'opens', e.target.value)
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/(app)/dashboard/page.tsx",
                                                        lineNumber: 111,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$TextField$2f$TextField$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__TextField$3e$__["TextField"], {
                                                        size: "small",
                                                        type: "number",
                                                        value: row.clicks,
                                                        onChange: (e)=>updateTrend(row.date, 'clicks', e.target.value)
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/(app)/dashboard/page.tsx",
                                                        lineNumber: 112,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, row.date, true, {
                                                fileName: "[project]/app/(app)/dashboard/page.tsx",
                                                lineNumber: 109,
                                                columnNumber: 17
                                            }, this))
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/(app)/dashboard/page.tsx",
                                    lineNumber: 104,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/(app)/dashboard/page.tsx",
                            lineNumber: 102,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/app/(app)/dashboard/page.tsx",
                        lineNumber: 101,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Card$2f$Card$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Card$3e$__["Card"], {
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$CardContent$2f$CardContent$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CardContent$3e$__["CardContent"], {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Typography$2f$Typography$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Typography$3e$__["Typography"], {
                                    variant: "h6",
                                    gutterBottom: true,
                                    children: "Graduation Year Breakdown"
                                }, void 0, false, {
                                    fileName: "[project]/app/(app)/dashboard/page.tsx",
                                    lineNumber: 121,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Box$2f$Box$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Box$3e$__["Box"], {
                                    sx: {
                                        display: 'grid',
                                        gridTemplateColumns: '1fr 80px',
                                        gap: 1
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Typography$2f$Typography$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Typography$3e$__["Typography"], {
                                            variant: "subtitle2",
                                            color: "text.secondary",
                                            children: "Year"
                                        }, void 0, false, {
                                            fileName: "[project]/app/(app)/dashboard/page.tsx",
                                            lineNumber: 123,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Typography$2f$Typography$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Typography$3e$__["Typography"], {
                                            variant: "subtitle2",
                                            color: "text.secondary",
                                            align: "right",
                                            children: "Count"
                                        }, void 0, false, {
                                            fileName: "[project]/app/(app)/dashboard/page.tsx",
                                            lineNumber: 124,
                                            columnNumber: 15
                                        }, this),
                                        years.map((y)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].Fragment, {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Typography$2f$Typography$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Typography$3e$__["Typography"], {
                                                        variant: "body2",
                                                        children: [
                                                            "Class of ",
                                                            y
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/app/(app)/dashboard/page.tsx",
                                                        lineNumber: 127,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Typography$2f$Typography$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Typography$3e$__["Typography"], {
                                                        variant: "body2",
                                                        align: "right",
                                                        children: byYear[y] || 0
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/(app)/dashboard/page.tsx",
                                                        lineNumber: 128,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, y, true, {
                                                fileName: "[project]/app/(app)/dashboard/page.tsx",
                                                lineNumber: 126,
                                                columnNumber: 17
                                            }, this))
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/(app)/dashboard/page.tsx",
                                    lineNumber: 122,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/(app)/dashboard/page.tsx",
                            lineNumber: 120,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/app/(app)/dashboard/page.tsx",
                        lineNumber: 119,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/(app)/dashboard/page.tsx",
                lineNumber: 100,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Divider$2f$Divider$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Divider$3e$__["Divider"], {
                sx: {
                    my: 2
                }
            }, void 0, false, {
                fileName: "[project]/app/(app)/dashboard/page.tsx",
                lineNumber: 136,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Typography$2f$Typography$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Typography$3e$__["Typography"], {
                variant: "h6",
                gutterBottom: true,
                children: "Clients"
            }, void 0, false, {
                fileName: "[project]/app/(app)/dashboard/page.tsx",
                lineNumber: 138,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    height: 520
                },
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$x$2d$data$2d$grid$2f$esm$2f$DataGrid$2f$DataGrid$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DataGrid"], {
                    rows: clients,
                    columns: [
                        {
                            field: 'email',
                            headerName: 'Email',
                            flex: 1
                        },
                        {
                            field: 'firstName',
                            headerName: 'First',
                            width: 120
                        },
                        {
                            field: 'lastName',
                            headerName: 'Last',
                            width: 120
                        },
                        {
                            field: 'sport',
                            headerName: 'Sport',
                            width: 120
                        },
                        {
                            field: 'graduationYear',
                            headerName: 'Grad Year',
                            width: 120,
                            valueGetter: (p)=>p && p.row ? p.row?.radar?.graduationYear || p.row.graduationYear || '' : ''
                        }
                    ],
                    getRowId: (r)=>r.id
                }, void 0, false, {
                    fileName: "[project]/app/(app)/dashboard/page.tsx",
                    lineNumber: 140,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/app/(app)/dashboard/page.tsx",
                lineNumber: 139,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true);
}
_s(DashboardPage, "4vJfrzkIpd3buFF86I+CX2OAJJY=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$features$2f$auth$2f$session$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSession"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQuery"]
    ];
});
_c = DashboardPage;
var _c;
__turbopack_context__.k.register(_c, "DashboardPage");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=_07d31d89._.js.map