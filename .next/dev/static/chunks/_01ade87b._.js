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
"[project]/features/clients/ClientForm.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ClientForm",
    ()=>ClientForm
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$TextField$2f$TextField$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__TextField$3e$__ = __turbopack_context__.i("[project]/node_modules/@mui/material/esm/TextField/TextField.js [app-client] (ecmascript) <export default as TextField>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Stack$2f$Stack$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Stack$3e$__ = __turbopack_context__.i("[project]/node_modules/@mui/material/esm/Stack/Stack.js [app-client] (ecmascript) <export default as Stack>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Button$2f$Button$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Button$3e$__ = __turbopack_context__.i("[project]/node_modules/@mui/material/esm/Button/Button.js [app-client] (ecmascript) <export default as Button>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$MenuItem$2f$MenuItem$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__MenuItem$3e$__ = __turbopack_context__.i("[project]/node_modules/@mui/material/esm/MenuItem/MenuItem.js [app-client] (ecmascript) <export default as MenuItem>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__ = __turbopack_context__.i("[project]/node_modules/zod/v4/classic/external.js [app-client] (ecmascript) <export * as z>");
var __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$clients$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/services/clients.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
;
const Schema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    email: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().email(),
    password: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(8),
    firstName: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string(),
    lastName: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string(),
    sport: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string()
});
function ClientForm({ initial }) {
    _s();
    const [value, setValue] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].useState(initial ?? {});
    const onSave = async ()=>{
        Schema.parse(value);
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$clients$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["upsertClient"])(value);
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Stack$2f$Stack$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Stack$3e$__["Stack"], {
        spacing: 2,
        sx: {
            maxWidth: 600
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$TextField$2f$TextField$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__TextField$3e$__["TextField"], {
                label: "Email",
                value: value.email ?? '',
                onChange: (e)=>setValue({
                        ...value,
                        email: e.target.value
                    })
            }, void 0, false, {
                fileName: "[project]/features/clients/ClientForm.tsx",
                lineNumber: 20,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$TextField$2f$TextField$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__TextField$3e$__["TextField"], {
                label: "Password",
                type: "password",
                value: value.password ?? '',
                onChange: (e)=>setValue({
                        ...value,
                        password: e.target.value
                    })
            }, void 0, false, {
                fileName: "[project]/features/clients/ClientForm.tsx",
                lineNumber: 21,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$TextField$2f$TextField$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__TextField$3e$__["TextField"], {
                label: "First name",
                value: value.firstName ?? '',
                onChange: (e)=>setValue({
                        ...value,
                        firstName: e.target.value
                    })
            }, void 0, false, {
                fileName: "[project]/features/clients/ClientForm.tsx",
                lineNumber: 22,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$TextField$2f$TextField$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__TextField$3e$__["TextField"], {
                label: "Last name",
                value: value.lastName ?? '',
                onChange: (e)=>setValue({
                        ...value,
                        lastName: e.target.value
                    })
            }, void 0, false, {
                fileName: "[project]/features/clients/ClientForm.tsx",
                lineNumber: 23,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$TextField$2f$TextField$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__TextField$3e$__["TextField"], {
                select: true,
                label: "Sport",
                value: value.sport ?? '',
                onChange: (e)=>setValue({
                        ...value,
                        sport: e.target.value
                    }),
                children: [
                    'Football',
                    'Basketball',
                    'Baseball',
                    'Soccer'
                ].map((s)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$MenuItem$2f$MenuItem$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__MenuItem$3e$__["MenuItem"], {
                        value: s,
                        children: s
                    }, s, false, {
                        fileName: "[project]/features/clients/ClientForm.tsx",
                        lineNumber: 25,
                        columnNumber: 65
                    }, this))
            }, void 0, false, {
                fileName: "[project]/features/clients/ClientForm.tsx",
                lineNumber: 24,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Button$2f$Button$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Button$3e$__["Button"], {
                variant: "contained",
                onClick: onSave,
                children: "Save"
            }, void 0, false, {
                fileName: "[project]/features/clients/ClientForm.tsx",
                lineNumber: 27,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/features/clients/ClientForm.tsx",
        lineNumber: 19,
        columnNumber: 5
    }, this);
}
_s(ClientForm, "1m46fJWAGU9Vrp/9psA+od/ptkU=");
_c = ClientForm;
var _c;
__turbopack_context__.k.register(_c, "ClientForm");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/(app)/clients/[id]/edit/page.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>ClientEditPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@tanstack/react-query/build/modern/useQuery.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$clients$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/services/clients.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$features$2f$clients$2f$ClientForm$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/features/clients/ClientForm.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Typography$2f$Typography$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Typography$3e$__ = __turbopack_context__.i("[project]/node_modules/@mui/material/esm/Typography/Typography.js [app-client] (ecmascript) <export default as Typography>");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
;
function ClientEditPage({ params }) {
    _s();
    const q = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQuery"])({
        queryKey: [
            'client',
            params.id
        ],
        queryFn: {
            "ClientEditPage.useQuery[q]": ()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$clients$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getClient"])(params.id)
        }["ClientEditPage.useQuery[q]"]
    });
    if (!q.data) return null;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Typography$2f$Typography$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Typography$3e$__["Typography"], {
                variant: "h4",
                gutterBottom: true,
                children: "Edit Client"
            }, void 0, false, {
                fileName: "[project]/app/(app)/clients/[id]/edit/page.tsx",
                lineNumber: 13,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$features$2f$clients$2f$ClientForm$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ClientForm"], {
                initial: {
                    ...q.data,
                    password: ''
                }
            }, void 0, false, {
                fileName: "[project]/app/(app)/clients/[id]/edit/page.tsx",
                lineNumber: 14,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true);
}
_s(ClientEditPage, "5aALmIgJptN1trFjLSH6ywbGvzg=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQuery"]
    ];
});
_c = ClientEditPage;
var _c;
__turbopack_context__.k.register(_c, "ClientEditPage");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=_01ade87b._.js.map