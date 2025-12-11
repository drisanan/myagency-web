module.exports = [
"[project]/services/aiRecruiter.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "generateContentDraft",
    ()=>generateContentDraft,
    "generateIntro",
    ()=>generateIntro
]);
'use client';
const INTRO_URL = '/api/ai/intro';
async function generateIntro(body) {
    const res = await fetch(INTRO_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify(body)
    });
    if (!res.ok) {
        const text = await res.text().catch(()=>'');
        throw new Error(`HTTP ${res.status}: ${text || res.statusText}`);
    }
    const data = await res.json();
    if (data?.error) {
        throw new Error(data.error);
    }
    return String(data.intro ?? '');
}
async function generateContentDraft(_body) {
    // Placeholder: will implement once the content endpoint is provided
    return '';
}
}),
"[project]/services/agencies.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
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
"[project]/services/clients.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
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
var __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$agencies$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/services/agencies.ts [app-ssr] (ecmascript)");
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
    if ("TURBOPACK compile-time truthy", 1) return [
        ...SEED_CLIENTS
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
let CLIENTS = readStore();
async function listClientsByAgencyEmail(agencyEmail) {
    return CLIENTS.filter((c)=>c.agencyEmail === agencyEmail);
}
async function listClientsByAgency(agencyId) {
    const agency = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$agencies$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getAgencyById"])(agencyId);
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
    const raw = ("TURBOPACK compile-time falsy", 0) ? "TURBOPACK unreachable" : null;
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
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
}),
"[project]/services/recruiterMeta.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
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
    // Return all US states (and DC); division is ignored intentionally
    return [
        {
            code: 'AL',
            name: 'Alabama'
        },
        {
            code: 'AK',
            name: 'Alaska'
        },
        {
            code: 'AZ',
            name: 'Arizona'
        },
        {
            code: 'AR',
            name: 'Arkansas'
        },
        {
            code: 'CA',
            name: 'California'
        },
        {
            code: 'CO',
            name: 'Colorado'
        },
        {
            code: 'CT',
            name: 'Connecticut'
        },
        {
            code: 'DE',
            name: 'Delaware'
        },
        {
            code: 'FL',
            name: 'Florida'
        },
        {
            code: 'GA',
            name: 'Georgia'
        },
        {
            code: 'HI',
            name: 'Hawaii'
        },
        {
            code: 'ID',
            name: 'Idaho'
        },
        {
            code: 'IL',
            name: 'Illinois'
        },
        {
            code: 'IN',
            name: 'Indiana'
        },
        {
            code: 'IA',
            name: 'Iowa'
        },
        {
            code: 'KS',
            name: 'Kansas'
        },
        {
            code: 'KY',
            name: 'Kentucky'
        },
        {
            code: 'LA',
            name: 'Louisiana'
        },
        {
            code: 'ME',
            name: 'Maine'
        },
        {
            code: 'MD',
            name: 'Maryland'
        },
        {
            code: 'MA',
            name: 'Massachusetts'
        },
        {
            code: 'MI',
            name: 'Michigan'
        },
        {
            code: 'MN',
            name: 'Minnesota'
        },
        {
            code: 'MS',
            name: 'Mississippi'
        },
        {
            code: 'MO',
            name: 'Missouri'
        },
        {
            code: 'MT',
            name: 'Montana'
        },
        {
            code: 'NE',
            name: 'Nebraska'
        },
        {
            code: 'NV',
            name: 'Nevada'
        },
        {
            code: 'NH',
            name: 'New Hampshire'
        },
        {
            code: 'NJ',
            name: 'New Jersey'
        },
        {
            code: 'NM',
            name: 'New Mexico'
        },
        {
            code: 'NY',
            name: 'New York'
        },
        {
            code: 'NC',
            name: 'North Carolina'
        },
        {
            code: 'ND',
            name: 'North Dakota'
        },
        {
            code: 'OH',
            name: 'Ohio'
        },
        {
            code: 'OK',
            name: 'Oklahoma'
        },
        {
            code: 'OR',
            name: 'Oregon'
        },
        {
            code: 'PA',
            name: 'Pennsylvania'
        },
        {
            code: 'RI',
            name: 'Rhode Island'
        },
        {
            code: 'SC',
            name: 'South Carolina'
        },
        {
            code: 'SD',
            name: 'South Dakota'
        },
        {
            code: 'TN',
            name: 'Tennessee'
        },
        {
            code: 'TX',
            name: 'Texas'
        },
        {
            code: 'UT',
            name: 'Utah'
        },
        {
            code: 'VT',
            name: 'Vermont'
        },
        {
            code: 'VA',
            name: 'Virginia'
        },
        {
            code: 'WA',
            name: 'Washington'
        },
        {
            code: 'WV',
            name: 'West Virginia'
        },
        {
            code: 'WI',
            name: 'Wisconsin'
        },
        {
            code: 'WY',
            name: 'Wyoming'
        },
        {
            code: 'DC',
            name: 'District of Columbia'
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
}),
"[project]/services/recruiter.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DIVISION_API_MAPPING",
    ()=>DIVISION_API_MAPPING,
    "getUniversityDetails",
    ()=>getUniversityDetails,
    "listUniversities",
    ()=>listUniversities
]);
'use client';
// Real Lambda-backed recruiter service for universities list and details
const BASE_URL = 'https://c3gognktxzx6xqlrdfb6bxvxsu0ojalg.lambda-url.us-west-2.on.aws';
const DIVISION_API_MAPPING = {
    D1: 'division-1',
    D1AA: 'division-1aa',
    D2: 'division-2',
    D3: 'division-3',
    JUCO: 'division-juco',
    NAIA: 'division-naia'
};
const DIVISION_SLUG_TO_LABEL = {
    'division-1': 'D1',
    'division-1aa': 'D1AA',
    'division-2': 'D2',
    'division-3': 'D3',
    'division-juco': 'JUCO',
    'division-naia': 'NAIA'
};
function toName(item) {
    return item?.name ?? item?.School ?? item?.school ?? '';
}
async function listUniversities(params) {
    const qs = new URLSearchParams({
        sport: params.sport,
        division: params.division,
        state: params.state
    });
    const url = `${BASE_URL}?${qs.toString()}`;
    // eslint-disable-next-line no-console
    console.log('[Recruiter:listUniversities] GET', url);
    const res = await fetch(url, {
        cache: 'no-store'
    });
    if (!res.ok) {
        const text = await res.text().catch(()=>'');
        // eslint-disable-next-line no-console
        console.error('[Recruiter:listUniversities] HTTP error', res.status, text);
        throw new Error(`HTTP ${res.status}: ${text || res.statusText}`);
    }
    const data = await res.json();
    return (Array.isArray(data) ? data : []).map((u)=>({
            name: toName(u)
        })).filter((u)=>u.name);
}
async function getUniversityDetails(params) {
    const qs = new URLSearchParams({
        sport: params.sport,
        division: params.division,
        state: params.state,
        school: params.school
    });
    const url = `${BASE_URL}?${qs.toString()}`;
    // eslint-disable-next-line no-console
    console.log('[Recruiter:getUniversityDetails] GET', url);
    const res = await fetch(url, {
        cache: 'no-store'
    });
    if (!res.ok) {
        const text = await res.text().catch(()=>'');
        // eslint-disable-next-line no-console
        console.error('[Recruiter:getUniversityDetails] HTTP error', res.status, text);
        throw new Error(`HTTP ${res.status}: ${text || res.statusText}`);
    }
    const raw = await res.json();
    const obj = Array.isArray(raw) ? raw[0] ?? {} : raw;
    const coachesRaw = obj.coaches ?? obj.Coaches ?? [];
    const coaches = (Array.isArray(coachesRaw) ? coachesRaw : []).map((c, i)=>{
        const firstName = c.firstName ?? c.FirstName ?? '';
        const lastName = c.lastName ?? c.LastName ?? '';
        const title = c.title ?? c.Title ?? c.Position ?? '';
        const email = c.email ?? c.Email ?? '';
        const baseId = String(c.id ?? c.Id ?? email ?? '').trim();
        const synthetic = [
            firstName,
            lastName,
            title,
            email
        ].filter(Boolean).join('|');
        const id = (baseId ? `${baseId}|` : '') + `${synthetic}|${i}`;
        return {
            id,
            firstName,
            lastName,
            title,
            email: email || undefined,
            twitter: c.twitter ?? c.Twitter,
            instagram: c.instagram ?? c.Instagram
        };
    });
    const cityCandidate = (()=>{
        const direct = obj.city ?? obj.City ?? obj.cityName ?? obj.CityName;
        if (direct) return direct;
        if (typeof obj.Location === 'string' && obj.Location.includes(',')) {
            return obj.Location.split(',')[0].trim();
        }
        return '';
    })();
    const divisionRaw = obj.division ?? obj.Division ?? obj.divisionName ?? obj.DivisionName ?? obj.NcaaDivision ?? obj.NCAADivision ?? '';
    const divisionResolved = divisionRaw || DIVISION_SLUG_TO_LABEL[(params.division || '').toLowerCase()] || params.division;
    return {
        id: obj.id ?? obj.Id,
        name: obj.name ?? obj.Name ?? obj.school ?? obj.School ?? params.school,
        city: cityCandidate,
        state: obj.state ?? obj.State ?? params.state,
        division: divisionResolved,
        conference: obj.conference ?? obj.Conference,
        privatePublic: obj.privatePublic ?? obj.PrivatePublic,
        coaches,
        schoolInfo: obj.schoolInfo ?? obj
    };
}
}),
"[project]/services/templates.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "applyTemplate",
    ()=>applyTemplate,
    "getTemplate",
    ()=>getTemplate,
    "listTemplates",
    ()=>listTemplates,
    "saveTemplate",
    ()=>saveTemplate,
    "toTemplateHtml",
    ()=>toTemplateHtml
]);
'use client';
const KEY = 'email_templates_v1';
function loadAll() {
    try {
        const raw = localStorage.getItem(KEY);
        return raw ? JSON.parse(raw) : [];
    } catch  {
        return [];
    }
}
function saveAll(list) {
    localStorage.setItem(KEY, JSON.stringify(list));
}
function uid() {
    return Math.random().toString(36).slice(2) + Date.now().toString(36);
}
function listTemplates(input) {
    const all = loadAll();
    return all.filter((t)=>t.agencyEmail === input.agencyEmail && (input.clientId ? t.clientId === input.clientId : true)).sort((a, b)=>b.createdAt - a.createdAt);
}
function saveTemplate(input) {
    const all = loadAll();
    const rec = {
        ...input,
        id: uid(),
        createdAt: Date.now()
    };
    saveAll([
        rec,
        ...all
    ]);
    return rec;
}
function getTemplate(id) {
    return loadAll().find((t)=>t.id === id);
}
function escapeRegExp(s) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
function toTemplateHtml(html, ctx) {
    let out = String(html);
    // Replace longer tokens first to avoid partial overlaps
    const replacements = {
        [ctx.studentFullName]: '{{StudentFullName}}',
        [ctx.studentFirstName]: '{{StudentFirstName}}',
        [ctx.studentLastName]: '{{StudentLastName}}',
        [ctx.universityName]: '{{UniversityName}}'
    };
    if (ctx.primaryCoachLastName) {
        replacements[ctx.primaryCoachLastName] = '{{PrimaryCoachLastName}}';
    }
    if (ctx.coachList) {
        replacements[ctx.coachList] = '{{CoachList}}';
    }
    for (const [from, to] of Object.entries(replacements)){
        if (from && from.trim().length) {
            const re = new RegExp(escapeRegExp(from), 'g');
            out = out.replace(re, to);
        }
    }
    return out;
}
function applyTemplate(html, ctx) {
    let out = String(html);
    const map = {
        '{{StudentFirstName}}': ctx.studentFirstName || '',
        '{{StudentLastName}}': ctx.studentLastName || '',
        '{{StudentFullName}}': ctx.studentFullName || '',
        '{{UniversityName}}': ctx.universityName || '',
        '{{PrimaryCoachLastName}}': ctx.primaryCoachLastName || '',
        '{{CoachList}}': ctx.coachList || ''
    };
    for (const [k, v] of Object.entries(map)){
        const re = new RegExp(escapeRegExp(k), 'g');
        out = out.replace(re, v);
    }
    return out;
}
}),
"[project]/services/lists.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "deleteList",
    ()=>deleteList,
    "getList",
    ()=>getList,
    "listLists",
    ()=>listLists,
    "saveList",
    ()=>saveList,
    "updateList",
    ()=>updateList
]);
const STORAGE_KEY = 'coach_lists_v1';
function read() {
    if ("TURBOPACK compile-time truthy", 1) return [];
    //TURBOPACK unreachable
    ;
}
function write(items) {
    if ("TURBOPACK compile-time truthy", 1) return;
    //TURBOPACK unreachable
    ;
}
function listLists(agencyEmail) {
    const all = read();
    return all.filter((l)=>l.agencyEmail === agencyEmail).sort((a, b)=>b.updatedAt - a.updatedAt);
}
function getList(id) {
    const all = read();
    return all.find((l)=>l.id === id) ?? null;
}
function saveList(input) {
    const all = read();
    const id = `list-${Math.random().toString(36).slice(2, 10)}`;
    const now = Date.now();
    const rec = {
        id,
        agencyEmail: input.agencyEmail,
        name: input.name,
        items: input.items,
        createdAt: now,
        updatedAt: now
    };
    write([
        rec,
        ...all
    ]);
    return rec;
}
function updateList(input) {
    const all = read();
    const idx = all.findIndex((l)=>l.id === input.id);
    if (idx < 0) return null;
    const now = Date.now();
    const next = {
        ...all[idx],
        name: input.name,
        items: input.items,
        updatedAt: now
    };
    all[idx] = next;
    write(all);
    return next;
}
function deleteList(id) {
    const all = read();
    write(all.filter((l)=>l.id !== id));
}
}),
"[project]/features/recruiter/RecruiterWizard.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "RecruiterWizard",
    ()=>RecruiterWizard
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Box$2f$Box$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Box$3e$__ = __turbopack_context__.i("[project]/node_modules/@mui/material/esm/Box/Box.js [app-ssr] (ecmascript) <export default as Box>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Button$2f$Button$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Button$3e$__ = __turbopack_context__.i("[project]/node_modules/@mui/material/esm/Button/Button.js [app-ssr] (ecmascript) <export default as Button>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Step$2f$Step$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Step$3e$__ = __turbopack_context__.i("[project]/node_modules/@mui/material/esm/Step/Step.js [app-ssr] (ecmascript) <export default as Step>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$StepLabel$2f$StepLabel$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__StepLabel$3e$__ = __turbopack_context__.i("[project]/node_modules/@mui/material/esm/StepLabel/StepLabel.js [app-ssr] (ecmascript) <export default as StepLabel>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Stepper$2f$Stepper$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Stepper$3e$__ = __turbopack_context__.i("[project]/node_modules/@mui/material/esm/Stepper/Stepper.js [app-ssr] (ecmascript) <export default as Stepper>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$TextField$2f$TextField$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__TextField$3e$__ = __turbopack_context__.i("[project]/node_modules/@mui/material/esm/TextField/TextField.js [app-ssr] (ecmascript) <export default as TextField>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Typography$2f$Typography$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Typography$3e$__ = __turbopack_context__.i("[project]/node_modules/@mui/material/esm/Typography/Typography.js [app-ssr] (ecmascript) <export default as Typography>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Card$2f$Card$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Card$3e$__ = __turbopack_context__.i("[project]/node_modules/@mui/material/esm/Card/Card.js [app-ssr] (ecmascript) <export default as Card>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$CardContent$2f$CardContent$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__CardContent$3e$__ = __turbopack_context__.i("[project]/node_modules/@mui/material/esm/CardContent/CardContent.js [app-ssr] (ecmascript) <export default as CardContent>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Checkbox$2f$Checkbox$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Checkbox$3e$__ = __turbopack_context__.i("[project]/node_modules/@mui/material/esm/Checkbox/Checkbox.js [app-ssr] (ecmascript) <export default as Checkbox>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$FormControlLabel$2f$FormControlLabel$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__FormControlLabel$3e$__ = __turbopack_context__.i("[project]/node_modules/@mui/material/esm/FormControlLabel/FormControlLabel.js [app-ssr] (ecmascript) <export default as FormControlLabel>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$MenuItem$2f$MenuItem$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__MenuItem$3e$__ = __turbopack_context__.i("[project]/node_modules/@mui/material/esm/MenuItem/MenuItem.js [app-ssr] (ecmascript) <export default as MenuItem>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Stack$2f$Stack$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Stack$3e$__ = __turbopack_context__.i("[project]/node_modules/@mui/material/esm/Stack/Stack.js [app-ssr] (ecmascript) <export default as Stack>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Accordion$2f$Accordion$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Accordion$3e$__ = __turbopack_context__.i("[project]/node_modules/@mui/material/esm/Accordion/Accordion.js [app-ssr] (ecmascript) <export default as Accordion>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$AccordionSummary$2f$AccordionSummary$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__AccordionSummary$3e$__ = __turbopack_context__.i("[project]/node_modules/@mui/material/esm/AccordionSummary/AccordionSummary.js [app-ssr] (ecmascript) <export default as AccordionSummary>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$AccordionDetails$2f$AccordionDetails$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__AccordionDetails$3e$__ = __turbopack_context__.i("[project]/node_modules/@mui/material/esm/AccordionDetails/AccordionDetails.js [app-ssr] (ecmascript) <export default as AccordionDetails>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Switch$2f$Switch$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Switch$3e$__ = __turbopack_context__.i("[project]/node_modules/@mui/material/esm/Switch/Switch.js [app-ssr] (ecmascript) <export default as Switch>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$icons$2d$material$2f$esm$2f$ExpandMore$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@mui/icons-material/esm/ExpandMore.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$aiRecruiter$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/services/aiRecruiter.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$features$2f$auth$2f$session$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/features/auth/session.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$clients$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/services/clients.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$recruiterMeta$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/services/recruiterMeta.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$recruiter$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/services/recruiter.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$templates$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/services/templates.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$lists$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/services/lists.ts [app-ssr] (ecmascript)");
(()=>{
    const e = new Error("Cannot find module '@/services/mailStatus'");
    e.code = 'MODULE_NOT_FOUND';
    throw e;
})();
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
;
;
function RecruiterWizard() {
    const { session } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$features$2f$auth$2f$session$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useSession"])();
    const [activeStep, setActiveStep] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].useState(0);
    // Step 1 - client selection
    const [clients, setClients] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].useState([]);
    const [clientId, setClientId] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].useState('');
    // Step 2 - division/state/schools
    const [divisions, setDivisions] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].useState([]);
    const [division, setDivision] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].useState('');
    const [states, setStates] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].useState([]);
    const [state, setState] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].useState('');
    const [schools, setSchools] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].useState([]);
    const [lists, setLists] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].useState([]);
    const [selectedListId, setSelectedListId] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].useState('');
    const [selectedList, setSelectedList] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].useState(null);
    const [listMode, setListMode] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].useState(false);
    // Step 3 - school details and coach selection
    const [selectedSchoolName, setSelectedSchoolName] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].useState('');
    const [schoolDetails, setSchoolDetails] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].useState(null);
    const [selectedCoachIds, setSelectedCoachIds] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].useState({});
    // Draft
    const [draft, setDraft] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].useState('');
    const [error, setError] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].useState(null);
    // Step 4 - sections and granular selections for email building
    const [enabledSections, setEnabledSections] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].useState({
        accomplishments: true,
        motivation: true,
        academic: true,
        athletic: true,
        highlights: true,
        contact: true,
        coach: true,
        references: true,
        profilePicture: false,
        radarPage: true
    });
    const [selectedFields, setSelectedFields] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].useState({});
    const [templates, setTemplates] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].useState([]);
    const [templateName, setTemplateName] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].useState('');
    const [selectedTemplateId, setSelectedTemplateId] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].useState('');
    const [gmailConnecting, setGmailConnecting] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].useState(false);
    const [gmailConnected, setGmailConnected] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].useState(false);
    const popupRef = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].useRef(null);
    const lastConnectedClientIdRef = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].useRef('');
    const currentClient = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].useMemo(()=>clients.find((c)=>c.id === clientId) || null, [
        clients,
        clientId
    ]);
    const contact = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].useMemo(()=>{
        const radar = currentClient?.radar ?? {};
        return {
            email: currentClient?.email ?? '',
            phone: currentClient?.phone ?? '',
            firstName: currentClient?.firstName ?? '',
            lastName: currentClient?.lastName ?? '',
            school: radar.school ?? '',
            accomplishments: radar.accomplishments ?? [],
            motivationalQuotes: radar.motivationalQuotes ?? (radar.athleteAdvice ? [
                radar.athleteAdvice
            ] : []),
            gpa: radar.gpa ?? '',
            preferredAreaOfStudy: radar.preferredAreaOfStudy ?? '',
            athleteMetricsTitleOne: radar.athleteMetricsTitleOne ?? '',
            athleteMetricsValueOne: radar.athleteMetricsValueOne ?? '',
            athleteMetricsTitleTwo: radar.athleteMetricsTitleTwo ?? '',
            athleteMetricsValueTwo: radar.athleteMetricsValueTwo ?? '',
            athleteMetricsTitleThree: radar.athleteMetricsTitleThree ?? '',
            athleteMetricsValueThree: radar.athleteMetricsValueThree ?? '',
            athleteMetricsTitleFour: radar.athleteMetricsTitleFour ?? '',
            athleteMetricsValueFour: radar.athleteMetricsValueFour ?? '',
            youtubeHighlightUrl: radar.youtubeHighlightUrl ?? '',
            hudlLink: radar.hudlLink ?? '',
            instagramProfileUrl: radar.instagramProfileUrl ?? '',
            newsArticleLinks: radar.newsArticleLinks ?? [],
            headCoachName: radar.headCoachName ?? '',
            headCoachEmail: radar.headCoachEmail ?? '',
            headCoachPhone: radar.headCoachPhone ?? '',
            referenceOneName: radar.referenceOneName ?? '',
            referenceOneEmail: radar.referenceOneEmail ?? '',
            referenceOnePhone: radar.referenceOnePhone ?? '',
            referenceTwoName: radar.referenceTwoName ?? '',
            referenceTwoEmail: radar.referenceTwoEmail ?? '',
            referenceTwoPhone: radar.referenceTwoPhone ?? '',
            profileImage: radar.profileImage ?? ''
        };
    }, [
        currentClient
    ]);
    const selectedCoaches = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].useMemo(()=>{
        const map = selectedCoachIds || {};
        if (listMode && selectedList) {
            const items = selectedList.items || [];
            return items.map((it, idx)=>{
                const id = String(it.id || `List::${it.school || ''}::${it.email || ''}::${it.firstName || ''}-${it.lastName || ''}::${it.title || ''}::${idx}`);
                return {
                    id,
                    firstName: it.firstName || '',
                    lastName: it.lastName || '',
                    email: it.email || '',
                    title: it.title || ''
                };
            }).filter((c)=>map[c.id]);
        }
        const all = schoolDetails?.coaches ?? [];
        return all.filter((c)=>map[c.id]);
    }, [
        selectedCoachIds,
        schoolDetails,
        listMode,
        selectedList
    ]);
    const universityName = schoolDetails?.schoolInfo?.School || schoolDetails?.name || '';
    function toggleSection(k, v) {
        setEnabledSections((p)=>({
                ...p,
                [k]: v
            }));
    }
    function setField(section, fieldKey, checked) {
        setSelectedFields((p)=>({
                ...p,
                [section]: {
                    ...p[section] ?? {},
                    [fieldKey]: checked
                }
            }));
    }
    function buildEmailPreview() {
        const coachName = selectedCoaches[0]?.lastName || selectedCoaches[0]?.LastName || 'Coach';
        const enabledIds = Object.keys(enabledSections).filter((k)=>enabledSections[k]);
        let emailContent = '';
        const generatedIntro = `${contact.firstName || ''} ${contact.lastName || ''} - ${contact.school || ''}`.trim();
        emailContent += `<p>Hello Coach ${coachName || ''},</p><p>${generatedIntro}</p>`;
        if (enabledIds.includes('accomplishments')) {
            const valid = (contact.accomplishments || []).filter((item)=>item && item.trim() !== '' && item !== 'undefined' && item !== 'null');
            if (valid.length) {
                emailContent += `<p><strong>Accomplishments:</strong></p><ul>${valid.map((item, i)=>{
                    const prefix = valid.length > 1 ? `${i + 1}. ` : '';
                    return `<li>${prefix}${item.trim()}</li>`;
                }).join('')}</ul>\n\n`;
            }
        }
        if (enabledIds.includes('motivation') && contact.motivationalQuotes?.[0]) {
            const first = contact.motivationalQuotes[0];
            emailContent += `<p><strong>Why I'm Ready For The Next Level:</strong></p><p>"${first}"</p>\n\n`;
        }
        if (enabledIds.includes('academic') && (contact.gpa || contact.preferredAreaOfStudy)) {
            emailContent += `<p><strong>Academic Information:</strong></p><ul>${[
                contact.gpa ? `<li>GPA: ${contact.gpa}</li>` : '',
                contact.preferredAreaOfStudy ? `<li>Preferred Area of Study: ${contact.preferredAreaOfStudy}</li>` : ''
            ].filter(Boolean).join('')}</ul>\n`;
        }
        if (enabledIds.includes('athletic')) {
            const metrics = [
                {
                    title: contact.athleteMetricsTitleOne,
                    value: contact.athleteMetricsValueOne
                },
                {
                    title: contact.athleteMetricsTitleTwo,
                    value: contact.athleteMetricsValueTwo
                },
                {
                    title: contact.athleteMetricsTitleThree,
                    value: contact.athleteMetricsValueThree
                },
                {
                    title: contact.athleteMetricsTitleFour,
                    value: contact.athleteMetricsValueFour
                }
            ].filter((m)=>m.title && m.value);
            if (metrics.length) {
                emailContent += `<p><strong>Athletic Metrics:</strong></p><ul>${metrics.map((m, i)=>{
                    const prefix = metrics.length > 1 ? `${i + 1}. ` : '';
                    return `<li>${prefix}${m.title}: ${m.value}</li>`;
                }).join('')}</ul>\n`;
            } else {
                emailContent += `<p><strong>Athletic Metrics:</strong></p><p>No athletic metrics available.</p>\n`;
            }
        }
        if (enabledIds.includes('highlights')) {
            const highlights = [
                contact.youtubeHighlightUrl ? {
                    type: 'YouTube Highlight',
                    url: `https://www.youtube.com/watch?v=${contact.youtubeHighlightUrl}`
                } : null,
                contact.hudlLink ? {
                    type: 'Hudl Profile',
                    url: `https://www.hudl.com/profile/${contact.hudlLink}`
                } : null,
                contact.instagramProfileUrl ? {
                    type: 'Instagram',
                    url: `https://www.instagram.com/${contact.instagramProfileUrl}`
                } : null,
                ...(contact.newsArticleLinks || []).map((url)=>({
                        type: 'Article',
                        url
                    })) || []
            ].filter(Boolean);
            if (highlights.length) {
                emailContent += `<p><strong>View My Highlights:</strong></p><ul>${highlights.map((h, i)=>{
                    const prefix = highlights.length > 1 ? `${i + 1}. ` : '';
                    return `<li>${prefix}<a href="${h.url}" target="_blank">${h.type}</a></li>`;
                }).join('')}</ul>\n`;
            } else {
                emailContent += `<p><strong>View My Highlights:</strong></p><p>No highlights available.</p>\n`;
            }
        }
        if (enabledIds.includes('contact') && (contact.email || contact.phone)) {
            emailContent += `<p><strong>Contact Info:</strong></p><ul>${[
                contact.email ? `<li>Email: <a href="mailto:${contact.email}">${contact.email}</a></li>` : '',
                contact.phone ? `<li>Phone: <a href="tel:${contact.phone}">${contact.phone}</a></li>` : ''
            ].filter(Boolean).join('')}</ul>\n`;
        }
        if (enabledIds.includes('coach') && (contact.headCoachName || contact.headCoachEmail || contact.headCoachPhone)) {
            emailContent += `<p><strong>Head Coach Info:</strong></p><ul>${[
                contact.headCoachName ? `<li>Name: ${contact.headCoachName}</li>` : '',
                contact.headCoachEmail ? `<li>Email: <a href="mailto:${contact.headCoachEmail}">${contact.headCoachEmail}</a></li>` : '',
                contact.headCoachPhone ? `<li>Phone: <a href="tel:${contact.headCoachPhone}">${contact.headCoachPhone}</a></li>` : ''
            ].filter(Boolean).join('')}</ul>\n`;
        }
        if (enabledIds.includes('references') && (contact.referenceOneName || contact.referenceTwoName)) {
            emailContent += `<p><strong>References:</strong></p><ul>${[
                contact.referenceOneName ? `<li>${contact.referenceOneName}<br>${contact.referenceOnePhone ? `Phone: <a href="tel:${contact.referenceOnePhone}">${contact.referenceOnePhone}</a>` : ''} <br>${contact.referenceOneEmail ? `Email: <a href="mailto:${contact.referenceOneEmail}">${contact.referenceOneEmail}</a>` : ''}</li>` : '',
                contact.referenceTwoName ? `<li>${contact.referenceTwoName}<br>${contact.referenceTwoPhone ? `Phone: <a href="tel:${contact.referenceTwoPhone}">${contact.referenceTwoPhone}</a>` : ''} <br>${contact.referenceTwoEmail ? `Email: <a href="mailto:${contact.referenceTwoEmail}">${contact.referenceTwoEmail}</a>` : ''}</li>` : ''
            ].filter(Boolean).join('')}</ul>\n`;
        }
        if (enabledIds.includes('profilePicture') && contact.profileImage) {
            emailContent += `<p><img src="${contact.profileImage}" alt="Profile Picture" width="250px" height="250px" style="max-width: 250px; height: auto; display: block;"></p>`;
        }
        emailContent += `<p>Thank you for your time!</p><p>${contact.firstName || ''} ${contact.lastName || ''} - ${contact.school || ''}</p>`;
        if (enabledIds.includes('radarPage') && contact.email) {
            emailContent += `\nFollow My Radar Page: <a href="https://radar.athletenarrative.com/?username=${encodeURIComponent(contact.email)}" target="_blank">HERE</a>`;
        }
        return emailContent;
    }
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].useEffect(()=>{
        function onMessage(e) {
            if ("TURBOPACK compile-time truthy", 1) return;
            //TURBOPACK unreachable
            ;
        }
        window.addEventListener('message', onMessage);
        return ()=>window.removeEventListener('message', onMessage);
    }, []);
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].useEffect(()=>{
        if (!currentClient?.id) {
            setGmailConnected(false);
            return;
        }
        if ("TURBOPACK compile-time truthy", 1) {
            setGmailConnected(false);
            return;
        }
        //TURBOPACK unreachable
        ;
    }, [
        currentClient?.id
    ]);
    async function handleConnectGmail() {
        try {
            if (!currentClient?.id) {
                setError('Select a client first');
                return;
            }
            setGmailConnecting(true);
            const res = await fetch(`/api/google/oauth/url?clientId=${encodeURIComponent(currentClient.id)}`);
            const data = await res.json();
            if (!data?.url) throw new Error('Failed to start Gmail connection flow');
            const w = 500, h = 700;
            const y = window.top?.outerHeight ? Math.max(0, (window.top.outerHeight - h) / 2) : 100;
            const x = window.top?.outerWidth ? Math.max(0, (window.top.outerWidth - w) / 2) : 100;
            popupRef.current = window.open(data.url, 'an-google-oauth', `toolbar=no,location=no,status=no,menubar=no,scrollbars=yes,resizable=yes,width=${w},height=${h},top=${y},left=${x}`);
            if (!popupRef.current) throw new Error('Popup blocked. Allow popups and retry.');
        } catch (e) {
            setGmailConnecting(false);
            setError(e?.message || 'Failed to start Gmail connection');
        }
    }
    async function handleCreateGmailDraft() {
        try {
            const id = currentClient?.id || lastConnectedClientIdRef.current || clientId || '';
            if (!id) {
                setError('Select a client first');
                return;
            }
            console.info('[gmail-ui:draft:start]', {
                clientId: id
            });
            // Ensure server has tokens for this client; rehydrate from client record if not
            try {
                const statusRes = await fetch(`/api/google/status?clientId=${encodeURIComponent(id)}`);
                const status = await statusRes.json();
                console.info('[gmail-ui:status]', {
                    clientId: id,
                    connected: Boolean(status?.connected)
                });
                if (!status?.connected) {
                    const saved = (0, __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$clients$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getClientGmailTokens"])(id);
                    console.info('[gmail-ui:rehydrate:attempt]', {
                        clientId: id,
                        hasSavedTokens: Boolean(saved),
                        hasAccess: Boolean(saved?.access_token),
                        hasRefresh: Boolean(saved?.refresh_token)
                    });
                    if (saved) {
                        await fetch('/api/google/tokens', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                                clientId: id,
                                tokens: saved
                            })
                        });
                        setGmailConnected(true);
                        console.info('[gmail-ui:rehydrate:result]', {
                            clientId: id,
                            ok: true
                        });
                    }
                }
            } catch  {}
            const to = selectedCoaches.map((c)=>c.email || c.Email).filter(Boolean);
            if (!to.length) {
                setError('Select at least one coach with an email');
                return;
            }
            const subject = `Intro: ${contact.firstName || ''} ${contact.lastName || ''} → ${universityName || ''}`.trim();
            const html = aiHtml || buildEmailPreview();
            const savedTokens = (0, __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$clients$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getClientGmailTokens"])(id);
            const res = await fetch('/api/gmail/create-draft', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    clientId: id,
                    to,
                    subject,
                    html,
                    tokens: savedTokens || undefined
                })
            });
            const data = await res.json();
            if (!res.ok || !data?.ok) {
                throw new Error(data?.error || 'Draft creation failed');
            }
            if (data.openUrl) {
                window.open(data.openUrl, '_blank');
            }
            try {
                if (currentClient?.id) {
                    const emailsToMark = selectedCoaches.map((c)=>c.email).filter(Boolean);
                    markMailed(currentClient.id, emailsToMark);
                }
            } catch  {}
        } catch (e) {
            console.error(e);
            setError(e?.message || 'Failed to create Gmail draft');
        }
    }
    // AI improvement flow for intro sentence
    const [aiLoading, setAiLoading] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].useState(false);
    const [aiHtml, setAiHtml] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].useState('');
    const [isGenerating, setIsGenerating] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].useState(false);
    async function handleImproveWithAI() {
        try {
            setAiLoading(true);
            setError(null);
            const sport = currentClient?.sport || '';
            const collegeName = universityName || '';
            const coachLast = selectedCoaches[0]?.lastName || selectedCoaches[0]?.LastName || 'Coach';
            const fullName = `${contact.firstName || ''} ${contact.lastName || ''}`.trim();
            const parts = [];
            if (enabledSections.accomplishments && contact.accomplishments?.length) parts.push('notable accomplishments');
            if (enabledSections.academic && (contact.gpa || contact.preferredAreaOfStudy)) parts.push('key academic details');
            if (enabledSections.athletic) parts.push('athletic metrics and performance');
            if (enabledSections.highlights) parts.push('highlight links for review');
            const coachMessage = `This is an introduction email for ${fullName}. The student-athlete is introducing themselves with ${parts.join(', ') || 'basic profile details'}. Please use the student's actual name; do not use placeholders.`;
            const intro = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$aiRecruiter$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["generateIntro"])({
                sport,
                collegeName,
                coachMessage,
                tone: 'A highschool kid who loves sports',
                qualities: [
                    'Passionate',
                    'Hardworking',
                    'Determined'
                ],
                additionalInsights: `Student full name: ${fullName}. Use this exact name; do not output placeholders like [StudentName].`
            });
            const introFixed = String(intro).replace(/\[StudentName\]/gi, fullName);
            // Merge AI intro with the rest of the composed email
            const base = buildEmailPreview();
            const stripped = base.replace(/^<p>Hello Coach[\s\S]*?<\/p>\s*<p>[\s\S]*?<\/p>/, '');
            const rest = stripped || base;
            const improved = `<p>Hello Coach ${coachLast},</p><p>${introFixed}</p>${rest}`;
            setAiHtml(improved);
        } catch (e) {
            setError(e?.message || 'AI generation failed');
        } finally{
            setAiLoading(false);
        }
    }
    async function generateFullEmailHtml() {
        const coachLast = selectedCoaches[0]?.lastName || selectedCoaches[0]?.LastName || 'Coach';
        const fullName = `${contact.firstName || ''} ${contact.lastName || ''}`.trim();
        const sport = currentClient?.sport || '';
        const collegeName = universityName || '';
        const parts = [];
        if (enabledSections.accomplishments && contact.accomplishments?.length) parts.push('notable accomplishments');
        if (enabledSections.academic && (contact.gpa || contact.preferredAreaOfStudy)) parts.push('academic information');
        if (enabledSections.athletic) parts.push('athletic metrics');
        if (enabledSections.highlights) parts.push('highlights');
        const coachMessage = `This is an introduction email for ${fullName}. The student-athlete is introducing themselves with ${parts.join(', ') || 'basic profile details'}. Please use the student's actual name; do not use placeholders.`;
        const intro = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$aiRecruiter$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["generateIntro"])({
            sport,
            collegeName,
            coachMessage,
            tone: 'A highschool kid who loves sports',
            qualities: [
                'Passionate',
                'Hardworking',
                'Determined'
            ],
            additionalInsights: `Student full name: ${fullName}. Use this exact name; do not output placeholders like [StudentName].`
        });
        const introFixed = String(intro).replace(/\[StudentName\]/gi, fullName);
        const base = buildEmailPreview();
        const stripped = base.replace(/^<[^>]*>Hello\s+Coach[\s\S]*?<\/p>\s*<p>[\s\S]*?<\/p>/i, "");
        const rest = stripped || base;
        return `<p>Hello Coach ${coachLast},</p><p>${introFixed}</p>${rest}`;
    }
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].useEffect(()=>{
        if (!session) return;
        if (session.role !== 'agency') return;
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$clients$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["listClientsByAgencyEmail"])(session.email).then(setClients);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$recruiterMeta$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getDivisions"])().then(setDivisions);
        // load saved lists for this agency
        setLists((0, __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$lists$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["listLists"])(session.email));
    }, [
        session
    ]);
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].useEffect(()=>{
        if (!division) {
            setStates([]);
            setState('');
            setSchools([]);
            return;
        }
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$recruiterMeta$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getStates"])(division).then(setStates);
        setState('');
        setSchools([]);
    }, [
        division
    ]);
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].useEffect(()=>{
        if (division && state && clientId) {
            const client = clients.find((c)=>c.id === clientId) || null;
            const sport = client?.sport || '';
            if (!sport) {
                setSchools([]);
                return;
            }
            const divisionSlug = __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$recruiter$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DIVISION_API_MAPPING"][division] || division;
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$recruiter$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["listUniversities"])({
                sport,
                division: divisionSlug,
                state
            }).then(setSchools).catch((e)=>{
                setSchools([]);
                setError(e?.message || 'Failed to load universities');
            });
        } else {
            setSchools([]);
        }
    }, [
        division,
        state,
        clientId,
        clients
    ]);
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].useEffect(()=>{
        if (!selectedSchoolName) {
            setSchoolDetails(null);
            setSelectedCoachIds({});
            return;
        }
        const client = clients.find((c)=>c.id === clientId) || null;
        const sport = client?.sport || '';
        if (!sport || !division || !state) {
            setSchoolDetails(null);
            return;
        }
        const divisionSlug = __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$recruiter$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DIVISION_API_MAPPING"][division] || division;
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$recruiter$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getUniversityDetails"])({
            sport,
            division: divisionSlug,
            state,
            school: selectedSchoolName
        }).then((u)=>{
            setSchoolDetails(u);
            setSelectedCoachIds({});
        }).catch((e)=>{
            setSchoolDetails(null);
            setSelectedCoachIds({});
            setError(e?.message || 'Failed to load university');
        });
    }, [
        selectedSchoolName,
        clientId,
        division,
        state,
        clients
    ]);
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].useEffect(()=>{
        setError(null);
    }, [
        division,
        state,
        selectedSchoolName,
        clientId
    ]);
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].useEffect(()=>{
        if (!session?.email) return;
        setTemplates((0, __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$templates$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["listTemplates"])({
            agencyEmail: session.email,
            clientId
        }));
    }, [
        session,
        clientId
    ]);
    const isLast = activeStep === 3;
    const canNext = activeStep === 0 && Boolean(clientId) || activeStep === 1 && Boolean(division) && Boolean(state) && schools.length > 0 || activeStep === 2 && Boolean(selectedSchoolName) || activeStep === 3;
    const handleNext = async ()=>{
        if (isLast) {
            try {
                setIsGenerating(true);
                setError(null);
                const html = await generateFullEmailHtml();
                setAiHtml(html);
                setDraft(html);
            } catch (e) {
                setError(e?.message || 'Failed to generate email');
            } finally{
                setIsGenerating(false);
            }
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
    function currentEmailContext() {
        const studentFirstName = contact.firstName || '';
        const studentLastName = contact.lastName || '';
        const studentFullName = `${studentFirstName} ${studentLastName}`.trim();
        const uName = universityName || schoolDetails?.schoolInfo?.School || schoolDetails?.name || '';
        const primaryCoachLastName = selectedCoaches[0]?.lastName || selectedCoaches[0]?.LastName || '';
        const coachList = (selectedCoaches || []).map((c)=>`${c.firstName || c.FirstName || ''} ${c.lastName || c.LastName || ''}`.trim()).filter(Boolean).join(', ');
        return {
            studentFirstName,
            studentLastName,
            studentFullName,
            universityName: uName,
            primaryCoachLastName,
            coachList
        };
    }
    function handleSaveTemplate() {
        if (!session?.email) return;
        const html = aiHtml || buildEmailPreview();
        const ctx = currentEmailContext();
        const placeholderHtml = (0, __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$templates$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toTemplateHtml"])(html, ctx);
        const rec = (0, __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$templates$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["saveTemplate"])({
            agencyEmail: session.email,
            clientId,
            name: templateName || `Template ${new Date().toLocaleString()}`,
            html: placeholderHtml,
            enabledSections
        });
        setTemplates([
            rec,
            ...templates
        ]);
        setTemplateName('');
    }
    function handleApplyTemplate(id) {
        const t = templates.find((x)=>x.id === id);
        if (!t) return;
        const html = (0, __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$templates$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["applyTemplate"])(t.html, currentEmailContext());
        setAiHtml(html);
        setDraft(html);
        if (t.enabledSections) setEnabledSections(t.enabledSections);
        setSelectedTemplateId(id);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Box$2f$Box$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Box$3e$__["Box"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Stepper$2f$Stepper$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Stepper$3e$__["Stepper"], {
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
                ].map((label)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Step$2f$Step$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Step$3e$__["Step"], {
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$StepLabel$2f$StepLabel$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__StepLabel$3e$__["StepLabel"], {
                            children: label
                        }, void 0, false, {
                            fileName: "[project]/features/recruiter/RecruiterWizard.tsx",
                            lineNumber: 556,
                            columnNumber: 13
                        }, this)
                    }, label, false, {
                        fileName: "[project]/features/recruiter/RecruiterWizard.tsx",
                        lineNumber: 555,
                        columnNumber: 11
                    }, this))
            }, void 0, false, {
                fileName: "[project]/features/recruiter/RecruiterWizard.tsx",
                lineNumber: 553,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Box$2f$Box$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Box$3e$__["Box"], {
                sx: {
                    mb: 2
                },
                children: [
                    error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Typography$2f$Typography$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Typography$3e$__["Typography"], {
                        color: "error",
                        sx: {
                            mb: 2
                        },
                        children: error
                    }, void 0, false, {
                        fileName: "[project]/features/recruiter/RecruiterWizard.tsx",
                        lineNumber: 562,
                        columnNumber: 11
                    }, this),
                    activeStep === 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Box$2f$Box$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Box$3e$__["Box"], {
                        sx: {
                            display: 'grid',
                            gridTemplateColumns: {
                                xs: '1fr',
                                md: '1fr 1fr'
                            },
                            gap: 2,
                            maxWidth: 700
                        },
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$TextField$2f$TextField$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__TextField$3e$__["TextField"], {
                            select: true,
                            label: "Client",
                            value: clientId,
                            onChange: (e)=>setClientId(e.target.value),
                            SelectProps: {
                                MenuProps: {
                                    disablePortal: true
                                }
                            },
                            children: clients.map((c)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$MenuItem$2f$MenuItem$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__MenuItem$3e$__["MenuItem"], {
                                    value: c.id,
                                    children: [
                                        c.email,
                                        " ",
                                        c.firstName ? `- ${c.firstName} ${c.lastName}` : ''
                                    ]
                                }, c.id, true, {
                                    fileName: "[project]/features/recruiter/RecruiterWizard.tsx",
                                    lineNumber: 576,
                                    columnNumber: 17
                                }, this))
                        }, void 0, false, {
                            fileName: "[project]/features/recruiter/RecruiterWizard.tsx",
                            lineNumber: 568,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/features/recruiter/RecruiterWizard.tsx",
                        lineNumber: 567,
                        columnNumber: 11
                    }, this),
                    activeStep === 1 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Box$2f$Box$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Box$3e$__["Box"], {
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
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$TextField$2f$TextField$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__TextField$3e$__["TextField"], {
                                select: true,
                                label: "Division",
                                value: division,
                                onChange: (e)=>setDivision(e.target.value),
                                SelectProps: {
                                    MenuProps: {
                                        disablePortal: true
                                    }
                                },
                                children: divisions.map((d)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$MenuItem$2f$MenuItem$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__MenuItem$3e$__["MenuItem"], {
                                        value: d,
                                        children: d
                                    }, d, false, {
                                        fileName: "[project]/features/recruiter/RecruiterWizard.tsx",
                                        lineNumber: 593,
                                        columnNumber: 17
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/features/recruiter/RecruiterWizard.tsx",
                                lineNumber: 585,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$TextField$2f$TextField$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__TextField$3e$__["TextField"], {
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
                                children: states.map((s)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$MenuItem$2f$MenuItem$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__MenuItem$3e$__["MenuItem"], {
                                        value: s.code,
                                        children: s.name
                                    }, s.code, false, {
                                        fileName: "[project]/features/recruiter/RecruiterWizard.tsx",
                                        lineNumber: 607,
                                        columnNumber: 17
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/features/recruiter/RecruiterWizard.tsx",
                                lineNumber: 598,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$TextField$2f$TextField$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__TextField$3e$__["TextField"], {
                                select: true,
                                label: "List",
                                value: selectedListId,
                                onChange: (e)=>{
                                    const id = String(e.target.value);
                                    setSelectedListId(id);
                                    const l = lists.find((x)=>x.id === id) || null;
                                    setSelectedList(l);
                                    if (l) {
                                        setListMode(true);
                                        const mapping = {};
                                        (l.items || []).forEach((it, idx)=>{
                                            const rowId = String(it.id || `List::${it.school || ''}::${it.email || ''}::${it.firstName || ''}-${it.lastName || ''}::${it.title || ''}::${idx}`);
                                            mapping[rowId] = true;
                                        });
                                        setSelectedCoachIds(mapping);
                                        setSelectedSchoolName('');
                                        setSchoolDetails(null);
                                        setActiveStep(2);
                                    } else {
                                        setListMode(false);
                                        setSelectedCoachIds({});
                                    }
                                },
                                SelectProps: {
                                    MenuProps: {
                                        disablePortal: true
                                    }
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$MenuItem$2f$MenuItem$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__MenuItem$3e$__["MenuItem"], {
                                        value: "",
                                        children: "(Select a list)"
                                    }, void 0, false, {
                                        fileName: "[project]/features/recruiter/RecruiterWizard.tsx",
                                        lineNumber: 641,
                                        columnNumber: 15
                                    }, this),
                                    lists.map((l)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$MenuItem$2f$MenuItem$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__MenuItem$3e$__["MenuItem"], {
                                            value: l.id,
                                            children: l.name
                                        }, l.id, false, {
                                            fileName: "[project]/features/recruiter/RecruiterWizard.tsx",
                                            lineNumber: 643,
                                            columnNumber: 17
                                        }, this))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/features/recruiter/RecruiterWizard.tsx",
                                lineNumber: 612,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Box$2f$Box$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Box$3e$__["Box"], {
                                sx: {
                                    gridColumn: '1 / -1'
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Typography$2f$Typography$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Typography$3e$__["Typography"], {
                                        variant: "subtitle2",
                                        color: "text.secondary",
                                        sx: {
                                            mb: 1
                                        },
                                        children: "Universities"
                                    }, void 0, false, {
                                        fileName: "[project]/features/recruiter/RecruiterWizard.tsx",
                                        lineNumber: 649,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Stack$2f$Stack$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Stack$3e$__["Stack"], {
                                        direction: "row",
                                        spacing: 2,
                                        sx: {
                                            flexWrap: 'wrap'
                                        },
                                        children: schools.map((u)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Card$2f$Card$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Card$3e$__["Card"], {
                                                onClick: ()=>setSelectedSchoolName(u.name),
                                                sx: {
                                                    width: 260,
                                                    cursor: 'pointer',
                                                    outline: selectedSchoolName === u.name ? '2px solid #1976d2' : 'none'
                                                },
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$CardContent$2f$CardContent$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__CardContent$3e$__["CardContent"], {
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Typography$2f$Typography$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Typography$3e$__["Typography"], {
                                                        children: u.name
                                                    }, void 0, false, {
                                                        fileName: "[project]/features/recruiter/RecruiterWizard.tsx",
                                                        lineNumber: 664,
                                                        columnNumber: 23
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/features/recruiter/RecruiterWizard.tsx",
                                                    lineNumber: 663,
                                                    columnNumber: 21
                                                }, this)
                                            }, u.name, false, {
                                                fileName: "[project]/features/recruiter/RecruiterWizard.tsx",
                                                lineNumber: 654,
                                                columnNumber: 19
                                            }, this))
                                    }, void 0, false, {
                                        fileName: "[project]/features/recruiter/RecruiterWizard.tsx",
                                        lineNumber: 652,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/features/recruiter/RecruiterWizard.tsx",
                                lineNumber: 648,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/features/recruiter/RecruiterWizard.tsx",
                        lineNumber: 584,
                        columnNumber: 11
                    }, this),
                    activeStep === 2 && listMode && selectedList && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Box$2f$Box$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Box$3e$__["Box"], {
                        sx: {
                            maxWidth: 1000
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Typography$2f$Typography$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Typography$3e$__["Typography"], {
                                variant: "h6",
                                gutterBottom: true,
                                children: selectedList.name
                            }, void 0, false, {
                                fileName: "[project]/features/recruiter/RecruiterWizard.tsx",
                                lineNumber: 674,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Stack$2f$Stack$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Stack$3e$__["Stack"], {
                                direction: "row",
                                spacing: 1,
                                sx: {
                                    mb: 1
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Button$2f$Button$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Button$3e$__["Button"], {
                                        size: "small",
                                        variant: "outlined",
                                        onClick: ()=>{
                                            const mapping = {};
                                            (selectedList.items || []).forEach((it, idx)=>{
                                                const rowId = String(it.id || `List::${it.school || ''}::${it.email || ''}::${it.firstName || ''}-${it.lastName || ''}::${it.title || ''}::${idx}`);
                                                mapping[rowId] = true;
                                            });
                                            setSelectedCoachIds(mapping);
                                        },
                                        children: "Select All"
                                    }, void 0, false, {
                                        fileName: "[project]/features/recruiter/RecruiterWizard.tsx",
                                        lineNumber: 678,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Button$2f$Button$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Button$3e$__["Button"], {
                                        size: "small",
                                        onClick: ()=>setSelectedCoachIds({}),
                                        children: "Deselect All"
                                    }, void 0, false, {
                                        fileName: "[project]/features/recruiter/RecruiterWizard.tsx",
                                        lineNumber: 688,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/features/recruiter/RecruiterWizard.tsx",
                                lineNumber: 677,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Box$2f$Box$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Box$3e$__["Box"], {
                                sx: {
                                    display: 'grid',
                                    gridTemplateColumns: {
                                        xs: '1fr',
                                        md: '1fr 1fr'
                                    },
                                    gap: 1
                                },
                                children: (selectedList.items || []).map((it, idx)=>{
                                    const rowId = String(it.id || `List::${it.school || ''}::${it.email || ''}::${it.firstName || ''}-${it.lastName || ''}::${it.title || ''}::${idx}`);
                                    const mailed = currentClient?.id && it.email ? hasMailed(currentClient.id, it.email) : false;
                                    const labelName = `${it.firstName || ''} ${it.lastName || ''}`.trim() || it.email || '';
                                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$FormControlLabel$2f$FormControlLabel$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__FormControlLabel$3e$__["FormControlLabel"], {
                                        control: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Checkbox$2f$Checkbox$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Checkbox$3e$__["Checkbox"], {
                                            checked: Boolean(selectedCoachIds[rowId]),
                                            onChange: ()=>setSelectedCoachIds((p)=>({
                                                        ...p,
                                                        [rowId]: !p[rowId]
                                                    }))
                                        }, void 0, false, {
                                            fileName: "[project]/features/recruiter/RecruiterWizard.tsx",
                                            lineNumber: 700,
                                            columnNumber: 30
                                        }, void 0),
                                        label: `${labelName}${it.title ? ` — ${it.title}` : ''}${it.email ? ` (${it.email})` : ''}${mailed ? ' — Mailed' : ''}`
                                    }, rowId, false, {
                                        fileName: "[project]/features/recruiter/RecruiterWizard.tsx",
                                        lineNumber: 698,
                                        columnNumber: 19
                                    }, this);
                                })
                            }, void 0, false, {
                                fileName: "[project]/features/recruiter/RecruiterWizard.tsx",
                                lineNumber: 690,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/features/recruiter/RecruiterWizard.tsx",
                        lineNumber: 673,
                        columnNumber: 11
                    }, this),
                    activeStep === 2 && !listMode && schoolDetails && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Box$2f$Box$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Box$3e$__["Box"], {
                        sx: {
                            maxWidth: 1000
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Typography$2f$Typography$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Typography$3e$__["Typography"], {
                                variant: "h6",
                                gutterBottom: true,
                                children: schoolDetails?.schoolInfo?.School || schoolDetails?.name || '—'
                            }, void 0, false, {
                                fileName: "[project]/features/recruiter/RecruiterWizard.tsx",
                                lineNumber: 710,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Box$2f$Box$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Box$3e$__["Box"], {
                                sx: {
                                    mb: 2
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Typography$2f$Typography$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Typography$3e$__["Typography"], {
                                        variant: "body2",
                                        color: "text.secondary",
                                        children: [
                                            "Location: ",
                                            schoolDetails?.schoolInfo?.City || '—',
                                            ", ",
                                            schoolDetails?.schoolInfo?.State || '—'
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/features/recruiter/RecruiterWizard.tsx",
                                        lineNumber: 714,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Typography$2f$Typography$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Typography$3e$__["Typography"], {
                                        variant: "body2",
                                        color: "text.secondary",
                                        children: [
                                            "Division: ",
                                            schoolDetails?.division || '—'
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/features/recruiter/RecruiterWizard.tsx",
                                        lineNumber: 717,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Typography$2f$Typography$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Typography$3e$__["Typography"], {
                                        variant: "body2",
                                        color: "text.secondary",
                                        children: [
                                            "Conference: ",
                                            schoolDetails?.schoolInfo?.Conference || schoolDetails?.conference || '—'
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/features/recruiter/RecruiterWizard.tsx",
                                        lineNumber: 720,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Typography$2f$Typography$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Typography$3e$__["Typography"], {
                                        variant: "body2",
                                        color: "text.secondary",
                                        children: [
                                            "Type: ",
                                            schoolDetails?.schoolInfo?.PrivatePublic || schoolDetails?.privatePublic || '—'
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/features/recruiter/RecruiterWizard.tsx",
                                        lineNumber: 723,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/features/recruiter/RecruiterWizard.tsx",
                                lineNumber: 713,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Box$2f$Box$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Box$3e$__["Box"], {
                                sx: {
                                    display: 'grid',
                                    gridTemplateColumns: {
                                        xs: '1fr',
                                        md: 'repeat(4, 1fr)'
                                    },
                                    gap: 2,
                                    mb: 2
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Box$2f$Box$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Box$3e$__["Box"], {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Typography$2f$Typography$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Typography$3e$__["Typography"], {
                                                variant: "subtitle2",
                                                color: "text.secondary",
                                                children: "GPA"
                                            }, void 0, false, {
                                                fileName: "[project]/features/recruiter/RecruiterWizard.tsx",
                                                lineNumber: 730,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Typography$2f$Typography$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Typography$3e$__["Typography"], {
                                                children: schoolDetails?.schoolInfo?.AverageGPA || '—'
                                            }, void 0, false, {
                                                fileName: "[project]/features/recruiter/RecruiterWizard.tsx",
                                                lineNumber: 731,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/features/recruiter/RecruiterWizard.tsx",
                                        lineNumber: 729,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Box$2f$Box$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Box$3e$__["Box"], {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Typography$2f$Typography$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Typography$3e$__["Typography"], {
                                                variant: "subtitle2",
                                                color: "text.secondary",
                                                children: "SAT Math"
                                            }, void 0, false, {
                                                fileName: "[project]/features/recruiter/RecruiterWizard.tsx",
                                                lineNumber: 734,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Typography$2f$Typography$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Typography$3e$__["Typography"], {
                                                children: schoolDetails?.schoolInfo?.SATMath || '—'
                                            }, void 0, false, {
                                                fileName: "[project]/features/recruiter/RecruiterWizard.tsx",
                                                lineNumber: 735,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/features/recruiter/RecruiterWizard.tsx",
                                        lineNumber: 733,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Box$2f$Box$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Box$3e$__["Box"], {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Typography$2f$Typography$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Typography$3e$__["Typography"], {
                                                variant: "subtitle2",
                                                color: "text.secondary",
                                                children: "SAT Reading"
                                            }, void 0, false, {
                                                fileName: "[project]/features/recruiter/RecruiterWizard.tsx",
                                                lineNumber: 738,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Typography$2f$Typography$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Typography$3e$__["Typography"], {
                                                children: schoolDetails?.schoolInfo?.SATReading || '—'
                                            }, void 0, false, {
                                                fileName: "[project]/features/recruiter/RecruiterWizard.tsx",
                                                lineNumber: 739,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/features/recruiter/RecruiterWizard.tsx",
                                        lineNumber: 737,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Box$2f$Box$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Box$3e$__["Box"], {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Typography$2f$Typography$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Typography$3e$__["Typography"], {
                                                variant: "subtitle2",
                                                color: "text.secondary",
                                                children: "ACT"
                                            }, void 0, false, {
                                                fileName: "[project]/features/recruiter/RecruiterWizard.tsx",
                                                lineNumber: 742,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Typography$2f$Typography$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Typography$3e$__["Typography"], {
                                                children: schoolDetails?.schoolInfo?.ACTComposite || '—'
                                            }, void 0, false, {
                                                fileName: "[project]/features/recruiter/RecruiterWizard.tsx",
                                                lineNumber: 743,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/features/recruiter/RecruiterWizard.tsx",
                                        lineNumber: 741,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/features/recruiter/RecruiterWizard.tsx",
                                lineNumber: 728,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Box$2f$Box$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Box$3e$__["Box"], {
                                sx: {
                                    display: 'grid',
                                    gridTemplateColumns: {
                                        xs: '1fr',
                                        md: 'repeat(3, 1fr)'
                                    },
                                    gap: 2,
                                    mb: 2
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Box$2f$Box$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Box$3e$__["Box"], {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Typography$2f$Typography$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Typography$3e$__["Typography"], {
                                                variant: "subtitle2",
                                                color: "text.secondary",
                                                children: "Acceptance Rate"
                                            }, void 0, false, {
                                                fileName: "[project]/features/recruiter/RecruiterWizard.tsx",
                                                lineNumber: 749,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Typography$2f$Typography$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Typography$3e$__["Typography"], {
                                                children: schoolDetails?.schoolInfo?.AcceptanceRate || '—'
                                            }, void 0, false, {
                                                fileName: "[project]/features/recruiter/RecruiterWizard.tsx",
                                                lineNumber: 750,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/features/recruiter/RecruiterWizard.tsx",
                                        lineNumber: 748,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Box$2f$Box$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Box$3e$__["Box"], {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Typography$2f$Typography$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Typography$3e$__["Typography"], {
                                                variant: "subtitle2",
                                                color: "text.secondary",
                                                children: "Yearly Cost"
                                            }, void 0, false, {
                                                fileName: "[project]/features/recruiter/RecruiterWizard.tsx",
                                                lineNumber: 753,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Typography$2f$Typography$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Typography$3e$__["Typography"], {
                                                children: schoolDetails?.schoolInfo?.YearlyCost || '—'
                                            }, void 0, false, {
                                                fileName: "[project]/features/recruiter/RecruiterWizard.tsx",
                                                lineNumber: 754,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/features/recruiter/RecruiterWizard.tsx",
                                        lineNumber: 752,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Box$2f$Box$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Box$3e$__["Box"], {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Typography$2f$Typography$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Typography$3e$__["Typography"], {
                                                variant: "subtitle2",
                                                color: "text.secondary",
                                                children: "US News Ranking"
                                            }, void 0, false, {
                                                fileName: "[project]/features/recruiter/RecruiterWizard.tsx",
                                                lineNumber: 757,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Typography$2f$Typography$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Typography$3e$__["Typography"], {
                                                children: schoolDetails?.schoolInfo?.USNewsRanking ? `#${schoolDetails.schoolInfo.USNewsRanking}` : '—'
                                            }, void 0, false, {
                                                fileName: "[project]/features/recruiter/RecruiterWizard.tsx",
                                                lineNumber: 758,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/features/recruiter/RecruiterWizard.tsx",
                                        lineNumber: 756,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/features/recruiter/RecruiterWizard.tsx",
                                lineNumber: 747,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Box$2f$Box$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Box$3e$__["Box"], {
                                sx: {
                                    display: 'flex',
                                    gap: 2,
                                    flexWrap: 'wrap',
                                    mb: 3
                                },
                                children: [
                                    schoolDetails?.schoolInfo?.MajorsOfferedLink && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Button$2f$Button$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Button$3e$__["Button"], {
                                        size: "small",
                                        variant: "outlined",
                                        onClick: ()=>window.open(schoolDetails.schoolInfo.MajorsOfferedLink, '_blank'),
                                        children: "View Majors"
                                    }, void 0, false, {
                                        fileName: "[project]/features/recruiter/RecruiterWizard.tsx",
                                        lineNumber: 764,
                                        columnNumber: 17
                                    }, this),
                                    schoolDetails?.schoolInfo?.Questionnaire && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Button$2f$Button$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Button$3e$__["Button"], {
                                        size: "small",
                                        variant: "outlined",
                                        onClick: ()=>window.open(schoolDetails.schoolInfo.Questionnaire, '_blank'),
                                        children: "Recruiting Questionnaire"
                                    }, void 0, false, {
                                        fileName: "[project]/features/recruiter/RecruiterWizard.tsx",
                                        lineNumber: 769,
                                        columnNumber: 17
                                    }, this),
                                    schoolDetails?.schoolInfo?.LandingPage && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Button$2f$Button$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Button$3e$__["Button"], {
                                        size: "small",
                                        variant: "outlined",
                                        onClick: ()=>window.open(schoolDetails.schoolInfo.LandingPage, '_blank'),
                                        children: "Team Website"
                                    }, void 0, false, {
                                        fileName: "[project]/features/recruiter/RecruiterWizard.tsx",
                                        lineNumber: 774,
                                        columnNumber: 17
                                    }, this),
                                    schoolDetails?.schoolInfo?.SchoolTwitter && schoolDetails.schoolInfo.SchoolTwitter !== '-' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Button$2f$Button$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Button$3e$__["Button"], {
                                        size: "small",
                                        variant: "text",
                                        onClick: ()=>window.open(schoolDetails.schoolInfo.SchoolTwitter, '_blank'),
                                        children: "Twitter"
                                    }, void 0, false, {
                                        fileName: "[project]/features/recruiter/RecruiterWizard.tsx",
                                        lineNumber: 779,
                                        columnNumber: 17
                                    }, this),
                                    schoolDetails?.schoolInfo?.SchoolInstagram && schoolDetails.schoolInfo.SchoolInstagram !== '-' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Button$2f$Button$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Button$3e$__["Button"], {
                                        size: "small",
                                        variant: "text",
                                        onClick: ()=>window.open(schoolDetails.schoolInfo.SchoolInstagram, '_blank'),
                                        children: "Instagram"
                                    }, void 0, false, {
                                        fileName: "[project]/features/recruiter/RecruiterWizard.tsx",
                                        lineNumber: 784,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/features/recruiter/RecruiterWizard.tsx",
                                lineNumber: 762,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Typography$2f$Typography$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Typography$3e$__["Typography"], {
                                variant: "subtitle1",
                                sx: {
                                    mb: 1
                                },
                                children: "Coaches"
                            }, void 0, false, {
                                fileName: "[project]/features/recruiter/RecruiterWizard.tsx",
                                lineNumber: 790,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Box$2f$Box$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Box$3e$__["Box"], {
                                sx: {
                                    display: 'grid',
                                    gridTemplateColumns: {
                                        xs: '1fr',
                                        md: '1fr 1fr'
                                    },
                                    gap: 1
                                },
                                children: (schoolDetails.coaches ?? []).map((c)=>{
                                    const id = c.id;
                                    const first = c.firstName || c.FirstName || '';
                                    const last = c.lastName || c.LastName || '';
                                    const title = c.title || c.Position || '';
                                    const email = c.email || c.Email;
                                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$FormControlLabel$2f$FormControlLabel$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__FormControlLabel$3e$__["FormControlLabel"], {
                                        control: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Checkbox$2f$Checkbox$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Checkbox$3e$__["Checkbox"], {
                                            checked: Boolean(selectedCoachIds[id]),
                                            onChange: ()=>setSelectedCoachIds((p)=>({
                                                        ...p,
                                                        [id]: !p[id]
                                                    }))
                                        }, void 0, false, {
                                            fileName: "[project]/features/recruiter/RecruiterWizard.tsx",
                                            lineNumber: 803,
                                            columnNumber: 30
                                        }, void 0),
                                        label: `${first} ${last} — ${title}${email ? ` (${email})` : ''}`
                                    }, id, false, {
                                        fileName: "[project]/features/recruiter/RecruiterWizard.tsx",
                                        lineNumber: 801,
                                        columnNumber: 19
                                    }, this);
                                })
                            }, void 0, false, {
                                fileName: "[project]/features/recruiter/RecruiterWizard.tsx",
                                lineNumber: 793,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/features/recruiter/RecruiterWizard.tsx",
                        lineNumber: 709,
                        columnNumber: 11
                    }, this),
                    activeStep === 3 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Box$2f$Box$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Box$3e$__["Box"], {
                        sx: {
                            display: 'grid',
                            gridTemplateColumns: {
                                xs: '1fr',
                                md: '1.2fr 1fr'
                            },
                            gap: 3
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Box$2f$Box$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Box$3e$__["Box"], {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Typography$2f$Typography$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Typography$3e$__["Typography"], {
                                        variant: "h6",
                                        gutterBottom: true,
                                        children: "Selected Targets"
                                    }, void 0, false, {
                                        fileName: "[project]/features/recruiter/RecruiterWizard.tsx",
                                        lineNumber: 814,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Typography$2f$Typography$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Typography$3e$__["Typography"], {
                                        variant: "body2",
                                        children: listMode && selectedList ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                                            children: [
                                                "List: ",
                                                selectedList.name
                                            ]
                                        }, void 0, true) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                                            children: [
                                                "University: ",
                                                universityName || '—'
                                            ]
                                        }, void 0, true)
                                    }, void 0, false, {
                                        fileName: "[project]/features/recruiter/RecruiterWizard.tsx",
                                        lineNumber: 815,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Typography$2f$Typography$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Typography$3e$__["Typography"], {
                                        variant: "body2",
                                        sx: {
                                            mt: 1,
                                            mb: 2
                                        },
                                        children: `Coaches: ${selectedCoaches.length ? selectedCoaches.map((c)=>{
                                            const nm = `${c.firstName || c.FirstName || ''} ${c.lastName || c.LastName || ''}`.trim();
                                            return nm || c.email || '';
                                        }).join(', ') : '—'}`
                                    }, void 0, false, {
                                        fileName: "[project]/features/recruiter/RecruiterWizard.tsx",
                                        lineNumber: 822,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Box$2f$Box$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Box$3e$__["Box"], {
                                        sx: {
                                            mb: 2,
                                            display: 'grid',
                                            gridTemplateColumns: {
                                                xs: '1fr',
                                                md: '1fr 1fr'
                                            },
                                            gap: 1
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$TextField$2f$TextField$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__TextField$3e$__["TextField"], {
                                                label: "Template name",
                                                value: templateName,
                                                onChange: (e)=>setTemplateName(e.target.value),
                                                size: "small"
                                            }, void 0, false, {
                                                fileName: "[project]/features/recruiter/RecruiterWizard.tsx",
                                                lineNumber: 829,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Button$2f$Button$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Button$3e$__["Button"], {
                                                variant: "outlined",
                                                onClick: handleSaveTemplate,
                                                disabled: !(aiHtml || buildEmailPreview()) || !session?.email,
                                                children: "Save as Template"
                                            }, void 0, false, {
                                                fileName: "[project]/features/recruiter/RecruiterWizard.tsx",
                                                lineNumber: 835,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$TextField$2f$TextField$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__TextField$3e$__["TextField"], {
                                                select: true,
                                                label: "Templates",
                                                value: selectedTemplateId,
                                                onChange: (e)=>handleApplyTemplate(String(e.target.value)),
                                                size: "small",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$MenuItem$2f$MenuItem$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__MenuItem$3e$__["MenuItem"], {
                                                        value: "",
                                                        children: "(Select a template)"
                                                    }, void 0, false, {
                                                        fileName: "[project]/features/recruiter/RecruiterWizard.tsx",
                                                        lineNumber: 849,
                                                        columnNumber: 19
                                                    }, this),
                                                    templates.map((t)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$MenuItem$2f$MenuItem$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__MenuItem$3e$__["MenuItem"], {
                                                            value: t.id,
                                                            children: t.name
                                                        }, t.id, false, {
                                                            fileName: "[project]/features/recruiter/RecruiterWizard.tsx",
                                                            lineNumber: 851,
                                                            columnNumber: 21
                                                        }, this))
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/features/recruiter/RecruiterWizard.tsx",
                                                lineNumber: 842,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/features/recruiter/RecruiterWizard.tsx",
                                        lineNumber: 828,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Typography$2f$Typography$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Typography$3e$__["Typography"], {
                                        variant: "h6",
                                        gutterBottom: true,
                                        children: "Email Sections"
                                    }, void 0, false, {
                                        fileName: "[project]/features/recruiter/RecruiterWizard.tsx",
                                        lineNumber: 855,
                                        columnNumber: 15
                                    }, this),
                                    Object.entries(enabledSections).map(([sectionKey, enabled])=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Accordion$2f$Accordion$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Accordion$3e$__["Accordion"], {
                                            expanded: enabled,
                                            onChange: (_, exp)=>toggleSection(sectionKey, exp),
                                            sx: {
                                                mb: 1
                                            },
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$AccordionSummary$2f$AccordionSummary$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__AccordionSummary$3e$__["AccordionSummary"], {
                                                    expandIcon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$icons$2d$material$2f$esm$2f$ExpandMore$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                                                        fileName: "[project]/features/recruiter/RecruiterWizard.tsx",
                                                        lineNumber: 863,
                                                        columnNumber: 49
                                                    }, void 0),
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Box$2f$Box$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Box$3e$__["Box"], {
                                                        sx: {
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: 2
                                                        },
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Switch$2f$Switch$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Switch$3e$__["Switch"], {
                                                                checked: enabled,
                                                                onChange: (e)=>toggleSection(sectionKey, e.target.checked)
                                                            }, void 0, false, {
                                                                fileName: "[project]/features/recruiter/RecruiterWizard.tsx",
                                                                lineNumber: 865,
                                                                columnNumber: 23
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Typography$2f$Typography$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Typography$3e$__["Typography"], {
                                                                sx: {
                                                                    textTransform: 'capitalize'
                                                                },
                                                                children: sectionKey
                                                            }, void 0, false, {
                                                                fileName: "[project]/features/recruiter/RecruiterWizard.tsx",
                                                                lineNumber: 866,
                                                                columnNumber: 23
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/features/recruiter/RecruiterWizard.tsx",
                                                        lineNumber: 864,
                                                        columnNumber: 21
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/features/recruiter/RecruiterWizard.tsx",
                                                    lineNumber: 863,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$AccordionDetails$2f$AccordionDetails$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__AccordionDetails$3e$__["AccordionDetails"], {
                                                    children: !enabled ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Typography$2f$Typography$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Typography$3e$__["Typography"], {
                                                        variant: "body2",
                                                        color: "text.secondary",
                                                        children: "Section disabled"
                                                    }, void 0, false, {
                                                        fileName: "[project]/features/recruiter/RecruiterWizard.tsx",
                                                        lineNumber: 871,
                                                        columnNumber: 23
                                                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Box$2f$Box$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Box$3e$__["Box"], {
                                                        sx: {
                                                            display: 'grid',
                                                            gridTemplateColumns: {
                                                                xs: '1fr',
                                                                md: '1fr 1fr'
                                                            },
                                                            gap: 1
                                                        },
                                                        children: [
                                                            sectionKey === 'accomplishments' && (contact.accomplishments || []).map((item, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$FormControlLabel$2f$FormControlLabel$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__FormControlLabel$3e$__["FormControlLabel"], {
                                                                    control: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Checkbox$2f$Checkbox$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Checkbox$3e$__["Checkbox"], {
                                                                        checked: Boolean(selectedFields.accomplishments?.[`acc-${i}`]),
                                                                        onChange: (e)=>setField('accomplishments', `acc-${i}`, e.target.checked)
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/features/recruiter/RecruiterWizard.tsx",
                                                                        lineNumber: 877,
                                                                        columnNumber: 38
                                                                    }, void 0),
                                                                    label: item
                                                                }, `acc-${i}`, false, {
                                                                    fileName: "[project]/features/recruiter/RecruiterWizard.tsx",
                                                                    lineNumber: 875,
                                                                    columnNumber: 27
                                                                }, this)),
                                                            sectionKey === 'athletic' && [
                                                                {
                                                                    k: 'm1',
                                                                    label: `${contact.athleteMetricsTitleOne || ''}: ${contact.athleteMetricsValueOne || ''}`.trim()
                                                                },
                                                                {
                                                                    k: 'm2',
                                                                    label: `${contact.athleteMetricsTitleTwo || ''}: ${contact.athleteMetricsValueTwo || ''}`.trim()
                                                                },
                                                                {
                                                                    k: 'm3',
                                                                    label: `${contact.athleteMetricsTitleThree || ''}: ${contact.athleteMetricsValueThree || ''}`.trim()
                                                                },
                                                                {
                                                                    k: 'm4',
                                                                    label: `${contact.athleteMetricsTitleFour || ''}: ${contact.athleteMetricsValueFour || ''}`.trim()
                                                                }
                                                            ].filter((m)=>m.label !== ':').map((m)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$FormControlLabel$2f$FormControlLabel$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__FormControlLabel$3e$__["FormControlLabel"], {
                                                                    control: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Checkbox$2f$Checkbox$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Checkbox$3e$__["Checkbox"], {
                                                                        checked: Boolean(selectedFields.athletic?.[m.k]),
                                                                        onChange: (e)=>setField('athletic', m.k, e.target.checked)
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/features/recruiter/RecruiterWizard.tsx",
                                                                        lineNumber: 891,
                                                                        columnNumber: 38
                                                                    }, void 0),
                                                                    label: m.label
                                                                }, m.k, false, {
                                                                    fileName: "[project]/features/recruiter/RecruiterWizard.tsx",
                                                                    lineNumber: 889,
                                                                    columnNumber: 27
                                                                }, this))
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/features/recruiter/RecruiterWizard.tsx",
                                                        lineNumber: 873,
                                                        columnNumber: 23
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/features/recruiter/RecruiterWizard.tsx",
                                                    lineNumber: 869,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, sectionKey, true, {
                                            fileName: "[project]/features/recruiter/RecruiterWizard.tsx",
                                            lineNumber: 857,
                                            columnNumber: 17
                                        }, this))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/features/recruiter/RecruiterWizard.tsx",
                                lineNumber: 813,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Box$2f$Box$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Box$3e$__["Box"], {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Typography$2f$Typography$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Typography$3e$__["Typography"], {
                                        variant: "h6",
                                        gutterBottom: true,
                                        children: "Preview"
                                    }, void 0, false, {
                                        fileName: "[project]/features/recruiter/RecruiterWizard.tsx",
                                        lineNumber: 902,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Box$2f$Box$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Box$3e$__["Box"], {
                                        sx: {
                                            border: '1px solid #ddd',
                                            borderRadius: 1,
                                            p: 2,
                                            minHeight: 200,
                                            bgcolor: '#fafafa'
                                        },
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            dangerouslySetInnerHTML: {
                                                __html: aiHtml || buildEmailPreview()
                                            }
                                        }, void 0, false, {
                                            fileName: "[project]/features/recruiter/RecruiterWizard.tsx",
                                            lineNumber: 904,
                                            columnNumber: 17
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/features/recruiter/RecruiterWizard.tsx",
                                        lineNumber: 903,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Box$2f$Box$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Box$3e$__["Box"], {
                                        sx: {
                                            display: 'flex',
                                            gap: 1,
                                            mt: 2
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Button$2f$Button$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Button$3e$__["Button"], {
                                                onClick: ()=>navigator.clipboard.writeText(aiHtml || buildEmailPreview()),
                                                children: "Copy HTML"
                                            }, void 0, false, {
                                                fileName: "[project]/features/recruiter/RecruiterWizard.tsx",
                                                lineNumber: 907,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Button$2f$Button$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Button$3e$__["Button"], {
                                                onClick: async ()=>{
                                                    const html = aiHtml || buildEmailPreview();
                                                    try {
                                                        // Prefer rich-text copy when supported
                                                        // @ts-ignore ClipboardItem may not be present in TS lib depending on environment
                                                        if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
                                                        ;
                                                        else {
                                                            // Fallback to plain text if rich copy is unavailable
                                                            const tmp = document.createElement('div');
                                                            tmp.innerHTML = html;
                                                            await navigator.clipboard.writeText(tmp.textContent || '');
                                                        }
                                                    } catch (e) {
                                                        console.error('Clipboard copy failed', e);
                                                    }
                                                },
                                                children: "Copy Rich Text"
                                            }, void 0, false, {
                                                fileName: "[project]/features/recruiter/RecruiterWizard.tsx",
                                                lineNumber: 908,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Button$2f$Button$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Button$3e$__["Button"], {
                                                variant: "outlined",
                                                onClick: handleConnectGmail,
                                                children: gmailConnected ? 'Gmail Connected' : gmailConnecting ? 'Connecting…' : 'Connect Gmail'
                                            }, void 0, false, {
                                                fileName: "[project]/features/recruiter/RecruiterWizard.tsx",
                                                lineNumber: 937,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Button$2f$Button$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Button$3e$__["Button"], {
                                                variant: "outlined",
                                                onClick: handleCreateGmailDraft,
                                                disabled: !selectedCoaches.length || !gmailConnected,
                                                children: "Create Gmail Draft"
                                            }, void 0, false, {
                                                fileName: "[project]/features/recruiter/RecruiterWizard.tsx",
                                                lineNumber: 940,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Button$2f$Button$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Button$3e$__["Button"], {
                                                variant: "contained",
                                                onClick: ()=>setDraft(aiHtml || buildEmailPreview()),
                                                children: "Lock In"
                                            }, void 0, false, {
                                                fileName: "[project]/features/recruiter/RecruiterWizard.tsx",
                                                lineNumber: 943,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Button$2f$Button$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Button$3e$__["Button"], {
                                                variant: "outlined",
                                                onClick: handleImproveWithAI,
                                                disabled: aiHtml ? false : aiHtml ? false : aiLoading || !selectedCoaches.length || !universityName,
                                                children: aiHtml ? 'Improve…' : 'Improve with AI'
                                            }, void 0, false, {
                                                fileName: "[project]/features/recruiter/RecruiterWizard.tsx",
                                                lineNumber: 944,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/features/recruiter/RecruiterWizard.tsx",
                                        lineNumber: 906,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/features/recruiter/RecruiterWizard.tsx",
                                lineNumber: 901,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/features/recruiter/RecruiterWizard.tsx",
                        lineNumber: 812,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/features/recruiter/RecruiterWizard.tsx",
                lineNumber: 560,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Box$2f$Box$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Box$3e$__["Box"], {
                sx: {
                    display: 'flex',
                    justifyContent: 'space-between'
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Button$2f$Button$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Button$3e$__["Button"], {
                        disabled: activeStep === 0,
                        onClick: handleBack,
                        children: "Back"
                    }, void 0, false, {
                        fileName: "[project]/features/recruiter/RecruiterWizard.tsx",
                        lineNumber: 957,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Button$2f$Button$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Button$3e$__["Button"], {
                        variant: "contained",
                        onClick: handleNext,
                        disabled: !canNext || isLast && isGenerating,
                        children: isLast ? isGenerating ? 'Generating…' : 'Generate' : 'Next'
                    }, void 0, false, {
                        fileName: "[project]/features/recruiter/RecruiterWizard.tsx",
                        lineNumber: 960,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/features/recruiter/RecruiterWizard.tsx",
                lineNumber: 956,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/features/recruiter/RecruiterWizard.tsx",
        lineNumber: 552,
        columnNumber: 5
    }, this);
}
}),
"[project]/app/(app)/recruiter/page.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>RecruiterBackofficePage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Typography$2f$Typography$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Typography$3e$__ = __turbopack_context__.i("[project]/node_modules/@mui/material/esm/Typography/Typography.js [app-ssr] (ecmascript) <export default as Typography>");
var __TURBOPACK__imported__module__$5b$project$5d2f$features$2f$recruiter$2f$RecruiterWizard$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/features/recruiter/RecruiterWizard.tsx [app-ssr] (ecmascript)");
'use client';
;
;
;
function RecruiterBackofficePage() {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
        style: {
            padding: 24
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Typography$2f$Typography$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Typography$3e$__["Typography"], {
                variant: "h4",
                gutterBottom: true,
                children: "Recruiter"
            }, void 0, false, {
                fileName: "[project]/app/(app)/recruiter/page.tsx",
                lineNumber: 9,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$features$2f$recruiter$2f$RecruiterWizard$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["RecruiterWizard"], {}, void 0, false, {
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
}),
];

//# sourceMappingURL=_478bf28e._.js.map