module.exports = [
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
const API_BASE_URL = ("TURBOPACK compile-time value", "https://iakaowunc5.execute-api.us-west-1.amazonaws.com") || process.env.API_BASE_URL;
function requireApiBase() {
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    return API_BASE_URL;
}
async function apiFetch(path, init) {
    const base = requireApiBase();
    if (typeof fetch === 'undefined') {
        throw new Error('fetch is not available');
    }
    const headers = {
        'Content-Type': 'application/json',
        ...init?.headers
    };
    const res = await fetch(`${base}${path}`, {
        ...init,
        headers
    });
    if (!res.ok) {
        const text = await res.text();
        throw new Error(`API ${path} failed: ${res.status} ${text}`);
    }
    return res.json();
}
async function listClientsByAgencyEmail(agencyEmail) {
    const data = await apiFetch('/clients');
    return data?.clients ?? [];
}
async function listClientsByAgency(agencyId) {
    const agency = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$agencies$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getAgencyById"])(agencyId);
    if (!agency) return [];
    return listClientsByAgencyEmail(agency.email);
}
async function upsertClient(input) {
    const data = await apiFetch('/clients', {
        method: 'POST',
        body: JSON.stringify(input)
    });
    return data?.client;
}
async function getClient(id) {
    const data = await apiFetch(`/clients/${id}`);
    return data?.client ?? null;
}
async function deleteClient(id) {
    await apiFetch(`/clients/${id}`, {
        method: 'DELETE'
    });
    return {
        ok: true
    };
}
async function getClients() {
    const data = await apiFetch('/clients');
    return data?.clients ?? [];
}
function setClientGmailTokens(clientId, tokens) {
// No-op; tokens are stored server-side via API.
}
function getClientGmailTokens(clientId) {
    // No-op on client; tokens handled server-side.
    return null;
}
}),
"[project]/services/mailStatus.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// Mail status now tracked server-side; frontend no-ops to avoid local storage.
__turbopack_context__.s([
    "getMailEntries",
    ()=>getMailEntries,
    "hasMailed",
    ()=>hasMailed,
    "markMailed",
    ()=>markMailed
]);
function hasMailed(_, __) {
    return false;
}
function markMailed(_, __) {}
function getMailEntries() {
    return [];
}
}),
"[project]/services/scholarships.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getScholarships",
    ()=>getScholarships,
    "setScholarships",
    ()=>setScholarships
]);
const KEY = 'dashboard_scholarships_v1';
function getScholarships(agencyEmail) {
    if ("TURBOPACK compile-time truthy", 1) return 0;
    //TURBOPACK unreachable
    ;
}
function setScholarships(agencyEmail, n) {
    if ("TURBOPACK compile-time truthy", 1) return;
    //TURBOPACK unreachable
    ;
}
}),
"[project]/app/(app)/dashboard/MetricCard.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "MetricCard",
    ()=>MetricCard
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Box$2f$Box$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Box$3e$__ = __turbopack_context__.i("[project]/node_modules/@mui/material/esm/Box/Box.js [app-ssr] (ecmascript) <export default as Box>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Card$2f$Card$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Card$3e$__ = __turbopack_context__.i("[project]/node_modules/@mui/material/esm/Card/Card.js [app-ssr] (ecmascript) <export default as Card>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$CardContent$2f$CardContent$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__CardContent$3e$__ = __turbopack_context__.i("[project]/node_modules/@mui/material/esm/CardContent/CardContent.js [app-ssr] (ecmascript) <export default as CardContent>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Typography$2f$Typography$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Typography$3e$__ = __turbopack_context__.i("[project]/node_modules/@mui/material/esm/Typography/Typography.js [app-ssr] (ecmascript) <export default as Typography>");
'use client';
;
;
function toRgba(hex, alpha) {
    const normalized = hex.replace('#', '');
    if (normalized.length !== 6) return `rgba(0,0,0,${alpha})`;
    const r = parseInt(normalized.slice(0, 2), 16);
    const g = parseInt(normalized.slice(2, 4), 16);
    const b = parseInt(normalized.slice(4, 6), 16);
    return `rgba(${r},${g},${b},${alpha})`;
}
function MetricCard({ title, value, icon, footer, bgColor, textColor, bgImage, overlayOpacity = 0.82 }) {
    const blendedBackground = bgImage ? `linear-gradient(${toRgba(bgColor || '#000000', overlayOpacity)}, ${toRgba(bgColor || '#000000', overlayOpacity)}), url(${bgImage})` : undefined;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Card$2f$Card$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Card$3e$__["Card"], {
        sx: {
            borderRadius: '20px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            border: `1px solid ${bgColor || '#dcdfe4'}`,
            backgroundColor: bgColor,
            backgroundImage: blendedBackground,
            backgroundSize: blendedBackground ? 'cover' : undefined,
            backgroundPosition: blendedBackground ? 'center' : undefined,
            backgroundRepeat: blendedBackground ? 'no-repeat' : undefined,
            color: textColor
        },
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$CardContent$2f$CardContent$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__CardContent$3e$__["CardContent"], {
            sx: {
                p: 0
            },
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Box$2f$Box$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Box$3e$__["Box"], {
                    sx: {
                        px: 2,
                        pt: 1,
                        pb: 0.6,
                        borderBottom: footer ? '1px solid #dcdfe4' : 'none'
                    },
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Box$2f$Box$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Box$3e$__["Box"], {
                        sx: {
                            display: 'grid',
                            gridTemplateColumns: icon ? 'auto 1fr' : '1fr',
                            gridTemplateRows: 'auto auto',
                            columnGap: icon ? 1.5 : 0,
                            rowGap: 0.75,
                            alignItems: 'start'
                        },
                        children: [
                            icon ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Box$2f$Box$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Box$3e$__["Box"], {
                                sx: {
                                    width: 40,
                                    height: 40,
                                    borderRadius: '50%',
                                    bgcolor: textColor ? `${textColor}1a` : '#FFFFFF',
                                    color: textColor || '#000000',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    boxShadow: '0 4px 10px rgba(0,0,0,0.12)',
                                    gridRow: '1 / span 2'
                                },
                                children: icon
                            }, void 0, false, {
                                fileName: "[project]/app/(app)/dashboard/MetricCard.tsx",
                                lineNumber: 77,
                                columnNumber: 15
                            }, this) : null,
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Typography$2f$Typography$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Typography$3e$__["Typography"], {
                                variant: "subtitle2",
                                color: textColor ? undefined : 'text.secondary',
                                sx: {
                                    fontSize: '0.95rem',
                                    color: textColor
                                },
                                children: title
                            }, void 0, false, {
                                fileName: "[project]/app/(app)/dashboard/MetricCard.tsx",
                                lineNumber: 94,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Typography$2f$Typography$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Typography$3e$__["Typography"], {
                                variant: "h3",
                                sx: {
                                    fontSize: '2.1rem',
                                    lineHeight: 1.05,
                                    color: textColor
                                },
                                children: value
                            }, void 0, false, {
                                fileName: "[project]/app/(app)/dashboard/MetricCard.tsx",
                                lineNumber: 101,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/(app)/dashboard/MetricCard.tsx",
                        lineNumber: 66,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/app/(app)/dashboard/MetricCard.tsx",
                    lineNumber: 58,
                    columnNumber: 9
                }, this),
                footer ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Box$2f$Box$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Box$3e$__["Box"], {
                    sx: {
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        mt: 1,
                        px: 2,
                        pb: 0.35,
                        color: '#667085'
                    },
                    children: footer
                }, void 0, false, {
                    fileName: "[project]/app/(app)/dashboard/MetricCard.tsx",
                    lineNumber: 110,
                    columnNumber: 11
                }, this) : null
            ]
        }, void 0, true, {
            fileName: "[project]/app/(app)/dashboard/MetricCard.tsx",
            lineNumber: 57,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/app/(app)/dashboard/MetricCard.tsx",
        lineNumber: 44,
        columnNumber: 5
    }, this);
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
"[project]/features/recruiter/RecruitingCalendarCard.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "RecruitingCalendarCard",
    ()=>RecruitingCalendarCard
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Box$2f$Box$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Box$3e$__ = __turbopack_context__.i("[project]/node_modules/@mui/material/esm/Box/Box.js [app-ssr] (ecmascript) <export default as Box>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Paper$2f$Paper$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Paper$3e$__ = __turbopack_context__.i("[project]/node_modules/@mui/material/esm/Paper/Paper.js [app-ssr] (ecmascript) <export default as Paper>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Typography$2f$Typography$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Typography$3e$__ = __turbopack_context__.i("[project]/node_modules/@mui/material/esm/Typography/Typography.js [app-ssr] (ecmascript) <export default as Typography>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Stack$2f$Stack$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Stack$3e$__ = __turbopack_context__.i("[project]/node_modules/@mui/material/esm/Stack/Stack.js [app-ssr] (ecmascript) <export default as Stack>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Chip$2f$Chip$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Chip$3e$__ = __turbopack_context__.i("[project]/node_modules/@mui/material/esm/Chip/Chip.js [app-ssr] (ecmascript) <export default as Chip>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Select$2f$Select$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Select$3e$__ = __turbopack_context__.i("[project]/node_modules/@mui/material/esm/Select/Select.js [app-ssr] (ecmascript) <export default as Select>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$MenuItem$2f$MenuItem$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__MenuItem$3e$__ = __turbopack_context__.i("[project]/node_modules/@mui/material/esm/MenuItem/MenuItem.js [app-ssr] (ecmascript) <export default as MenuItem>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@tanstack/react-query/build/modern/useQuery.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$features$2f$recruiter$2f$divisionMapping$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/features/recruiter/divisionMapping.ts [app-ssr] (ecmascript)");
'use client';
;
;
;
;
;
const typeColor = {
    dead: '#f04438',
    contact: '#15b79f',
    quiet: '#5D4AFB',
    eval: '#5D4AFB',
    test: '#5D4AFB',
    other: '#999DAA'
};
function useRecruitingPeriods(sport) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useQuery"])({
        queryKey: [
            'recruiting-periods',
            sport
        ],
        queryFn: async ()=>{
            const res = await fetch(`/api/recruiting-periods?sport=${encodeURIComponent(sport || 'Football')}`);
            if (!res.ok) throw new Error('Failed to load periods');
            const data = await res.json();
            return data?.data || [];
        }
    });
}
function formatRange(start, end) {
    const s = new Date(start).toLocaleDateString();
    const e = new Date(end).toLocaleDateString();
    return s === e ? s : `${s} – ${e}`;
}
function getWeekDays(from) {
    return Array.from({
        length: 7
    }).map((_, i)=>{
        const d = new Date(from);
        d.setDate(from.getDate() + i);
        d.setHours(0, 0, 0, 0);
        return d;
    });
}
function findDayPeriods(day, periods) {
    return periods.filter((p)=>{
        const start = new Date(p.startDate);
        const end = new Date(p.endDate);
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        return day >= start && day <= end;
    });
}
function shortDate(day) {
    return day.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric'
    });
}
function RecruitingCalendarCard() {
    const sports = (0, __TURBOPACK__imported__module__$5b$project$5d2f$features$2f$recruiter$2f$divisionMapping$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getSports"])();
    const [sport, setSport] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].useState(sports[0] || 'Football');
    const { data = [], isLoading } = useRecruitingPeriods(sport);
    const today = new Date();
    const weekDays = getWeekDays(today);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Paper$2f$Paper$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Paper$3e$__["Paper"], {
        variant: "outlined",
        sx: {
            p: 2,
            mb: 3,
            borderRadius: '16px'
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Stack$2f$Stack$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Stack$3e$__["Stack"], {
                direction: {
                    xs: 'column',
                    md: 'row'
                },
                alignItems: "center",
                justifyContent: "space-between",
                spacing: 2,
                sx: {
                    mb: 2
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Typography$2f$Typography$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Typography$3e$__["Typography"], {
                        variant: "h6",
                        children: "Recruiting Calendar"
                    }, void 0, false, {
                        fileName: "[project]/features/recruiter/RecruitingCalendarCard.tsx",
                        lineNumber: 76,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Select$2f$Select$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Select$3e$__["Select"], {
                        size: "small",
                        value: sport,
                        onChange: (e)=>setSport(e.target.value),
                        "data-testid": "recruiting-calendar-sport",
                        children: sports.map((s)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$MenuItem$2f$MenuItem$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__MenuItem$3e$__["MenuItem"], {
                                value: s,
                                children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$features$2f$recruiter$2f$divisionMapping$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["formatSportLabel"])(s)
                            }, s, false, {
                                fileName: "[project]/features/recruiter/RecruitingCalendarCard.tsx",
                                lineNumber: 84,
                                columnNumber: 13
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/features/recruiter/RecruitingCalendarCard.tsx",
                        lineNumber: 77,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/features/recruiter/RecruitingCalendarCard.tsx",
                lineNumber: 75,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Stack$2f$Stack$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Stack$3e$__["Stack"], {
                direction: "row",
                spacing: 1,
                sx: {
                    mb: 2,
                    flexWrap: 'wrap'
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Chip$2f$Chip$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Chip$3e$__["Chip"], {
                        size: "small",
                        label: "Dead",
                        sx: {
                            bgcolor: typeColor.dead,
                            color: '#fff'
                        }
                    }, void 0, false, {
                        fileName: "[project]/features/recruiter/RecruitingCalendarCard.tsx",
                        lineNumber: 90,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Chip$2f$Chip$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Chip$3e$__["Chip"], {
                        size: "small",
                        label: "Contact",
                        sx: {
                            bgcolor: typeColor.contact,
                            color: '#fff'
                        }
                    }, void 0, false, {
                        fileName: "[project]/features/recruiter/RecruitingCalendarCard.tsx",
                        lineNumber: 91,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Chip$2f$Chip$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Chip$3e$__["Chip"], {
                        size: "small",
                        label: "Quiet",
                        sx: {
                            bgcolor: typeColor.quiet,
                            color: '#fff'
                        }
                    }, void 0, false, {
                        fileName: "[project]/features/recruiter/RecruitingCalendarCard.tsx",
                        lineNumber: 92,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Chip$2f$Chip$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Chip$3e$__["Chip"], {
                        size: "small",
                        label: "Other/Test",
                        sx: {
                            bgcolor: typeColor.test,
                            color: '#fff'
                        }
                    }, void 0, false, {
                        fileName: "[project]/features/recruiter/RecruitingCalendarCard.tsx",
                        lineNumber: 93,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Chip$2f$Chip$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Chip$3e$__["Chip"], {
                        size: "small",
                        label: "Today",
                        sx: {
                            bgcolor: '#fff',
                            color: '#14151E',
                            border: '1px solid #dcdfe4'
                        }
                    }, void 0, false, {
                        fileName: "[project]/features/recruiter/RecruitingCalendarCard.tsx",
                        lineNumber: 94,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/features/recruiter/RecruitingCalendarCard.tsx",
                lineNumber: 89,
                columnNumber: 7
            }, this),
            isLoading ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Typography$2f$Typography$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Typography$3e$__["Typography"], {
                color: "text.secondary",
                children: "Loading periods…"
            }, void 0, false, {
                fileName: "[project]/features/recruiter/RecruitingCalendarCard.tsx",
                lineNumber: 98,
                columnNumber: 9
            }, this) : data.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Typography$2f$Typography$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Typography$3e$__["Typography"], {
                color: "text.secondary",
                children: "No periods available."
            }, void 0, false, {
                fileName: "[project]/features/recruiter/RecruitingCalendarCard.tsx",
                lineNumber: 100,
                columnNumber: 9
            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Box$2f$Box$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Box$3e$__["Box"], {
                sx: {
                    display: 'grid',
                    gridTemplateColumns: 'repeat(7, minmax(110px, 1fr))',
                    gap: 1
                },
                children: weekDays.map((day)=>{
                    const dayPeriods = findDayPeriods(day, data);
                    const color = dayPeriods[0] ? typeColor[dayPeriods[0].type] || typeColor.other : '#dcdfe4';
                    const isToday = day.toDateString() === today.toDateString();
                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Paper$2f$Paper$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Paper$3e$__["Paper"], {
                        "data-testid": "calendar-day",
                        variant: "outlined",
                        sx: {
                            position: 'relative',
                            p: 1.25,
                            borderRadius: '12px',
                            minHeight: 90,
                            bgcolor: isToday ? '#fff' : dayPeriods[0] ? `${color}1a` : '#fff',
                            border: `1px solid ${isToday ? '#dcdfe4' : dayPeriods[0] ? color : '#dcdfe4'}`
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Stack$2f$Stack$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Stack$3e$__["Stack"], {
                                direction: "row",
                                justifyContent: "space-between",
                                alignItems: "flex-start",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Typography$2f$Typography$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Typography$3e$__["Typography"], {
                                        variant: "subtitle2",
                                        children: shortDate(day)
                                    }, void 0, false, {
                                        fileName: "[project]/features/recruiter/RecruitingCalendarCard.tsx",
                                        lineNumber: 122,
                                        columnNumber: 19
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Stack$2f$Stack$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Stack$3e$__["Stack"], {
                                        direction: "row",
                                        spacing: 0.5,
                                        justifyContent: "flex-end",
                                        sx: {
                                            flexWrap: 'wrap',
                                            maxWidth: '70%'
                                        },
                                        children: [
                                            dayPeriods.slice(0, 2).map((p)=>{
                                                const c = typeColor[p.type] || typeColor.other;
                                                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Chip$2f$Chip$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Chip$3e$__["Chip"], {
                                                    size: "small",
                                                    label: p.label,
                                                    sx: {
                                                        bgcolor: c,
                                                        color: '#fff'
                                                    },
                                                    "data-testid": "calendar-period-chip"
                                                }, p.id, false, {
                                                    fileName: "[project]/features/recruiter/RecruitingCalendarCard.tsx",
                                                    lineNumber: 127,
                                                    columnNumber: 25
                                                }, this);
                                            }),
                                            dayPeriods.length > 2 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Chip$2f$Chip$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Chip$3e$__["Chip"], {
                                                size: "small",
                                                label: `+${dayPeriods.length - 2}`,
                                                sx: {
                                                    bgcolor: '#999DAA',
                                                    color: '#fff'
                                                }
                                            }, void 0, false, {
                                                fileName: "[project]/features/recruiter/RecruitingCalendarCard.tsx",
                                                lineNumber: 137,
                                                columnNumber: 23
                                            }, this) : null
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/features/recruiter/RecruitingCalendarCard.tsx",
                                        lineNumber: 123,
                                        columnNumber: 19
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/features/recruiter/RecruitingCalendarCard.tsx",
                                lineNumber: 121,
                                columnNumber: 17
                            }, this),
                            dayPeriods.length > 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Typography$2f$Typography$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Typography$3e$__["Typography"], {
                                variant: "caption",
                                color: "text.secondary",
                                children: formatRange(dayPeriods[0].startDate, dayPeriods[0].endDate)
                            }, void 0, false, {
                                fileName: "[project]/features/recruiter/RecruitingCalendarCard.tsx",
                                lineNumber: 142,
                                columnNumber: 19
                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Typography$2f$Typography$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Typography$3e$__["Typography"], {
                                variant: "caption",
                                color: "text.secondary",
                                children: "No period"
                            }, void 0, false, {
                                fileName: "[project]/features/recruiter/RecruitingCalendarCard.tsx",
                                lineNumber: 146,
                                columnNumber: 19
                            }, this)
                        ]
                    }, day.toISOString(), true, {
                        fileName: "[project]/features/recruiter/RecruitingCalendarCard.tsx",
                        lineNumber: 108,
                        columnNumber: 15
                    }, this);
                })
            }, void 0, false, {
                fileName: "[project]/features/recruiter/RecruitingCalendarCard.tsx",
                lineNumber: 102,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/features/recruiter/RecruitingCalendarCard.tsx",
        lineNumber: 74,
        columnNumber: 5
    }, this);
}
}),
"[project]/services/commits.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
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
        const { scrapeFootballTop } = await __turbopack_context__.A("[project]/services/commitsScraper.ts [app-ssr] (ecmascript, async loader)");
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
        const { scrapeBasketballTop } = await __turbopack_context__.A("[project]/services/commitsScraper.ts [app-ssr] (ecmascript, async loader)");
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
"[project]/features/commits/CommitsTable.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "CommitsTable",
    ()=>CommitsTable
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Paper$2f$Paper$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Paper$3e$__ = __turbopack_context__.i("[project]/node_modules/@mui/material/esm/Paper/Paper.js [app-ssr] (ecmascript) <export default as Paper>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Table$2f$Table$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Table$3e$__ = __turbopack_context__.i("[project]/node_modules/@mui/material/esm/Table/Table.js [app-ssr] (ecmascript) <export default as Table>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$TableHead$2f$TableHead$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__TableHead$3e$__ = __turbopack_context__.i("[project]/node_modules/@mui/material/esm/TableHead/TableHead.js [app-ssr] (ecmascript) <export default as TableHead>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$TableRow$2f$TableRow$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__TableRow$3e$__ = __turbopack_context__.i("[project]/node_modules/@mui/material/esm/TableRow/TableRow.js [app-ssr] (ecmascript) <export default as TableRow>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$TableCell$2f$TableCell$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__TableCell$3e$__ = __turbopack_context__.i("[project]/node_modules/@mui/material/esm/TableCell/TableCell.js [app-ssr] (ecmascript) <export default as TableCell>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$TableBody$2f$TableBody$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__TableBody$3e$__ = __turbopack_context__.i("[project]/node_modules/@mui/material/esm/TableBody/TableBody.js [app-ssr] (ecmascript) <export default as TableBody>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$TextField$2f$TextField$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__TextField$3e$__ = __turbopack_context__.i("[project]/node_modules/@mui/material/esm/TextField/TextField.js [app-ssr] (ecmascript) <export default as TextField>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Stack$2f$Stack$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Stack$3e$__ = __turbopack_context__.i("[project]/node_modules/@mui/material/esm/Stack/Stack.js [app-ssr] (ecmascript) <export default as Stack>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Typography$2f$Typography$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Typography$3e$__ = __turbopack_context__.i("[project]/node_modules/@mui/material/esm/Typography/Typography.js [app-ssr] (ecmascript) <export default as Typography>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Box$2f$Box$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Box$3e$__ = __turbopack_context__.i("[project]/node_modules/@mui/material/esm/Box/Box.js [app-ssr] (ecmascript) <export default as Box>");
var __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$commits$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/services/commits.ts [app-ssr] (ecmascript)");
'use client';
;
;
;
;
function CommitsTable({ title, rows, showRank, dataTestId }) {
    const [position, setPosition] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].useState('');
    const [university, setUniversity] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].useState('');
    const filtered = (0, __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$commits$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["filterCommits"])(rows, {
        position,
        university
    });
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Paper$2f$Paper$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Paper$3e$__["Paper"], {
        variant: "outlined",
        sx: {
            p: 2,
            borderRadius: 2
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Stack$2f$Stack$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Stack$3e$__["Stack"], {
                direction: "row",
                justifyContent: "space-between",
                alignItems: "center",
                sx: {
                    mb: 2
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Typography$2f$Typography$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Typography$3e$__["Typography"], {
                        variant: "h6",
                        children: title
                    }, void 0, false, {
                        fileName: "[project]/features/commits/CommitsTable.tsx",
                        lineNumber: 25,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Stack$2f$Stack$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Stack$3e$__["Stack"], {
                        direction: "row",
                        spacing: 1,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$TextField$2f$TextField$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__TextField$3e$__["TextField"], {
                                size: "small",
                                label: "Position",
                                value: position,
                                onChange: (e)=>setPosition(e.target.value),
                                "data-testid": `${dataTestId}-filter-position`
                            }, void 0, false, {
                                fileName: "[project]/features/commits/CommitsTable.tsx",
                                lineNumber: 27,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$TextField$2f$TextField$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__TextField$3e$__["TextField"], {
                                size: "small",
                                label: "University",
                                value: university,
                                onChange: (e)=>setUniversity(e.target.value),
                                "data-testid": `${dataTestId}-filter-university`
                            }, void 0, false, {
                                fileName: "[project]/features/commits/CommitsTable.tsx",
                                lineNumber: 34,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/features/commits/CommitsTable.tsx",
                        lineNumber: 26,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/features/commits/CommitsTable.tsx",
                lineNumber: 24,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Box$2f$Box$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Box$3e$__["Box"], {
                sx: {
                    maxHeight: 420,
                    overflow: 'auto'
                },
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Table$2f$Table$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Table$3e$__["Table"], {
                    size: "small",
                    stickyHeader: true,
                    "data-testid": dataTestId,
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$TableHead$2f$TableHead$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__TableHead$3e$__["TableHead"], {
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$TableRow$2f$TableRow$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__TableRow$3e$__["TableRow"], {
                                children: [
                                    showRank && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$TableCell$2f$TableCell$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__TableCell$3e$__["TableCell"], {
                                        children: "Rank"
                                    }, void 0, false, {
                                        fileName: "[project]/features/commits/CommitsTable.tsx",
                                        lineNumber: 47,
                                        columnNumber: 28
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$TableCell$2f$TableCell$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__TableCell$3e$__["TableCell"], {
                                        children: "Name"
                                    }, void 0, false, {
                                        fileName: "[project]/features/commits/CommitsTable.tsx",
                                        lineNumber: 48,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$TableCell$2f$TableCell$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__TableCell$3e$__["TableCell"], {
                                        children: "Position"
                                    }, void 0, false, {
                                        fileName: "[project]/features/commits/CommitsTable.tsx",
                                        lineNumber: 49,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$TableCell$2f$TableCell$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__TableCell$3e$__["TableCell"], {
                                        children: "University"
                                    }, void 0, false, {
                                        fileName: "[project]/features/commits/CommitsTable.tsx",
                                        lineNumber: 50,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$TableCell$2f$TableCell$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__TableCell$3e$__["TableCell"], {
                                        children: "Logo"
                                    }, void 0, false, {
                                        fileName: "[project]/features/commits/CommitsTable.tsx",
                                        lineNumber: 51,
                                        columnNumber: 15
                                    }, this),
                                    !showRank && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$TableCell$2f$TableCell$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__TableCell$3e$__["TableCell"], {
                                        children: "Commit Date"
                                    }, void 0, false, {
                                        fileName: "[project]/features/commits/CommitsTable.tsx",
                                        lineNumber: 52,
                                        columnNumber: 29
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$TableCell$2f$TableCell$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__TableCell$3e$__["TableCell"], {
                                        children: "Source"
                                    }, void 0, false, {
                                        fileName: "[project]/features/commits/CommitsTable.tsx",
                                        lineNumber: 53,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/features/commits/CommitsTable.tsx",
                                lineNumber: 46,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/features/commits/CommitsTable.tsx",
                            lineNumber: 45,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$TableBody$2f$TableBody$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__TableBody$3e$__["TableBody"], {
                            children: [
                                filtered.map((c)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$TableRow$2f$TableRow$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__TableRow$3e$__["TableRow"], {
                                        children: [
                                            showRank && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$TableCell$2f$TableCell$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__TableCell$3e$__["TableCell"], {
                                                children: c.rank ?? '-'
                                            }, void 0, false, {
                                                fileName: "[project]/features/commits/CommitsTable.tsx",
                                                lineNumber: 59,
                                                columnNumber: 30
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$TableCell$2f$TableCell$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__TableCell$3e$__["TableCell"], {
                                                children: c.name
                                            }, void 0, false, {
                                                fileName: "[project]/features/commits/CommitsTable.tsx",
                                                lineNumber: 60,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$TableCell$2f$TableCell$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__TableCell$3e$__["TableCell"], {
                                                children: c.position || '-'
                                            }, void 0, false, {
                                                fileName: "[project]/features/commits/CommitsTable.tsx",
                                                lineNumber: 61,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$TableCell$2f$TableCell$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__TableCell$3e$__["TableCell"], {
                                                children: c.university || '-'
                                            }, void 0, false, {
                                                fileName: "[project]/features/commits/CommitsTable.tsx",
                                                lineNumber: 62,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$TableCell$2f$TableCell$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__TableCell$3e$__["TableCell"], {
                                                children: c.logo ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Box$2f$Box$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Box$3e$__["Box"], {
                                                    component: "img",
                                                    src: c.logo,
                                                    alt: c.university || 'logo',
                                                    sx: {
                                                        width: 28,
                                                        height: 28,
                                                        objectFit: 'contain'
                                                    }
                                                }, void 0, false, {
                                                    fileName: "[project]/features/commits/CommitsTable.tsx",
                                                    lineNumber: 65,
                                                    columnNumber: 21
                                                }, this) : '-'
                                            }, void 0, false, {
                                                fileName: "[project]/features/commits/CommitsTable.tsx",
                                                lineNumber: 63,
                                                columnNumber: 17
                                            }, this),
                                            !showRank && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$TableCell$2f$TableCell$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__TableCell$3e$__["TableCell"], {
                                                children: c.commitDate || '-'
                                            }, void 0, false, {
                                                fileName: "[project]/features/commits/CommitsTable.tsx",
                                                lineNumber: 70,
                                                columnNumber: 31
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$TableCell$2f$TableCell$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__TableCell$3e$__["TableCell"], {
                                                children: c.source || '-'
                                            }, void 0, false, {
                                                fileName: "[project]/features/commits/CommitsTable.tsx",
                                                lineNumber: 71,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, c.id, true, {
                                        fileName: "[project]/features/commits/CommitsTable.tsx",
                                        lineNumber: 58,
                                        columnNumber: 15
                                    }, this)),
                                filtered.length === 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$TableRow$2f$TableRow$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__TableRow$3e$__["TableRow"], {
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$TableCell$2f$TableCell$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__TableCell$3e$__["TableCell"], {
                                        colSpan: showRank ? 5 : 5,
                                        align: "center",
                                        children: "No commits match the filters."
                                    }, void 0, false, {
                                        fileName: "[project]/features/commits/CommitsTable.tsx",
                                        lineNumber: 76,
                                        columnNumber: 17
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/features/commits/CommitsTable.tsx",
                                    lineNumber: 75,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/features/commits/CommitsTable.tsx",
                            lineNumber: 56,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/features/commits/CommitsTable.tsx",
                    lineNumber: 44,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/features/commits/CommitsTable.tsx",
                lineNumber: 43,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/features/commits/CommitsTable.tsx",
        lineNumber: 23,
        columnNumber: 5
    }, this);
}
}),
"[project]/features/commits/CommitsSection.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "CommitsSection",
    ()=>CommitsSection
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Stack$2f$Stack$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Stack$3e$__ = __turbopack_context__.i("[project]/node_modules/@mui/material/esm/Stack/Stack.js [app-ssr] (ecmascript) <export default as Stack>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Typography$2f$Typography$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Typography$3e$__ = __turbopack_context__.i("[project]/node_modules/@mui/material/esm/Typography/Typography.js [app-ssr] (ecmascript) <export default as Typography>");
var __TURBOPACK__imported__module__$5b$project$5d2f$features$2f$commits$2f$CommitsTable$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/features/commits/CommitsTable.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$commits$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/services/commits.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@tanstack/react-query/build/modern/useQuery.js [app-ssr] (ecmascript)");
'use client';
;
;
;
;
;
;
async function fetchCommits(sport, list) {
    const res = await fetch(`/api/commits?sport=${sport}&list=${list}`);
    if (!res.ok) throw new Error('Failed to load commits');
    const data = await res.json();
    return data?.data || [];
}
function CommitsSection({ sport }) {
    const initialRecent = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].useMemo(()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$commits$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["listCommits"])(sport, 'recent'), [
        sport
    ]);
    const initialTop = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].useMemo(()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$commits$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["listCommits"])(sport, 'top'), [
        sport
    ]);
    const baseQueryOpts = {
        staleTime: 24 * 60 * 60 * 1000,
        gcTime: 25 * 60 * 60 * 1000,
        refetchOnWindowFocus: false,
        refetchOnMount: 'always'
    };
    const recentQ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useQuery"])({
        queryKey: [
            'commits',
            sport,
            'recent'
        ],
        queryFn: ()=>fetchCommits(sport, 'recent'),
        initialData: initialRecent,
        placeholderData: initialRecent,
        ...baseQueryOpts
    });
    const topQ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useQuery"])({
        queryKey: [
            'commits',
            sport,
            'top'
        ],
        queryFn: ()=>fetchCommits(sport, 'top'),
        initialData: initialTop,
        placeholderData: initialTop,
        ...baseQueryOpts
    });
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Stack$2f$Stack$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Stack$3e$__["Stack"], {
        spacing: 2,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Typography$2f$Typography$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Typography$3e$__["Typography"], {
                variant: "h5",
                children: [
                    sport,
                    " Commits"
                ]
            }, void 0, true, {
                fileName: "[project]/features/commits/CommitsSection.tsx",
                lineNumber: 43,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$features$2f$commits$2f$CommitsTable$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CommitsTable"], {
                title: "Recent Commits (last 365 days)",
                rows: recentQ.data || [],
                showRank: false,
                dataTestId: `commits-${sport.toLowerCase()}-recent-table`
            }, void 0, false, {
                fileName: "[project]/features/commits/CommitsSection.tsx",
                lineNumber: 44,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$features$2f$commits$2f$CommitsTable$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CommitsTable"], {
                title: "Top 50 Recruits",
                rows: topQ.data || [],
                showRank: true,
                dataTestId: `commits-${sport.toLowerCase()}-top-table`
            }, void 0, false, {
                fileName: "[project]/features/commits/CommitsSection.tsx",
                lineNumber: 50,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/features/commits/CommitsSection.tsx",
        lineNumber: 42,
        columnNumber: 5
    }, this);
}
}),
"[project]/app/(app)/dashboard/metrics.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "computeEmailMetrics",
    ()=>computeEmailMetrics,
    "computeOpenRateMetrics",
    ()=>computeOpenRateMetrics,
    "countAddedThisMonth",
    ()=>countAddedThisMonth,
    "formatDelta",
    ()=>formatDelta
]);
function sliceWindow(days, windowSize) {
    const window = Math.max(1, windowSize);
    const current = days.slice(-window);
    const previous = days.slice(-window * 2, -window);
    return {
        current,
        previous
    };
}
function sumDays(days, key) {
    return days.reduce((acc, day)=>acc + (Number(day?.[key]) || 0), 0);
}
function percentDelta(current, previous) {
    if (previous > 0) return (current - previous) / previous * 100;
    return current > 0 ? 100 : 0;
}
function computeEmailMetrics(stats, fallbackCount, windowDays = 30) {
    const days = stats?.days ?? [];
    const { current, previous } = sliceWindow(days, windowDays);
    const currentSends = sumDays(current, 'sends');
    const previousSends = sumDays(previous, 'sends');
    const emailsSent = currentSends || stats?.totals?.sends || fallbackCount || 0;
    const deltaPct = percentDelta(currentSends, previousSends);
    return {
        emailsSent,
        deltaPct
    };
}
function computeOpenRateMetrics(stats, overrideRate, windowDays = 30) {
    const days = stats?.days ?? [];
    const { current, previous } = sliceWindow(days, windowDays);
    const currentSends = sumDays(current, 'sends');
    const currentOpens = sumDays(current, 'opens');
    const previousSends = sumDays(previous, 'sends');
    const previousOpens = sumDays(previous, 'opens');
    const resolvedOverride = Number.isFinite(overrideRate) && overrideRate >= 0 ? overrideRate : undefined;
    const computedRate = currentSends > 0 ? currentOpens / currentSends : stats?.openRate ?? 0;
    const openRate = resolvedOverride ?? computedRate;
    const previousRate = previousSends > 0 ? previousOpens / previousSends : openRate;
    const deltaPct = percentDelta(openRate, previousRate);
    return {
        openRate,
        deltaPct
    };
}
function countAddedThisMonth(clients) {
    const now = new Date();
    return clients.reduce((acc, client)=>{
        if (!client?.createdAt) return acc;
        const created = new Date(client.createdAt);
        if (Number.isNaN(created.getTime())) return acc;
        return created.getFullYear() === now.getFullYear() && created.getMonth() === now.getMonth() ? acc + 1 : acc;
    }, 0);
}
function formatDelta(deltaPct) {
    const rounded = Math.round(deltaPct || 0);
    return `${rounded >= 0 ? '+' : ''}${rounded}%`;
}
}),
"[project]/app/(app)/dashboard/page.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>DashboardPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$features$2f$auth$2f$session$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/features/auth/session.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@tanstack/react-query/build/modern/useQuery.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$agencies$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/services/agencies.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$clients$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/services/clients.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Typography$2f$Typography$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Typography$3e$__ = __turbopack_context__.i("[project]/node_modules/@mui/material/esm/Typography/Typography.js [app-ssr] (ecmascript) <export default as Typography>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Box$2f$Box$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Box$3e$__ = __turbopack_context__.i("[project]/node_modules/@mui/material/esm/Box/Box.js [app-ssr] (ecmascript) <export default as Box>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Skeleton$2f$Skeleton$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Skeleton$3e$__ = __turbopack_context__.i("[project]/node_modules/@mui/material/esm/Skeleton/Skeleton.js [app-ssr] (ecmascript) <export default as Skeleton>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$x$2d$data$2d$grid$2f$esm$2f$DataGrid$2f$DataGrid$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@mui/x-data-grid/esm/DataGrid/DataGrid.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$mailStatus$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/services/mailStatus.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$scholarships$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/services/scholarships.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$icons$2f$io5$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react-icons/io5/index.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f28$app$292f$dashboard$2f$MetricCard$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/(app)/dashboard/MetricCard.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$features$2f$recruiter$2f$RecruitingCalendarCard$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/features/recruiter/RecruitingCalendarCard.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$features$2f$commits$2f$CommitsSection$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/features/commits/CommitsSection.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f28$app$292f$dashboard$2f$metrics$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/(app)/dashboard/metrics.ts [app-ssr] (ecmascript)");
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
;
;
;
function DashboardPage() {
    const { session } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$features$2f$auth$2f$session$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useSession"])();
    const isParent = session?.role === 'parent';
    const q = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useQuery"])({
        queryKey: [
            'dashboard',
            session?.role,
            session?.agencyId
        ],
        queryFn: ()=>isParent ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$agencies$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["listAgencies"])() : (0, __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$clients$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["listClientsByAgencyEmail"])(session.email),
        enabled: !!session && (isParent || !!session?.email)
    });
    const [schInput, setSchInput] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].useState('');
    const [metrics, setMetrics] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].useState(null);
    const isLoading = q.isInitialLoading;
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].useEffect(()=>{
        if (!session?.email || isParent) return;
        if ("TURBOPACK compile-time truthy", 1) return;
        //TURBOPACK unreachable
        ;
    }, [
        session?.email,
        isParent
    ]);
    if (!session) return null;
    if (isParent) {
        const rows = q.data ?? [];
        const columns = [
            {
                field: 'name',
                headerName: 'Agency',
                flex: 1
            }
        ];
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Typography$2f$Typography$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Typography$3e$__["Typography"], {
                    variant: "h4",
                    gutterBottom: true,
                    children: "Dashboard"
                }, void 0, false, {
                    fileName: "[project]/app/(app)/dashboard/page.tsx",
                    lineNumber: 52,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: {
                        height: 520
                    },
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$x$2d$data$2d$grid$2f$esm$2f$DataGrid$2f$DataGrid$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DataGrid"], {
                        rows: rows,
                        columns: columns,
                        getRowId: (r)=>r.id,
                        loading: isLoading
                    }, void 0, false, {
                        fileName: "[project]/app/(app)/dashboard/page.tsx",
                        lineNumber: 54,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/app/(app)/dashboard/page.tsx",
                    lineNumber: 53,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true);
    }
    // Agency dashboard
    const clients = q.data ?? [];
    const clientIds = new Set(clients.map((c)=>c.id));
    const totalClients = clients.length;
    // Emails sent (count mail logs whose clientId belongs to this agency)
    const mail = (0, __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$mailStatus$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getMailEntries"])().filter((m)=>m.clientId && clientIds.has(m.clientId));
    const emailsFallback = mail.length;
    const placeholderRate = Number(process.env.NEXT_PUBLIC_OPEN_RATE_PLACEHOLDER ?? '');
    const { emailsSent, deltaPct: emailsDelta } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f28$app$292f$dashboard$2f$metrics$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["computeEmailMetrics"])(metrics, emailsFallback);
    const { openRate, deltaPct: openRateDelta } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f28$app$292f$dashboard$2f$metrics$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["computeOpenRateMetrics"])(metrics, Number.isFinite(placeholderRate) ? placeholderRate : undefined);
    const addedThisMonth = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f28$app$292f$dashboard$2f$metrics$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["countAddedThisMonth"])(clients);
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
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$scholarships$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setScholarships"])(session.email, Number(schInput) || 0);
        setSchInput(String((0, __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$scholarships$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getScholarships"])(session.email)));
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Typography$2f$Typography$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Typography$3e$__["Typography"], {
                variant: "h4",
                gutterBottom: true,
                children: "Dashboard"
            }, void 0, false, {
                fileName: "[project]/app/(app)/dashboard/page.tsx",
                lineNumber: 99,
                columnNumber: 7
            }, this),
            isLoading ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Skeleton$2f$Skeleton$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Skeleton$3e$__["Skeleton"], {
                variant: "rectangular",
                height: 260,
                sx: {
                    mb: 3,
                    borderRadius: 2
                }
            }, void 0, false, {
                fileName: "[project]/app/(app)/dashboard/page.tsx",
                lineNumber: 102,
                columnNumber: 9
            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$features$2f$recruiter$2f$RecruitingCalendarCard$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["RecruitingCalendarCard"], {}, void 0, false, {
                fileName: "[project]/app/(app)/dashboard/page.tsx",
                lineNumber: 104,
                columnNumber: 7
            }, this),
            isLoading ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Box$2f$Box$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Box$3e$__["Box"], {
                sx: {
                    display: 'grid',
                    gridTemplateColumns: {
                        xs: '1fr',
                        md: 'repeat(3, 1fr)'
                    },
                    gap: 2,
                    mb: 3
                },
                children: [
                    1,
                    2,
                    3
                ].map((k)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Skeleton$2f$Skeleton$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Skeleton$3e$__["Skeleton"], {
                        variant: "rectangular",
                        height: 140,
                        sx: {
                            borderRadius: 2
                        }
                    }, k, false, {
                        fileName: "[project]/app/(app)/dashboard/page.tsx",
                        lineNumber: 110,
                        columnNumber: 13
                    }, this))
            }, void 0, false, {
                fileName: "[project]/app/(app)/dashboard/page.tsx",
                lineNumber: 108,
                columnNumber: 9
            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Box$2f$Box$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Box$3e$__["Box"], {
                sx: {
                    display: 'grid',
                    gridTemplateColumns: {
                        xs: '1fr',
                        md: 'repeat(3, 1fr)'
                    },
                    gap: 2,
                    mb: 3
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f28$app$292f$dashboard$2f$MetricCard$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MetricCard"], {
                        title: "Emails Sent",
                        value: emailsSent,
                        icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$icons$2f$io5$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["IoPaperPlaneOutline"], {
                            size: 20
                        }, void 0, false, {
                            fileName: "[project]/app/(app)/dashboard/page.tsx",
                            lineNumber: 118,
                            columnNumber: 17
                        }, void 0),
                        footer: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$icons$2f$io5$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["IoTrendingUpOutline"], {
                                    color: "#15b79f",
                                    size: 18
                                }, void 0, false, {
                                    fileName: "[project]/app/(app)/dashboard/page.tsx",
                                    lineNumber: 121,
                                    columnNumber: 15
                                }, void 0),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Typography$2f$Typography$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Typography$3e$__["Typography"], {
                                    variant: "body2",
                                    sx: {
                                        color: '#667085'
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Box$2f$Box$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Box$3e$__["Box"], {
                                            component: "span",
                                            sx: {
                                                color: '#15b79f'
                                            },
                                            children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f28$app$292f$dashboard$2f$metrics$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["formatDelta"])(emailsDelta)
                                        }, void 0, false, {
                                            fileName: "[project]/app/(app)/dashboard/page.tsx",
                                            lineNumber: 123,
                                            columnNumber: 17
                                        }, void 0),
                                        " vs last 30d"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/(app)/dashboard/page.tsx",
                                    lineNumber: 122,
                                    columnNumber: 15
                                }, void 0)
                            ]
                        }, void 0, true)
                    }, void 0, false, {
                        fileName: "[project]/app/(app)/dashboard/page.tsx",
                        lineNumber: 115,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f28$app$292f$dashboard$2f$MetricCard$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MetricCard"], {
                        title: "Open Rate",
                        value: `${Math.round((openRate || 0) * 100)}%`,
                        icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$icons$2f$io5$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["IoMailOpenOutline"], {
                            size: 20
                        }, void 0, false, {
                            fileName: "[project]/app/(app)/dashboard/page.tsx",
                            lineNumber: 131,
                            columnNumber: 17
                        }, void 0),
                        footer: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$icons$2f$io5$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["IoTrendingUpOutline"], {
                                    color: "#15b79f",
                                    size: 18
                                }, void 0, false, {
                                    fileName: "[project]/app/(app)/dashboard/page.tsx",
                                    lineNumber: 134,
                                    columnNumber: 15
                                }, void 0),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Typography$2f$Typography$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Typography$3e$__["Typography"], {
                                    variant: "body2",
                                    sx: {
                                        color: '#667085'
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Box$2f$Box$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Box$3e$__["Box"], {
                                            component: "span",
                                            sx: {
                                                color: '#15b79f'
                                            },
                                            children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f28$app$292f$dashboard$2f$metrics$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["formatDelta"])(openRateDelta)
                                        }, void 0, false, {
                                            fileName: "[project]/app/(app)/dashboard/page.tsx",
                                            lineNumber: 136,
                                            columnNumber: 17
                                        }, void 0),
                                        " vs last 30d"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/(app)/dashboard/page.tsx",
                                    lineNumber: 135,
                                    columnNumber: 15
                                }, void 0)
                            ]
                        }, void 0, true)
                    }, void 0, false, {
                        fileName: "[project]/app/(app)/dashboard/page.tsx",
                        lineNumber: 128,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f28$app$292f$dashboard$2f$MetricCard$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MetricCard"], {
                        title: "Total Athletes",
                        value: totalClients,
                        icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$icons$2f$io5$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["IoPersonAddOutline"], {
                            size: 20
                        }, void 0, false, {
                            fileName: "[project]/app/(app)/dashboard/page.tsx",
                            lineNumber: 144,
                            columnNumber: 17
                        }, void 0),
                        footer: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$icons$2f$io5$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["IoTrendingUpOutline"], {
                                    color: "#15b79f",
                                    size: 18
                                }, void 0, false, {
                                    fileName: "[project]/app/(app)/dashboard/page.tsx",
                                    lineNumber: 147,
                                    columnNumber: 15
                                }, void 0),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Typography$2f$Typography$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Typography$3e$__["Typography"], {
                                    variant: "body2",
                                    sx: {
                                        color: '#667085'
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Box$2f$Box$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Box$3e$__["Box"], {
                                            component: "span",
                                            sx: {
                                                color: '#15b79f'
                                            },
                                            children: [
                                                "+",
                                                addedThisMonth
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/(app)/dashboard/page.tsx",
                                            lineNumber: 149,
                                            columnNumber: 17
                                        }, void 0),
                                        " added this month"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/(app)/dashboard/page.tsx",
                                    lineNumber: 148,
                                    columnNumber: 15
                                }, void 0)
                            ]
                        }, void 0, true)
                    }, void 0, false, {
                        fileName: "[project]/app/(app)/dashboard/page.tsx",
                        lineNumber: 141,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/(app)/dashboard/page.tsx",
                lineNumber: 114,
                columnNumber: 7
            }, this),
            isLoading ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Box$2f$Box$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Box$3e$__["Box"], {
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
                    1,
                    2,
                    3,
                    4
                ].map((k)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Skeleton$2f$Skeleton$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Skeleton$3e$__["Skeleton"], {
                        variant: "rectangular",
                        height: 120,
                        sx: {
                            borderRadius: 2
                        }
                    }, k, false, {
                        fileName: "[project]/app/(app)/dashboard/page.tsx",
                        lineNumber: 160,
                        columnNumber: 13
                    }, this))
            }, void 0, false, {
                fileName: "[project]/app/(app)/dashboard/page.tsx",
                lineNumber: 158,
                columnNumber: 9
            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Box$2f$Box$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Box$3e$__["Box"], {
                sx: {
                    display: 'grid',
                    gridTemplateColumns: {
                        xs: '1fr',
                        md: 'repeat(4, 1fr)'
                    },
                    gap: 2,
                    mb: 3
                },
                children: years.map((y, idx)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f28$app$292f$dashboard$2f$MetricCard$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MetricCard"], {
                        title: `Class of ${y}`,
                        value: byYear[y] || 0,
                        icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$icons$2f$io5$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["IoFastFoodOutline"], {
                            size: 20
                        }, void 0, false, {
                            fileName: "[project]/app/(app)/dashboard/page.tsx",
                            lineNumber: 170,
                            columnNumber: 19
                        }, void 0),
                        bgColor: idx === 0 ? '#5D4AFB' : undefined,
                        textColor: idx === 0 ? '#FFFFFF' : undefined,
                        bgImage: idx === 0 ? '/marketing/bg-an.png' : undefined
                    }, y, false, {
                        fileName: "[project]/app/(app)/dashboard/page.tsx",
                        lineNumber: 166,
                        columnNumber: 11
                    }, this))
            }, void 0, false, {
                fileName: "[project]/app/(app)/dashboard/page.tsx",
                lineNumber: 164,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Box$2f$Box$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Box$3e$__["Box"], {
                sx: {
                    display: 'grid',
                    gridTemplateColumns: {
                        xs: '1fr',
                        md: '1fr 1fr'
                    },
                    gap: 3,
                    mb: 4
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$features$2f$commits$2f$CommitsSection$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CommitsSection"], {
                        sport: "Football"
                    }, void 0, false, {
                        fileName: "[project]/app/(app)/dashboard/page.tsx",
                        lineNumber: 180,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$features$2f$commits$2f$CommitsSection$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CommitsSection"], {
                        sport: "Basketball"
                    }, void 0, false, {
                        fileName: "[project]/app/(app)/dashboard/page.tsx",
                        lineNumber: 181,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/(app)/dashboard/page.tsx",
                lineNumber: 179,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true);
}
}),
];

//# sourceMappingURL=_ecae0d67._.js.map