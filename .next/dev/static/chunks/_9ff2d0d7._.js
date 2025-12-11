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
    "getClients",
    ()=>getClients,
    "listClientsByAgency",
    ()=>listClientsByAgency,
    "listClientsByAgencyEmail",
    ()=>listClientsByAgencyEmail,
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
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/services/recruiterMeta.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getDivisions",
    ()=>getDivisions,
    "getStates",
    ()=>getStates,
    "getUniversities",
    ()=>getUniversities,
    "getUniversity",
    ()=>getUniversity
]);
async function getDivisions() {
    return [
        'D1',
        'D1AA',
        'D2',
        'D3',
        'JUCO',
        'NAIA'
    ];
}
async function getStates(division) {
    return [
        {
            code: 'AL',
            name: 'Alabama'
        },
        {
            code: 'CA',
            name: 'California'
        }
    ];
}
async function getUniversities(input) {
    return [
        {
            id: 'uni-1',
            name: 'Sample University'
        },
        {
            id: 'uni-2',
            name: 'Example College'
        }
    ];
}
async function getUniversity(id) {
    return {
        id,
        name: id === 'uni-2' ? 'Example College' : 'Sample University',
        city: 'Somewhere',
        state: 'CA',
        division: 'D1',
        conference: 'West',
        privatePublic: 'Public',
        coaches: [
            {
                id: 'c1',
                firstName: 'Alex',
                lastName: 'Mason',
                title: 'Head Coach',
                email: 'alex.mason@school.edu',
                twitter: 'https://x.com/coachmason'
            },
            {
                id: 'c2',
                firstName: 'Blake',
                lastName: 'Reed',
                title: 'Assistant Coach',
                email: 'blake.reed@school.edu'
            }
        ]
    };
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/features/recruiter/RecruiterWizard.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "RecruiterWizard",
    ()=>RecruiterWizard
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Box$2f$Box$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Box$3e$__ = __turbopack_context__.i("[project]/node_modules/@mui/material/esm/Box/Box.js [app-client] (ecmascript) <export default as Box>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Button$2f$Button$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Button$3e$__ = __turbopack_context__.i("[project]/node_modules/@mui/material/esm/Button/Button.js [app-client] (ecmascript) <export default as Button>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Step$2f$Step$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Step$3e$__ = __turbopack_context__.i("[project]/node_modules/@mui/material/esm/Step/Step.js [app-client] (ecmascript) <export default as Step>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$StepLabel$2f$StepLabel$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__StepLabel$3e$__ = __turbopack_context__.i("[project]/node_modules/@mui/material/esm/StepLabel/StepLabel.js [app-client] (ecmascript) <export default as StepLabel>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Stepper$2f$Stepper$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Stepper$3e$__ = __turbopack_context__.i("[project]/node_modules/@mui/material/esm/Stepper/Stepper.js [app-client] (ecmascript) <export default as Stepper>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$TextField$2f$TextField$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__TextField$3e$__ = __turbopack_context__.i("[project]/node_modules/@mui/material/esm/TextField/TextField.js [app-client] (ecmascript) <export default as TextField>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Typography$2f$Typography$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Typography$3e$__ = __turbopack_context__.i("[project]/node_modules/@mui/material/esm/Typography/Typography.js [app-client] (ecmascript) <export default as Typography>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Card$2f$Card$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Card$3e$__ = __turbopack_context__.i("[project]/node_modules/@mui/material/esm/Card/Card.js [app-client] (ecmascript) <export default as Card>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$CardContent$2f$CardContent$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CardContent$3e$__ = __turbopack_context__.i("[project]/node_modules/@mui/material/esm/CardContent/CardContent.js [app-client] (ecmascript) <export default as CardContent>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Checkbox$2f$Checkbox$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Checkbox$3e$__ = __turbopack_context__.i("[project]/node_modules/@mui/material/esm/Checkbox/Checkbox.js [app-client] (ecmascript) <export default as Checkbox>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$FormControlLabel$2f$FormControlLabel$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FormControlLabel$3e$__ = __turbopack_context__.i("[project]/node_modules/@mui/material/esm/FormControlLabel/FormControlLabel.js [app-client] (ecmascript) <export default as FormControlLabel>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$MenuItem$2f$MenuItem$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__MenuItem$3e$__ = __turbopack_context__.i("[project]/node_modules/@mui/material/esm/MenuItem/MenuItem.js [app-client] (ecmascript) <export default as MenuItem>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Stack$2f$Stack$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Stack$3e$__ = __turbopack_context__.i("[project]/node_modules/@mui/material/esm/Stack/Stack.js [app-client] (ecmascript) <export default as Stack>");
var __TURBOPACK__imported__module__$5b$project$5d2f$features$2f$auth$2f$session$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/features/auth/session.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$clients$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/services/clients.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$recruiterMeta$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/services/recruiterMeta.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
;
;
function RecruiterWizard() {
    _s();
    const { session } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$features$2f$auth$2f$session$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSession"])();
    const [activeStep, setActiveStep] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].useState(0);
    // Step 1 - client selection
    const [clients, setClients] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].useState([]);
    const [clientId, setClientId] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].useState('');
    // Step 2 - division/state/schools
    const [divisions, setDivisions] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].useState([]);
    const [division, setDivision] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].useState('');
    const [states, setStates] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].useState([]);
    const [state, setState] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].useState('');
    const [schools, setSchools] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].useState([]);
    // Step 3 - school details and coach selection
    const [selectedSchoolId, setSelectedSchoolId] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].useState('');
    const [schoolDetails, setSchoolDetails] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].useState(null);
    const [selectedCoachIds, setSelectedCoachIds] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].useState({});
    // Draft
    const [draft, setDraft] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].useState('');
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].useEffect({
        "RecruiterWizard.useEffect": ()=>{
            if (!session) return;
            if (session.role !== 'agency') return;
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$clients$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["listClientsByAgencyEmail"])(session.email).then(setClients);
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$recruiterMeta$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getDivisions"])().then(setDivisions);
        }
    }["RecruiterWizard.useEffect"], [
        session
    ]);
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].useEffect({
        "RecruiterWizard.useEffect": ()=>{
            if (!division) {
                setStates([]);
                setState('');
                setSchools([]);
                return;
            }
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$recruiterMeta$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getStates"])(division).then(setStates);
            setState('');
            setSchools([]);
        }
    }["RecruiterWizard.useEffect"], [
        division
    ]);
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].useEffect({
        "RecruiterWizard.useEffect": ()=>{
            if (division && state) {
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$recruiterMeta$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getUniversities"])({
                    division,
                    state
                }).then(setSchools);
            } else {
                setSchools([]);
            }
        }
    }["RecruiterWizard.useEffect"], [
        division,
        state
    ]);
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].useEffect({
        "RecruiterWizard.useEffect": ()=>{
            if (!selectedSchoolId) {
                setSchoolDetails(null);
                setSelectedCoachIds({});
                return;
            }
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$recruiterMeta$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getUniversity"])(selectedSchoolId).then({
                "RecruiterWizard.useEffect": (u)=>{
                    setSchoolDetails(u);
                    setSelectedCoachIds({});
                }
            }["RecruiterWizard.useEffect"]);
        }
    }["RecruiterWizard.useEffect"], [
        selectedSchoolId
    ]);
    const isLast = activeStep === 3;
    const canNext = activeStep === 0 && Boolean(clientId) || activeStep === 1 && Boolean(division) && Boolean(state) && schools.length > 0 || activeStep === 2 && Boolean(selectedSchoolId) || activeStep === 3;
    const handleNext = ()=>{
        if (isLast) {
            // generate a simple draft
            const chosen = Object.entries(selectedCoachIds).filter(([, checked])=>checked).map(([id])=>schoolDetails?.coaches?.find((c)=>c.id === id)).filter(Boolean);
            const coachLines = chosen.length > 0 ? chosen.map((c)=>`- ${c.firstName} ${c.lastName}${c.email ? ` (${c.email})` : ''}`).join('\n') : 'No coaches selected';
            const body = [
                `School: ${schoolDetails?.name}`,
                `Division: ${schoolDetails?.division}`,
                `Location: ${schoolDetails?.city}, ${schoolDetails?.state}`,
                `Coaches:\n${coachLines}`
            ].join('\n');
            setDraft(body);
            return;
        }
        setActiveStep((s)=>s + 1);
    };
    const handleBack = ()=>setActiveStep((s)=>Math.max(0, s - 1));
    const toggleCoach = (id)=>{
        setSelectedCoachIds((prev)=>({
                ...prev,
                [id]: !prev[id]
            }));
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Box$2f$Box$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Box$3e$__["Box"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Stepper$2f$Stepper$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Stepper$3e$__["Stepper"], {
                activeStep: activeStep,
                alternativeLabel: true,
                sx: {
                    mb: 3
                },
                children: [
                    'Select Client',
                    'Universities',
                    'Details & Coaches',
                    'Draft'
                ].map((label)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Step$2f$Step$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Step$3e$__["Step"], {
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$StepLabel$2f$StepLabel$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__StepLabel$3e$__["StepLabel"], {
                            children: label
                        }, void 0, false, {
                            fileName: "[project]/features/recruiter/RecruiterWizard.tsx",
                            lineNumber: 112,
                            columnNumber: 13
                        }, this)
                    }, label, false, {
                        fileName: "[project]/features/recruiter/RecruiterWizard.tsx",
                        lineNumber: 111,
                        columnNumber: 11
                    }, this))
            }, void 0, false, {
                fileName: "[project]/features/recruiter/RecruiterWizard.tsx",
                lineNumber: 109,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Box$2f$Box$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Box$3e$__["Box"], {
                sx: {
                    mb: 2
                },
                children: [
                    activeStep === 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Box$2f$Box$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Box$3e$__["Box"], {
                        sx: {
                            display: 'grid',
                            gridTemplateColumns: {
                                xs: '1fr',
                                md: '1fr 1fr'
                            },
                            gap: 2,
                            maxWidth: 700
                        },
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$TextField$2f$TextField$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__TextField$3e$__["TextField"], {
                            select: true,
                            label: "Client",
                            value: clientId,
                            onChange: (e)=>setClientId(e.target.value),
                            SelectProps: {
                                MenuProps: {
                                    disablePortal: true
                                }
                            },
                            children: clients.map((c)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$MenuItem$2f$MenuItem$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__MenuItem$3e$__["MenuItem"], {
                                    value: c.id,
                                    children: [
                                        c.email,
                                        " ",
                                        c.firstName ? `- ${c.firstName} ${c.lastName}` : ''
                                    ]
                                }, c.id, true, {
                                    fileName: "[project]/features/recruiter/RecruiterWizard.tsx",
                                    lineNumber: 127,
                                    columnNumber: 17
                                }, this))
                        }, void 0, false, {
                            fileName: "[project]/features/recruiter/RecruiterWizard.tsx",
                            lineNumber: 119,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/features/recruiter/RecruiterWizard.tsx",
                        lineNumber: 118,
                        columnNumber: 11
                    }, this),
                    activeStep === 1 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Box$2f$Box$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Box$3e$__["Box"], {
                        sx: {
                            display: 'grid',
                            gridTemplateColumns: {
                                xs: '1fr',
                                md: '1fr 1fr'
                            },
                            gap: 2,
                            maxWidth: 800
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$TextField$2f$TextField$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__TextField$3e$__["TextField"], {
                                select: true,
                                label: "Division",
                                value: division,
                                onChange: (e)=>setDivision(e.target.value),
                                SelectProps: {
                                    MenuProps: {
                                        disablePortal: true
                                    }
                                },
                                children: divisions.map((d)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$MenuItem$2f$MenuItem$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__MenuItem$3e$__["MenuItem"], {
                                        value: d,
                                        children: d
                                    }, d, false, {
                                        fileName: "[project]/features/recruiter/RecruiterWizard.tsx",
                                        lineNumber: 144,
                                        columnNumber: 17
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/features/recruiter/RecruiterWizard.tsx",
                                lineNumber: 136,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$TextField$2f$TextField$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__TextField$3e$__["TextField"], {
                                select: true,
                                label: "State",
                                value: state,
                                onChange: (e)=>setState(e.target.value),
                                disabled: !division,
                                SelectProps: {
                                    MenuProps: {
                                        disablePortal: true
                                    }
                                },
                                children: states.map((s)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$MenuItem$2f$MenuItem$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__MenuItem$3e$__["MenuItem"], {
                                        value: s.code,
                                        children: s.name
                                    }, s.code, false, {
                                        fileName: "[project]/features/recruiter/RecruiterWizard.tsx",
                                        lineNumber: 158,
                                        columnNumber: 17
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/features/recruiter/RecruiterWizard.tsx",
                                lineNumber: 149,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Box$2f$Box$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Box$3e$__["Box"], {
                                sx: {
                                    gridColumn: '1 / -1'
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Typography$2f$Typography$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Typography$3e$__["Typography"], {
                                        variant: "subtitle2",
                                        color: "text.secondary",
                                        sx: {
                                            mb: 1
                                        },
                                        children: "Universities"
                                    }, void 0, false, {
                                        fileName: "[project]/features/recruiter/RecruiterWizard.tsx",
                                        lineNumber: 164,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Stack$2f$Stack$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Stack$3e$__["Stack"], {
                                        direction: "row",
                                        spacing: 2,
                                        sx: {
                                            flexWrap: 'wrap'
                                        },
                                        children: schools.map((u)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Card$2f$Card$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Card$3e$__["Card"], {
                                                onClick: ()=>setSelectedSchoolId(u.id),
                                                sx: {
                                                    width: 260,
                                                    cursor: 'pointer',
                                                    outline: selectedSchoolId === u.id ? '2px solid #1976d2' : 'none'
                                                },
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$CardContent$2f$CardContent$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CardContent$3e$__["CardContent"], {
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Typography$2f$Typography$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Typography$3e$__["Typography"], {
                                                        children: u.name
                                                    }, void 0, false, {
                                                        fileName: "[project]/features/recruiter/RecruiterWizard.tsx",
                                                        lineNumber: 179,
                                                        columnNumber: 23
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/features/recruiter/RecruiterWizard.tsx",
                                                    lineNumber: 178,
                                                    columnNumber: 21
                                                }, this)
                                            }, u.id, false, {
                                                fileName: "[project]/features/recruiter/RecruiterWizard.tsx",
                                                lineNumber: 169,
                                                columnNumber: 19
                                            }, this))
                                    }, void 0, false, {
                                        fileName: "[project]/features/recruiter/RecruiterWizard.tsx",
                                        lineNumber: 167,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/features/recruiter/RecruiterWizard.tsx",
                                lineNumber: 163,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/features/recruiter/RecruiterWizard.tsx",
                        lineNumber: 135,
                        columnNumber: 11
                    }, this),
                    activeStep === 2 && schoolDetails && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Box$2f$Box$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Box$3e$__["Box"], {
                        sx: {
                            maxWidth: 900
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Typography$2f$Typography$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Typography$3e$__["Typography"], {
                                variant: "h6",
                                gutterBottom: true,
                                children: schoolDetails.name
                            }, void 0, false, {
                                fileName: "[project]/features/recruiter/RecruiterWizard.tsx",
                                lineNumber: 189,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Typography$2f$Typography$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Typography$3e$__["Typography"], {
                                variant: "body2",
                                color: "text.secondary",
                                sx: {
                                    mb: 2
                                },
                                children: [
                                    schoolDetails.city,
                                    ", ",
                                    schoolDetails.state,
                                    " — ",
                                    schoolDetails.division,
                                    " ",
                                    schoolDetails.conference ? `• ${schoolDetails.conference}` : ''
                                ]
                            }, void 0, true, {
                                fileName: "[project]/features/recruiter/RecruiterWizard.tsx",
                                lineNumber: 192,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Typography$2f$Typography$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Typography$3e$__["Typography"], {
                                variant: "subtitle1",
                                sx: {
                                    mb: 1
                                },
                                children: "Coaches"
                            }, void 0, false, {
                                fileName: "[project]/features/recruiter/RecruiterWizard.tsx",
                                lineNumber: 195,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Box$2f$Box$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Box$3e$__["Box"], {
                                sx: {
                                    display: 'grid',
                                    gridTemplateColumns: {
                                        xs: '1fr',
                                        md: '1fr 1fr'
                                    },
                                    gap: 1
                                },
                                children: schoolDetails.coaches?.map((c)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$FormControlLabel$2f$FormControlLabel$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FormControlLabel$3e$__["FormControlLabel"], {
                                        control: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Checkbox$2f$Checkbox$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Checkbox$3e$__["Checkbox"], {
                                            checked: Boolean(selectedCoachIds[c.id]),
                                            onChange: ()=>toggleCoach(c.id)
                                        }, void 0, false, {
                                            fileName: "[project]/features/recruiter/RecruiterWizard.tsx",
                                            lineNumber: 202,
                                            columnNumber: 28
                                        }, void 0),
                                        label: `${c.firstName} ${c.lastName} — ${c.title}${c.email ? ` (${c.email})` : ''}`
                                    }, c.id, false, {
                                        fileName: "[project]/features/recruiter/RecruiterWizard.tsx",
                                        lineNumber: 200,
                                        columnNumber: 17
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/features/recruiter/RecruiterWizard.tsx",
                                lineNumber: 198,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/features/recruiter/RecruiterWizard.tsx",
                        lineNumber: 188,
                        columnNumber: 11
                    }, this),
                    activeStep === 3 && draft && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Box$2f$Box$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Box$3e$__["Box"], {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Typography$2f$Typography$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Typography$3e$__["Typography"], {
                                variant: "h6",
                                gutterBottom: true,
                                children: "Draft"
                            }, void 0, false, {
                                fileName: "[project]/features/recruiter/RecruiterWizard.tsx",
                                lineNumber: 211,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("pre", {
                                style: {
                                    whiteSpace: 'pre-wrap'
                                },
                                children: draft
                            }, void 0, false, {
                                fileName: "[project]/features/recruiter/RecruiterWizard.tsx",
                                lineNumber: 214,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/features/recruiter/RecruiterWizard.tsx",
                        lineNumber: 210,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/features/recruiter/RecruiterWizard.tsx",
                lineNumber: 116,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Box$2f$Box$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Box$3e$__["Box"], {
                sx: {
                    display: 'flex',
                    justifyContent: 'space-between'
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Button$2f$Button$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Button$3e$__["Button"], {
                        disabled: activeStep === 0,
                        onClick: handleBack,
                        children: "Back"
                    }, void 0, false, {
                        fileName: "[project]/features/recruiter/RecruiterWizard.tsx",
                        lineNumber: 219,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Button$2f$Button$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Button$3e$__["Button"], {
                        variant: "contained",
                        onClick: handleNext,
                        disabled: !canNext,
                        children: isLast ? 'Generate' : 'Next'
                    }, void 0, false, {
                        fileName: "[project]/features/recruiter/RecruiterWizard.tsx",
                        lineNumber: 222,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/features/recruiter/RecruiterWizard.tsx",
                lineNumber: 218,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/features/recruiter/RecruiterWizard.tsx",
        lineNumber: 108,
        columnNumber: 5
    }, this);
}
_s(RecruiterWizard, "mV3vDWJV/LCWlefvQYYkZAVzTjY=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$features$2f$auth$2f$session$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSession"]
    ];
});
_c = RecruiterWizard;
var _c;
__turbopack_context__.k.register(_c, "RecruiterWizard");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/(app)/recruiter/page.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>RecruiterBackofficePage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Typography$2f$Typography$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Typography$3e$__ = __turbopack_context__.i("[project]/node_modules/@mui/material/esm/Typography/Typography.js [app-client] (ecmascript) <export default as Typography>");
var __TURBOPACK__imported__module__$5b$project$5d2f$features$2f$recruiter$2f$RecruiterWizard$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/features/recruiter/RecruiterWizard.tsx [app-client] (ecmascript)");
'use client';
;
;
;
function RecruiterBackofficePage() {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
        style: {
            padding: 24
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Typography$2f$Typography$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Typography$3e$__["Typography"], {
                variant: "h4",
                gutterBottom: true,
                children: "Recruiter"
            }, void 0, false, {
                fileName: "[project]/app/(app)/recruiter/page.tsx",
                lineNumber: 9,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$features$2f$recruiter$2f$RecruiterWizard$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["RecruiterWizard"], {}, void 0, false, {
                fileName: "[project]/app/(app)/recruiter/page.tsx",
                lineNumber: 10,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/(app)/recruiter/page.tsx",
        lineNumber: 8,
        columnNumber: 5
    }, this);
}
_c = RecruiterBackofficePage;
var _c;
__turbopack_context__.k.register(_c, "RecruiterBackofficePage");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=_9ff2d0d7._.js.map