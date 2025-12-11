module.exports = [
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
"[project]/features/recruiter/divisionMapping.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DIVISION_MAPPING",
    ()=>DIVISION_MAPPING,
    "formatSportLabel",
    ()=>formatSportLabel,
    "getDivisionsForSport",
    ()=>getDivisionsForSport,
    "getSports",
    ()=>getSports,
    "getSportsForGender",
    ()=>getSportsForGender
]);
const DIVISION_MAPPING = {
    Football: [
        'D1',
        'D1AA',
        'D2',
        'D3',
        'JUCO',
        'NAIA'
    ],
    Baseball: [
        'D1',
        'D2',
        'D3',
        'JUCO',
        'NAIA'
    ],
    Softball: [
        'D1',
        'D2',
        'D3',
        'JUCO',
        'NAIA'
    ],
    WomensSoccer: [
        'D1',
        'D2',
        'D3',
        'JUCO',
        'NAIA'
    ],
    MensSoccer: [
        'D1',
        'D2',
        'D3',
        'JUCO',
        'NAIA'
    ],
    MensBasketball: [
        'D1',
        'D2',
        'D3',
        'JUCO',
        'NAIA'
    ],
    WomensBasketball: [
        'D1',
        'D2',
        'D3',
        'JUCO',
        'NAIA'
    ],
    WomensTrack: [
        'D1',
        'D2',
        'D3',
        'JUCO',
        'NAIA'
    ],
    WomensVolleyball: [
        'D1',
        'D2',
        'D3',
        'JUCO',
        'NAIA'
    ],
    WomensSwimming: [
        'D1',
        'D2',
        'D3',
        'JUCO',
        'NAIA'
    ],
    MensTrack: [
        'D1',
        'D2',
        'D3',
        'JUCO',
        'NAIA'
    ],
    MensSwimming: [
        'D1',
        'D2',
        'D3',
        'JUCO',
        'NAIA'
    ],
    WomensTennis: [
        'D1',
        'D2',
        'D3',
        'JUCO',
        'NAIA'
    ],
    MensTennis: [
        'D1',
        'D2',
        'D3',
        'JUCO',
        'NAIA'
    ],
    Dance: [
        'D1',
        'D2',
        'D3',
        'JUCO',
        'NAIA'
    ],
    MensGymnastics: [
        'D1',
        'D2',
        'D3',
        'JUCO',
        'NAIA'
    ],
    WomensGymnastics: [
        'D1',
        'D2',
        'D3',
        'JUCO',
        'NAIA'
    ],
    MensHockey: [
        'D1',
        'D2',
        'D3',
        'JUCO',
        'NAIA'
    ],
    WomensHockey: [
        'D1',
        'D2',
        'D3',
        'JUCO',
        'NAIA'
    ],
    Cheerleading: [
        'D1',
        'D2',
        'D3',
        'JUCO',
        'NAIA'
    ],
    WomensFlagFootball: [
        'D1',
        'D2',
        'D3',
        'JUCO',
        'NAIA'
    ],
    MensGolf: [
        'D1',
        'D2',
        'D3',
        'JUCO',
        'NAIA'
    ],
    WomensGolf: [
        'D1',
        'D2',
        'D3',
        'JUCO',
        'NAIA'
    ],
    MensVolleyball: [
        'D1',
        'D2',
        'D3',
        'JUCO',
        'NAIA'
    ],
    MensLacrosse: [
        'D1',
        'D2',
        'D3',
        'JUCO',
        'NAIA'
    ],
    WomensLacrosse: [
        'D1',
        'D2',
        'D3',
        'JUCO',
        'NAIA'
    ],
    WomensCrossCountry: [
        'D1',
        'D2',
        'D3',
        'JUCO',
        'NAIA'
    ],
    MensCrossCountry: [
        'D1',
        'D2',
        'D3',
        'JUCO',
        'NAIA'
    ]
};
function getSports() {
    return Object.keys(DIVISION_MAPPING);
}
function getSportsForGender(gender) {
    const all = Object.keys(DIVISION_MAPPING);
    const genderPrefix = gender;
    const gendered = all.filter((s)=>s.startsWith(genderPrefix));
    const neutral = all.filter((s)=>!s.startsWith('Mens') && !s.startsWith('Womens'));
    return [
        ...gendered,
        ...neutral
    ];
}
function getDivisionsForSport(sport) {
    return DIVISION_MAPPING[sport] ?? [];
}
function formatSportLabel(sport) {
    // Insert a space before capitals when preceded by a lowercase letter
    // e.g., WomensSoccer -> Womens Soccer, CrossCountry -> Cross Country
    return sport.replace(/([a-z])([A-Z])/g, '$1 $2');
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
"[project]/app/(app)/lists/page.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>ListsPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Box$2f$Box$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Box$3e$__ = __turbopack_context__.i("[project]/node_modules/@mui/material/esm/Box/Box.js [app-ssr] (ecmascript) <export default as Box>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Button$2f$Button$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Button$3e$__ = __turbopack_context__.i("[project]/node_modules/@mui/material/esm/Button/Button.js [app-ssr] (ecmascript) <export default as Button>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Card$2f$Card$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Card$3e$__ = __turbopack_context__.i("[project]/node_modules/@mui/material/esm/Card/Card.js [app-ssr] (ecmascript) <export default as Card>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$CardContent$2f$CardContent$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__CardContent$3e$__ = __turbopack_context__.i("[project]/node_modules/@mui/material/esm/CardContent/CardContent.js [app-ssr] (ecmascript) <export default as CardContent>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Divider$2f$Divider$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Divider$3e$__ = __turbopack_context__.i("[project]/node_modules/@mui/material/esm/Divider/Divider.js [app-ssr] (ecmascript) <export default as Divider>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$FormControlLabel$2f$FormControlLabel$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__FormControlLabel$3e$__ = __turbopack_context__.i("[project]/node_modules/@mui/material/esm/FormControlLabel/FormControlLabel.js [app-ssr] (ecmascript) <export default as FormControlLabel>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Checkbox$2f$Checkbox$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Checkbox$3e$__ = __turbopack_context__.i("[project]/node_modules/@mui/material/esm/Checkbox/Checkbox.js [app-ssr] (ecmascript) <export default as Checkbox>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$MenuItem$2f$MenuItem$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__MenuItem$3e$__ = __turbopack_context__.i("[project]/node_modules/@mui/material/esm/MenuItem/MenuItem.js [app-ssr] (ecmascript) <export default as MenuItem>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Paper$2f$Paper$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Paper$3e$__ = __turbopack_context__.i("[project]/node_modules/@mui/material/esm/Paper/Paper.js [app-ssr] (ecmascript) <export default as Paper>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Stack$2f$Stack$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Stack$3e$__ = __turbopack_context__.i("[project]/node_modules/@mui/material/esm/Stack/Stack.js [app-ssr] (ecmascript) <export default as Stack>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$TextField$2f$TextField$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__TextField$3e$__ = __turbopack_context__.i("[project]/node_modules/@mui/material/esm/TextField/TextField.js [app-ssr] (ecmascript) <export default as TextField>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Typography$2f$Typography$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Typography$3e$__ = __turbopack_context__.i("[project]/node_modules/@mui/material/esm/Typography/Typography.js [app-ssr] (ecmascript) <export default as Typography>");
var __TURBOPACK__imported__module__$5b$project$5d2f$features$2f$auth$2f$session$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/features/auth/session.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$recruiterMeta$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/services/recruiterMeta.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$features$2f$recruiter$2f$divisionMapping$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/features/recruiter/divisionMapping.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$recruiter$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/services/recruiter.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$lists$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/services/lists.ts [app-ssr] (ecmascript)");
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
function ListsPage() {
    const { session } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$features$2f$auth$2f$session$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useSession"])();
    const [sport, setSport] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].useState('');
    const [division, setDivision] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].useState('');
    const [stateCode, setStateCode] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].useState('');
    const [states, setStates] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].useState([]);
    const [divisions, setDivisions] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].useState([]);
    const [schools, setSchools] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].useState([]);
    const [selectedSchool, setSelectedSchool] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].useState('');
    const [schoolDetails, setSchoolDetails] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].useState(null);
    const [currentName, setCurrentName] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].useState('');
    const [currentItems, setCurrentItems] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].useState([]);
    const [editingId, setEditingId] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].useState('');
    const [saved, setSaved] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].useState([]);
    const [error, setError] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].useState(null);
    const sports = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].useMemo(()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$features$2f$recruiter$2f$divisionMapping$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getSports"])(), []);
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].useEffect(()=>{
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$recruiterMeta$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getDivisions"])().then(setDivisions).catch(()=>setDivisions([]));
    }, []);
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].useEffect(()=>{
        if (!division) {
            setStates([]);
            setStateCode('');
            setSchools([]);
            setSelectedSchool('');
            setSchoolDetails(null);
            return;
        }
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$recruiterMeta$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getStates"])(division).then(setStates);
    }, [
        division
    ]);
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].useEffect(()=>{
        if (!sport || !division || !stateCode) {
            setSchools([]);
            setSelectedSchool('');
            setSchoolDetails(null);
            return;
        }
        const divisionSlug = __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$recruiter$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DIVISION_API_MAPPING"][division] || division;
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$recruiter$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["listUniversities"])({
            sport,
            division: divisionSlug,
            state: stateCode
        }).then(setSchools).catch((e)=>{
            setError(e?.message || 'Failed to load universities');
            setSchools([]);
        });
    }, [
        sport,
        division,
        stateCode
    ]);
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].useEffect(()=>{
        if (!selectedSchool) {
            setSchoolDetails(null);
            return;
        }
        if (!sport || !division || !stateCode) return;
        const divisionSlug = __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$recruiter$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DIVISION_API_MAPPING"][division] || division;
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$recruiter$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getUniversityDetails"])({
            sport,
            division: divisionSlug,
            state: stateCode,
            school: selectedSchool
        }).then(setSchoolDetails).catch((e)=>{
            setError(e?.message || 'Failed to load school');
            setSchoolDetails(null);
        });
    }, [
        selectedSchool,
        sport,
        division,
        stateCode
    ]);
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].useEffect(()=>{
        if (!session?.email) return;
        setSaved((0, __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$lists$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["listLists"])(session.email));
    }, [
        session?.email
    ]);
    function addCoach(c, coachId) {
        const entry = {
            id: coachId,
            firstName: c.firstName || c.FirstName || '',
            lastName: c.lastName || c.LastName || '',
            email: c.email || c.Email || '',
            title: c.title || c.Position || '',
            school: schoolDetails?.schoolInfo?.School || schoolDetails?.name || selectedSchool || '',
            division,
            state: stateCode
        };
        if (!entry.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(entry.email)) return;
        setCurrentItems((prev)=>prev.some((x)=>x.id === coachId) ? prev : [
                entry,
                ...prev
            ]);
    }
    function removeCoach(i) {
        setCurrentItems((prev)=>prev.filter((_, idx)=>idx !== i));
    }
    function addManualCoach(f) {
        const [firstName, ...rest] = (f.name || '').trim().split(/\s+/);
        const lastName = rest.join(' ');
        const school = f.school || schoolDetails?.schoolInfo?.School || selectedSchool || '';
        const rowId = `manual::${school}::${(f.email || '').trim()}::${Date.now()}::${Math.random().toString(36).slice(2, 7)}`;
        const entry = {
            id: rowId,
            firstName,
            lastName,
            email: (f.email || '').trim(),
            title: f.title || '',
            school,
            division,
            state: stateCode
        };
        if (!entry.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(entry.email)) return;
        setCurrentItems((p)=>p.some((x)=>x.id === rowId) ? p : [
                entry,
                ...p
            ]);
    }
    function resetCurrent() {
        setEditingId('');
        setCurrentName('');
        setCurrentItems([]);
    }
    function saveCurrent() {
        if (!session?.email) return;
        if (!currentName.trim() || currentItems.length === 0) return;
        if (editingId) {
            const updated = (0, __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$lists$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["updateList"])({
                id: editingId,
                name: currentName.trim(),
                items: currentItems
            });
            if (updated) {
                setSaved((p)=>{
                    const idx = p.findIndex((x)=>x.id === updated.id);
                    if (idx < 0) return p;
                    const next = [
                        ...p
                    ];
                    next[idx] = updated;
                    return next.sort((a, b)=>b.updatedAt - a.updatedAt);
                });
            }
        } else {
            const rec = (0, __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$lists$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["saveList"])({
                agencyEmail: session.email,
                name: currentName.trim(),
                items: currentItems
            });
            setSaved((p)=>[
                    rec,
                    ...p
                ]);
            setEditingId(rec.id);
        }
    }
    function loadList(l) {
        setEditingId(l.id);
        setCurrentName(l.name);
        setCurrentItems(l.items);
    }
    function deleteListRow(id) {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$lists$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["deleteList"])(id);
        setSaved((p)=>p.filter((x)=>x.id !== id));
        if (editingId === id) resetCurrent();
    }
    const [manualName, setManualName] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].useState('');
    const [manualEmail, setManualEmail] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].useState('');
    const [manualTitle, setManualTitle] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].useState('');
    const [manualSchool, setManualSchool] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].useState('');
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Box$2f$Box$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Box$3e$__["Box"], {
        sx: {
            display: 'grid',
            gap: 2
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Typography$2f$Typography$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Typography$3e$__["Typography"], {
                variant: "h5",
                children: "Lists"
            }, void 0, false, {
                fileName: "[project]/app/(app)/lists/page.tsx",
                lineNumber: 160,
                columnNumber: 7
            }, this),
            error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Typography$2f$Typography$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Typography$3e$__["Typography"], {
                color: "error",
                children: error
            }, void 0, false, {
                fileName: "[project]/app/(app)/lists/page.tsx",
                lineNumber: 161,
                columnNumber: 17
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Box$2f$Box$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Box$3e$__["Box"], {
                sx: {
                    display: 'grid',
                    gridTemplateColumns: {
                        xs: '1fr',
                        md: '2fr 1fr'
                    },
                    gap: 3
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Box$2f$Box$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Box$3e$__["Box"], {
                        children: [
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
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$TextField$2f$TextField$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__TextField$3e$__["TextField"], {
                                        select: true,
                                        label: "Sport",
                                        value: sport,
                                        onChange: (e)=>setSport(e.target.value),
                                        SelectProps: {
                                            MenuProps: {
                                                disablePortal: true
                                            }
                                        },
                                        children: sports.map((s)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$MenuItem$2f$MenuItem$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__MenuItem$3e$__["MenuItem"], {
                                                value: s,
                                                children: s
                                            }, s, false, {
                                                fileName: "[project]/app/(app)/lists/page.tsx",
                                                lineNumber: 167,
                                                columnNumber: 32
                                            }, this))
                                    }, void 0, false, {
                                        fileName: "[project]/app/(app)/lists/page.tsx",
                                        lineNumber: 166,
                                        columnNumber: 13
                                    }, this),
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
                                                fileName: "[project]/app/(app)/lists/page.tsx",
                                                lineNumber: 170,
                                                columnNumber: 37
                                            }, this))
                                    }, void 0, false, {
                                        fileName: "[project]/app/(app)/lists/page.tsx",
                                        lineNumber: 169,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$TextField$2f$TextField$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__TextField$3e$__["TextField"], {
                                        select: true,
                                        label: "State",
                                        value: stateCode,
                                        onChange: (e)=>setStateCode(e.target.value),
                                        SelectProps: {
                                            MenuProps: {
                                                disablePortal: true
                                            }
                                        },
                                        children: states.map((s)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$MenuItem$2f$MenuItem$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__MenuItem$3e$__["MenuItem"], {
                                                value: s.code,
                                                children: s.name
                                            }, s.code, false, {
                                                fileName: "[project]/app/(app)/lists/page.tsx",
                                                lineNumber: 173,
                                                columnNumber: 32
                                            }, this))
                                    }, void 0, false, {
                                        fileName: "[project]/app/(app)/lists/page.tsx",
                                        lineNumber: 172,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/(app)/lists/page.tsx",
                                lineNumber: 165,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Typography$2f$Typography$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Typography$3e$__["Typography"], {
                                variant: "subtitle2",
                                color: "text.secondary",
                                sx: {
                                    mb: 1
                                },
                                children: "Universities"
                            }, void 0, false, {
                                fileName: "[project]/app/(app)/lists/page.tsx",
                                lineNumber: 177,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Stack$2f$Stack$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Stack$3e$__["Stack"], {
                                direction: "row",
                                spacing: 2,
                                sx: {
                                    flexWrap: 'wrap',
                                    mb: 2
                                },
                                children: schools.map((u)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Card$2f$Card$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Card$3e$__["Card"], {
                                        onClick: ()=>setSelectedSchool(u.name),
                                        sx: {
                                            width: 240,
                                            cursor: 'pointer',
                                            outline: selectedSchool === u.name ? '2px solid #1976d2' : 'none'
                                        },
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$CardContent$2f$CardContent$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__CardContent$3e$__["CardContent"], {
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Typography$2f$Typography$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Typography$3e$__["Typography"], {
                                                children: u.name
                                            }, void 0, false, {
                                                fileName: "[project]/app/(app)/lists/page.tsx",
                                                lineNumber: 181,
                                                columnNumber: 30
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/app/(app)/lists/page.tsx",
                                            lineNumber: 181,
                                            columnNumber: 17
                                        }, this)
                                    }, u.name, false, {
                                        fileName: "[project]/app/(app)/lists/page.tsx",
                                        lineNumber: 180,
                                        columnNumber: 15
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/app/(app)/lists/page.tsx",
                                lineNumber: 178,
                                columnNumber: 11
                            }, this),
                            schoolDetails && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Box$2f$Box$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Box$3e$__["Box"], {
                                sx: {
                                    mb: 2
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Typography$2f$Typography$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Typography$3e$__["Typography"], {
                                        variant: "subtitle1",
                                        sx: {
                                            mb: 1
                                        },
                                        children: schoolDetails?.schoolInfo?.School || schoolDetails?.name || selectedSchool
                                    }, void 0, false, {
                                        fileName: "[project]/app/(app)/lists/page.tsx",
                                        lineNumber: 188,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Typography$2f$Typography$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Typography$3e$__["Typography"], {
                                        variant: "body2",
                                        color: "text.secondary",
                                        sx: {
                                            mb: 1
                                        },
                                        children: [
                                            schoolDetails?.schoolInfo?.City || '—',
                                            ", ",
                                            schoolDetails?.schoolInfo?.State || '—',
                                            " — ",
                                            division
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/(app)/lists/page.tsx",
                                        lineNumber: 191,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Typography$2f$Typography$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Typography$3e$__["Typography"], {
                                        variant: "subtitle2",
                                        color: "text.secondary",
                                        sx: {
                                            mb: 1
                                        },
                                        children: "Coaches"
                                    }, void 0, false, {
                                        fileName: "[project]/app/(app)/lists/page.tsx",
                                        lineNumber: 194,
                                        columnNumber: 15
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
                                        children: (schoolDetails.coaches ?? []).map((c, idx)=>{
                                            const first = c.firstName || c.FirstName || '';
                                            const last = c.lastName || c.LastName || '';
                                            const title = c.title || c.Position || '';
                                            const email = c.email || c.Email || '';
                                            const schoolName = schoolDetails?.schoolInfo?.School || schoolDetails?.name || selectedSchool || '';
                                            const rowId = String(c.id || `${schoolName}::${email || '-'}::${first}-${last}::${title}::${idx}`);
                                            const checked = currentItems.some((x)=>x.id === rowId);
                                            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$FormControlLabel$2f$FormControlLabel$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__FormControlLabel$3e$__["FormControlLabel"], {
                                                control: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Checkbox$2f$Checkbox$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Checkbox$3e$__["Checkbox"], {
                                                    checked: checked,
                                                    onChange: (e)=>e.target.checked ? addCoach(c, rowId) : setCurrentItems((prev)=>prev.filter((x)=>x.id !== rowId))
                                                }, void 0, false, {
                                                    fileName: "[project]/app/(app)/lists/page.tsx",
                                                    lineNumber: 208,
                                                    columnNumber: 25
                                                }, void 0),
                                                label: `${first} ${last}${title ? ` — ${title}` : ''}${email ? ` (${email})` : ''}`
                                            }, rowId, false, {
                                                fileName: "[project]/app/(app)/lists/page.tsx",
                                                lineNumber: 205,
                                                columnNumber: 21
                                            }, this);
                                        })
                                    }, void 0, false, {
                                        fileName: "[project]/app/(app)/lists/page.tsx",
                                        lineNumber: 195,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/(app)/lists/page.tsx",
                                lineNumber: 187,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Divider$2f$Divider$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Divider$3e$__["Divider"], {
                                sx: {
                                    my: 2
                                }
                            }, void 0, false, {
                                fileName: "[project]/app/(app)/lists/page.tsx",
                                lineNumber: 225,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Typography$2f$Typography$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Typography$3e$__["Typography"], {
                                variant: "subtitle2",
                                color: "text.secondary",
                                sx: {
                                    mb: 1
                                },
                                children: "Add coach manually"
                            }, void 0, false, {
                                fileName: "[project]/app/(app)/lists/page.tsx",
                                lineNumber: 227,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Box$2f$Box$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Box$3e$__["Box"], {
                                sx: {
                                    display: 'grid',
                                    gridTemplateColumns: {
                                        xs: '1fr',
                                        md: '2fr 2fr 1fr 2fr auto'
                                    },
                                    gap: 1,
                                    alignItems: 'center'
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$TextField$2f$TextField$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__TextField$3e$__["TextField"], {
                                        size: "small",
                                        label: "Full name",
                                        value: manualName,
                                        onChange: (e)=>setManualName(e.target.value)
                                    }, void 0, false, {
                                        fileName: "[project]/app/(app)/lists/page.tsx",
                                        lineNumber: 229,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$TextField$2f$TextField$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__TextField$3e$__["TextField"], {
                                        size: "small",
                                        label: "Email",
                                        value: manualEmail,
                                        onChange: (e)=>setManualEmail(e.target.value)
                                    }, void 0, false, {
                                        fileName: "[project]/app/(app)/lists/page.tsx",
                                        lineNumber: 230,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$TextField$2f$TextField$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__TextField$3e$__["TextField"], {
                                        size: "small",
                                        label: "Title",
                                        value: manualTitle,
                                        onChange: (e)=>setManualTitle(e.target.value)
                                    }, void 0, false, {
                                        fileName: "[project]/app/(app)/lists/page.tsx",
                                        lineNumber: 231,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$TextField$2f$TextField$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__TextField$3e$__["TextField"], {
                                        size: "small",
                                        label: "School (optional)",
                                        value: manualSchool,
                                        onChange: (e)=>setManualSchool(e.target.value)
                                    }, void 0, false, {
                                        fileName: "[project]/app/(app)/lists/page.tsx",
                                        lineNumber: 232,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Button$2f$Button$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Button$3e$__["Button"], {
                                        size: "small",
                                        variant: "outlined",
                                        onClick: ()=>{
                                            addManualCoach({
                                                name: manualName,
                                                email: manualEmail,
                                                title: manualTitle,
                                                school: manualSchool
                                            });
                                            setManualName('');
                                            setManualEmail('');
                                            setManualTitle('');
                                            setManualSchool('');
                                        },
                                        children: "Add"
                                    }, void 0, false, {
                                        fileName: "[project]/app/(app)/lists/page.tsx",
                                        lineNumber: 233,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/(app)/lists/page.tsx",
                                lineNumber: 228,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/(app)/lists/page.tsx",
                        lineNumber: 164,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Box$2f$Box$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Box$3e$__["Box"], {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Typography$2f$Typography$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Typography$3e$__["Typography"], {
                                variant: "h6",
                                sx: {
                                    mb: 1
                                },
                                children: "Current List"
                            }, void 0, false, {
                                fileName: "[project]/app/(app)/lists/page.tsx",
                                lineNumber: 240,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$TextField$2f$TextField$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__TextField$3e$__["TextField"], {
                                fullWidth: true,
                                size: "small",
                                label: "List name",
                                value: currentName,
                                onChange: (e)=>setCurrentName(e.target.value),
                                sx: {
                                    mb: 1
                                }
                            }, void 0, false, {
                                fileName: "[project]/app/(app)/lists/page.tsx",
                                lineNumber: 241,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Paper$2f$Paper$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Paper$3e$__["Paper"], {
                                variant: "outlined",
                                sx: {
                                    p: 1,
                                    maxHeight: 360,
                                    overflow: 'auto'
                                },
                                children: currentItems.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Typography$2f$Typography$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Typography$3e$__["Typography"], {
                                    variant: "body2",
                                    color: "text.secondary",
                                    children: "No coaches added yet."
                                }, void 0, false, {
                                    fileName: "[project]/app/(app)/lists/page.tsx",
                                    lineNumber: 244,
                                    columnNumber: 15
                                }, this) : currentItems.map((c, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Box$2f$Box$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Box$3e$__["Box"], {
                                        sx: {
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            borderBottom: '1px solid #eee',
                                            py: 1
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Box$2f$Box$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Box$3e$__["Box"], {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Typography$2f$Typography$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Typography$3e$__["Typography"], {
                                                        variant: "body2",
                                                        children: [
                                                            [
                                                                c.firstName,
                                                                c.lastName
                                                            ].filter(Boolean).join(' '),
                                                            " ",
                                                            c.title ? `— ${c.title}` : ''
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/app/(app)/lists/page.tsx",
                                                        lineNumber: 249,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Typography$2f$Typography$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Typography$3e$__["Typography"], {
                                                        variant: "caption",
                                                        color: "text.secondary",
                                                        children: [
                                                            c.email,
                                                            " · ",
                                                            c.school,
                                                            " · ",
                                                            c.division,
                                                            " · ",
                                                            c.state
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/app/(app)/lists/page.tsx",
                                                        lineNumber: 250,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/(app)/lists/page.tsx",
                                                lineNumber: 248,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Button$2f$Button$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Button$3e$__["Button"], {
                                                size: "small",
                                                color: "error",
                                                onClick: ()=>removeCoach(i),
                                                children: "Remove"
                                            }, void 0, false, {
                                                fileName: "[project]/app/(app)/lists/page.tsx",
                                                lineNumber: 252,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, `${c.email}-${i}`, true, {
                                        fileName: "[project]/app/(app)/lists/page.tsx",
                                        lineNumber: 247,
                                        columnNumber: 17
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/app/(app)/lists/page.tsx",
                                lineNumber: 242,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Stack$2f$Stack$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Stack$3e$__["Stack"], {
                                direction: "row",
                                spacing: 1,
                                sx: {
                                    mt: 1
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Button$2f$Button$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Button$3e$__["Button"], {
                                        variant: "contained",
                                        onClick: saveCurrent,
                                        disabled: !currentName.trim() || currentItems.length === 0,
                                        children: editingId ? 'Update List' : 'Save List'
                                    }, void 0, false, {
                                        fileName: "[project]/app/(app)/lists/page.tsx",
                                        lineNumber: 258,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Button$2f$Button$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Button$3e$__["Button"], {
                                        variant: "text",
                                        onClick: resetCurrent,
                                        children: "New"
                                    }, void 0, false, {
                                        fileName: "[project]/app/(app)/lists/page.tsx",
                                        lineNumber: 259,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/(app)/lists/page.tsx",
                                lineNumber: 257,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Divider$2f$Divider$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Divider$3e$__["Divider"], {
                                sx: {
                                    my: 2
                                }
                            }, void 0, false, {
                                fileName: "[project]/app/(app)/lists/page.tsx",
                                lineNumber: 262,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Typography$2f$Typography$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Typography$3e$__["Typography"], {
                                variant: "h6",
                                sx: {
                                    mb: 1
                                },
                                children: "Saved Lists"
                            }, void 0, false, {
                                fileName: "[project]/app/(app)/lists/page.tsx",
                                lineNumber: 264,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Paper$2f$Paper$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Paper$3e$__["Paper"], {
                                variant: "outlined",
                                sx: {
                                    p: 1,
                                    maxHeight: 320,
                                    overflow: 'auto'
                                },
                                children: saved.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Typography$2f$Typography$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Typography$3e$__["Typography"], {
                                    variant: "body2",
                                    color: "text.secondary",
                                    children: "No saved lists."
                                }, void 0, false, {
                                    fileName: "[project]/app/(app)/lists/page.tsx",
                                    lineNumber: 267,
                                    columnNumber: 15
                                }, this) : saved.map((l)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Box$2f$Box$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Box$3e$__["Box"], {
                                        sx: {
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            borderBottom: '1px solid #eee',
                                            py: 1
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Box$2f$Box$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Box$3e$__["Box"], {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Typography$2f$Typography$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Typography$3e$__["Typography"], {
                                                        variant: "body2",
                                                        children: l.name
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/(app)/lists/page.tsx",
                                                        lineNumber: 272,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Typography$2f$Typography$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Typography$3e$__["Typography"], {
                                                        variant: "caption",
                                                        color: "text.secondary",
                                                        children: [
                                                            l.items.length,
                                                            " coaches · ",
                                                            new Date(l.updatedAt).toLocaleString()
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/app/(app)/lists/page.tsx",
                                                        lineNumber: 273,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/(app)/lists/page.tsx",
                                                lineNumber: 271,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Box$2f$Box$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Box$3e$__["Box"], {
                                                sx: {
                                                    display: 'flex',
                                                    gap: 1
                                                },
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Button$2f$Button$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Button$3e$__["Button"], {
                                                        size: "small",
                                                        variant: "outlined",
                                                        onClick: ()=>loadList(l),
                                                        children: "Edit"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/(app)/lists/page.tsx",
                                                        lineNumber: 276,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Button$2f$Button$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Button$3e$__["Button"], {
                                                        size: "small",
                                                        color: "error",
                                                        onClick: ()=>deleteListRow(l.id),
                                                        children: "Delete"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/(app)/lists/page.tsx",
                                                        lineNumber: 277,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/(app)/lists/page.tsx",
                                                lineNumber: 275,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, l.id, true, {
                                        fileName: "[project]/app/(app)/lists/page.tsx",
                                        lineNumber: 270,
                                        columnNumber: 17
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/app/(app)/lists/page.tsx",
                                lineNumber: 265,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/(app)/lists/page.tsx",
                        lineNumber: 239,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/(app)/lists/page.tsx",
                lineNumber: 163,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/(app)/lists/page.tsx",
        lineNumber: 159,
        columnNumber: 5
    }, this);
}
}),
];

//# sourceMappingURL=_122b55fe._.js.map