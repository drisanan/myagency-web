module.exports = [
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[project]/theme/typography.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "fontStack",
    ()=>fontStack,
    "typography",
    ()=>typography
]);
const fontStack = [
    'Inter',
    '-apple-system',
    'BlinkMacSystemFont',
    '"Segoe UI"',
    'Helvetica',
    'Arial',
    'sans-serif',
    '"Apple Color Emoji"',
    '"Segoe UI Emoji"'
].join(',');
const typography = {
    fontFamily: fontStack
};
}),
"[project]/theme/colors.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "colors",
    ()=>colors
]);
const colors = {
    sidebarBg: '#14151E',
    sidebarText: '#999DAA',
    navActiveBg: '#AAFB00',
    navActiveText: '#14151E',
    actionBg: '#AAFB00',
    actionText: '#14151E'
};
}),
"[project]/tenancy/themeBuilder.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "createTenantTheme",
    ()=>createTenantTheme
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$styles$2f$createTheme$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__createTheme$3e$__ = __turbopack_context__.i("[project]/node_modules/@mui/material/esm/styles/createTheme.js [app-ssr] (ecmascript) <export default as createTheme>");
var __TURBOPACK__imported__module__$5b$project$5d2f$theme$2f$typography$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/theme/typography.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$theme$2f$colors$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/theme/colors.ts [app-ssr] (ecmascript)");
;
;
;
function createTenantTheme(tenant) {
    const theme = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$styles$2f$createTheme$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__createTheme$3e$__["createTheme"])({
        palette: {
            primary: {
                main: __TURBOPACK__imported__module__$5b$project$5d2f$theme$2f$colors$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["colors"].actionBg,
                contrastText: __TURBOPACK__imported__module__$5b$project$5d2f$theme$2f$colors$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["colors"].actionText
            },
            secondary: {
                main: tenant.brand.secondary || '#5D4AFB'
            }
        },
        typography: __TURBOPACK__imported__module__$5b$project$5d2f$theme$2f$typography$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["typography"],
        components: {
            MuiButton: {
                styleOverrides: {
                    root: {
                        borderRadius: 8
                    },
                    containedPrimary: {
                        backgroundColor: __TURBOPACK__imported__module__$5b$project$5d2f$theme$2f$colors$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["colors"].actionBg,
                        color: __TURBOPACK__imported__module__$5b$project$5d2f$theme$2f$colors$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["colors"].actionText,
                        '&:hover': {
                            backgroundColor: '#99e600'
                        }
                    },
                    outlinedPrimary: {
                        borderColor: __TURBOPACK__imported__module__$5b$project$5d2f$theme$2f$colors$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["colors"].actionBg,
                        color: __TURBOPACK__imported__module__$5b$project$5d2f$theme$2f$colors$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["colors"].actionText,
                        '&:hover': {
                            borderColor: '#99e600',
                            backgroundColor: 'rgba(170,251,0,0.08)'
                        }
                    },
                    textPrimary: {
                        color: __TURBOPACK__imported__module__$5b$project$5d2f$theme$2f$colors$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["colors"].actionText
                    }
                }
            },
            MuiTabs: {
                styleOverrides: {
                    indicator: {
                        backgroundColor: __TURBOPACK__imported__module__$5b$project$5d2f$theme$2f$colors$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["colors"].actionBg
                    }
                }
            },
            MuiTab: {
                styleOverrides: {
                    root: {
                        '&.Mui-selected': {
                            color: __TURBOPACK__imported__module__$5b$project$5d2f$theme$2f$colors$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["colors"].actionText
                        }
                    }
                }
            },
            MuiListItemButton: {
                styleOverrides: {
                    root: {
                        '&.Mui-selected': {
                            backgroundColor: 'rgba(170,251,0,0.12)',
                            color: __TURBOPACK__imported__module__$5b$project$5d2f$theme$2f$colors$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["colors"].actionText
                        }
                    }
                }
            },
            MuiOutlinedInput: {
                styleOverrides: {
                    root: {
                        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji"',
                        fontWeight: 400,
                        fontSize: '1rem',
                        lineHeight: '1.4375em',
                        boxSizing: 'border-box',
                        display: 'inline-flex',
                        alignItems: 'center',
                        borderRadius: 8,
                        minHeight: 40,
                        paddingBlock: 0,
                        paddingInline: 12,
                        boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.08)'
                    },
                    input: {
                        padding: 0
                    },
                    notchedOutline: {
                        borderWidth: 1
                    }
                }
            },
            MuiInputBase: {
                styleOverrides: {
                    root: {
                        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji"',
                        fontWeight: 400,
                        fontSize: '1rem',
                        lineHeight: '1.4375em'
                    },
                    input: {
                        padding: 0
                    }
                }
            }
        }
    });
    return theme;
}
}),
"[project]/tenancy/TenantContext.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "TenantProvider",
    ()=>TenantProvider,
    "useTenant",
    ()=>useTenant
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
'use client';
;
;
const TenantCtx = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].createContext(null);
function TenantProvider({ tenant, children }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(TenantCtx.Provider, {
        value: tenant,
        children: children
    }, void 0, false, {
        fileName: "[project]/tenancy/TenantContext.tsx",
        lineNumber: 8,
        columnNumber: 10
    }, this);
}
function useTenant() {
    const ctx = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].useContext(TenantCtx);
    if (!ctx) throw new Error('useTenant must be used within TenantProvider');
    return ctx;
}
}),
"[project]/tenancy/TenantThemeProvider.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "TenantThemeProvider",
    ()=>TenantThemeProvider
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$styles$2f$ThemeProvider$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ThemeProvider$3e$__ = __turbopack_context__.i("[project]/node_modules/@mui/material/esm/styles/ThemeProvider.js [app-ssr] (ecmascript) <export default as ThemeProvider>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$CssBaseline$2f$CssBaseline$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__CssBaseline$3e$__ = __turbopack_context__.i("[project]/node_modules/@mui/material/esm/CssBaseline/CssBaseline.js [app-ssr] (ecmascript) <export default as CssBaseline>");
var __TURBOPACK__imported__module__$5b$project$5d2f$tenancy$2f$themeBuilder$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/tenancy/themeBuilder.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$tenancy$2f$TenantContext$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/tenancy/TenantContext.tsx [app-ssr] (ecmascript)");
'use client';
;
;
;
;
;
function TenantThemeProvider({ tenant, children }) {
    const theme = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].useMemo(()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$tenancy$2f$themeBuilder$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createTenantTheme"])(tenant), [
        tenant
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$tenancy$2f$TenantContext$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["TenantProvider"], {
        tenant: tenant,
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$styles$2f$ThemeProvider$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ThemeProvider$3e$__["ThemeProvider"], {
            theme: theme,
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$CssBaseline$2f$CssBaseline$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__CssBaseline$3e$__["CssBaseline"], {}, void 0, false, {
                    fileName: "[project]/tenancy/TenantThemeProvider.tsx",
                    lineNumber: 18,
                    columnNumber: 9
                }, this),
                children
            ]
        }, void 0, true, {
            fileName: "[project]/tenancy/TenantThemeProvider.tsx",
            lineNumber: 17,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/tenancy/TenantThemeProvider.tsx",
        lineNumber: 16,
        columnNumber: 5
    }, this);
}
}),
"[project]/services/agencies.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "createAgencyFromGHL",
    ()=>createAgencyFromGHL,
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
const API_BASE_URL = ("TURBOPACK compile-time value", "https://iakaowunc5.execute-api.us-west-1.amazonaws.com") || process.env.API_BASE_URL;
function requireApiBase() {
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    return API_BASE_URL;
}
async function apiFetch(path, init) {
    const base = requireApiBase();
    if (typeof fetch === 'undefined') return null;
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
async function listAgencies() {
    if ("TURBOPACK compile-time truthy", 1) {
        const data = await apiFetch('/agencies');
        return data?.agencies ?? [];
    }
    //TURBOPACK unreachable
    ;
}
async function getAgencies() {
    if ("TURBOPACK compile-time truthy", 1) {
        const data = await apiFetch('/agencies');
        return data?.agencies ?? [];
    }
    //TURBOPACK unreachable
    ;
}
async function getAgencyByEmail(email) {
    if ("TURBOPACK compile-time truthy", 1) {
        const data = await apiFetch('/agencies');
        const list = data?.agencies ?? [];
        return list.find((a)=>a.email === email) ?? null;
    }
    //TURBOPACK unreachable
    ;
}
async function getAgencyById(id) {
    if ("TURBOPACK compile-time truthy", 1) {
        const data = await apiFetch('/agencies');
        const list = data?.agencies ?? [];
        return list.find((a)=>a.id === id) ?? null;
    }
    //TURBOPACK unreachable
    ;
}
async function getAgencySettings(email) {
    if ("TURBOPACK compile-time truthy", 1) {
        const data = await apiFetch(`/agencies?email=${encodeURIComponent(email)}`);
        const list = data?.agencies ?? [];
        const a = list.find((x)=>x.email === email);
        return a?.settings ?? {};
    }
    //TURBOPACK unreachable
    ;
}
async function updateAgencySettings(email, settings) {
    if ("TURBOPACK compile-time truthy", 1) {
        const data = await apiFetch('/agencies/settings', {
            method: 'PUT',
            body: JSON.stringify({
                email,
                settings
            })
        });
        return data;
    }
    //TURBOPACK unreachable
    ;
}
async function upsertAgency(input) {
    if ("TURBOPACK compile-time truthy", 1) {
        const data = await apiFetch('/agencies', {
            method: 'POST',
            body: JSON.stringify(input)
        });
        return data;
    }
    //TURBOPACK unreachable
    ;
}
async function createAgencyFromGHL(input) {
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    const payload = {
        name: input.name || 'New Agency',
        email: input.email,
        settings: {
            primaryColor: input.color,
            logoDataUrl: input.logoUrl
        }
    };
    const res = await apiFetch('/agencies', {
        method: 'POST',
        body: JSON.stringify(payload)
    });
    const id = res?.id || res?.agency?.id;
    return {
        id,
        ...payload
    };
}
async function deleteAgency(id) {
    if ("TURBOPACK compile-time truthy", 1) {
        const data = await apiFetch(`/agencies/${id}`, {
            method: 'DELETE'
        });
        return data ?? {
            ok: true
        };
    }
    //TURBOPACK unreachable
    ;
}
}),
"[project]/services/authGHL.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "loginWithGHL",
    ()=>loginWithGHL
]);
'use client';
async function loginWithGHL(apiBase, email, phone, accessCodeInput) {
    if (!apiBase) throw new Error('API_BASE_URL is not configured');
    try {
        const endpoint = `${apiBase}/auth/login`;
        const res = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({
                email,
                phone,
                accessCode: accessCodeInput
            })
        });
        const data = await res.json();
        if (!res.ok || !data?.ok) {
            return {
                ok: false,
                error: data?.error || 'Login failed'
            };
        }
        return {
            ok: true,
            contact: data.contact,
            agency: data.agency
        };
    } catch (e) {
        return {
            ok: false,
            error: e?.message || 'Login failed'
        };
    }
}
}),
"[project]/features/auth/service.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "fetchSession",
    ()=>fetchSession,
    "login",
    ()=>login
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$agencies$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/services/agencies.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$authGHL$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/services/authGHL.ts [app-ssr] (ecmascript)");
;
;
;
const NEXT_PUBLIC_API_BASE_URL = 'https://iakaowunc5.execute-api.us-west-1.amazonaws.com';
const API_BASE_URL = NEXT_PUBLIC_API_BASE_URL;
function requireApiBase() {
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    return API_BASE_URL;
}
async function postSession(session) {
    const base = requireApiBase();
    if (typeof fetch === 'undefined') return null;
    const res = await fetch(`${base}/auth/session`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
            agencyId: session.agencyId,
            email: session.email,
            role: session.role,
            userId: session.contactId
        })
    });
    if (!res.ok) {
        const txt = await res.text();
        throw new Error(`auth session failed: ${res.status} ${txt}`);
    }
    return res.json();
}
async function fetchSession() {
    const base = requireApiBase();
    if (typeof fetch === 'undefined') return null;
    try {
        const res = await fetch(`${base}/auth/session`, {
            method: 'GET',
            credentials: 'include'
        });
        if (!res.ok) return null;
        const data = await res.json();
        return data?.session ?? null;
    } catch  {
        return null;
    }
}
async function login(input) {
    const base = requireApiBase();
    const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$authGHL$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["loginWithGHL"])(base, input.email.trim(), input.phone.trim(), input.accessCode.trim());
    if (!result.ok) {
        throw new Error(result.error);
    }
    console.log('result', JSON.stringify(result, null, 2));
    let agencyId = result.agency?.id;
    let agencyName = result.agency?.name;
    let agencyColor = result.agency?.color;
    let agencyLogo = result.agency?.logoUrl;
    console.log('agencyId', agencyId);
    console.log('agencyName', agencyName);
    console.log('agencyColor', agencyColor);
    console.log('agencyLogo', agencyLogo);
    if (agencyId === 'READY') {
        console.log('Creating new agency from GHL metadata');
        // Create new agency instance using GHL metadata
        const created = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$agencies$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createAgencyFromGHL"])({
            name: agencyName,
            email: result.contact.email,
            color: agencyColor,
            logoUrl: agencyLogo
        });
        agencyId = created.id;
    }
    console.log('agencyId', agencyId);
    if (!agencyId) {
        const agency = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$agencies$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getAgencyByEmail"])(result.contact.email);
        agencyId = agency?.id;
    }
    // Final fallback: use contact email as agencyId to avoid missing field on session
    agencyId = agencyId || result.contact.email;
    console.log('agencyId', agencyId);
    console.log('result.contact.email', result.contact.email);
    const session = {
        role: 'agency',
        email: result.contact.email,
        agencyId,
        contactId: result.contact.id
    };
    // Issue session cookie via API if available
    await postSession(session).catch(()=>null);
    return session;
}
}),
"[project]/features/auth/session.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "SessionProvider",
    ()=>SessionProvider,
    "useSession",
    ()=>useSession
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$features$2f$auth$2f$service$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/features/auth/service.ts [app-ssr] (ecmascript)");
'use client';
;
;
;
const SessionCtx = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].createContext(null);
function SessionProvider({ children }) {
    const [session, setSession] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].useState(null);
    const [loading, setLoading] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].useState(true);
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].useEffect(()=>{
        let mounted = true;
        (async ()=>{
            const apiSession = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$features$2f$auth$2f$service$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fetchSession"])();
            if (!mounted) return;
            setSession(apiSession);
            setLoading(false);
        })();
        return ()=>{
            mounted = false;
        };
    }, []);
    const set = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].useCallback((s)=>{
        setSession(s);
    }, []);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(SessionCtx.Provider, {
        value: {
            session,
            setSession: set,
            loading
        },
        children: children
    }, void 0, false, {
        fileName: "[project]/features/auth/session.tsx",
        lineNumber: 30,
        columnNumber: 10
    }, this);
}
function useSession() {
    const ctx = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].useContext(SessionCtx);
    if (!ctx) throw new Error('useSession must be used within SessionProvider');
    return ctx;
}
}),
"[project]/app/providers.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Providers",
    ()=>Providers
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$query$2d$core$2f$build$2f$modern$2f$queryClient$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@tanstack/query-core/build/modern/queryClient.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@tanstack/react-query/build/modern/QueryClientProvider.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$features$2f$auth$2f$session$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/features/auth/session.tsx [app-ssr] (ecmascript)");
'use client';
;
;
;
;
function Providers({ children }) {
    const [client] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].useState(()=>new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$query$2d$core$2f$build$2f$modern$2f$queryClient$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["QueryClient"]());
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["QueryClientProvider"], {
        client: client,
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$features$2f$auth$2f$session$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SessionProvider"], {
            children: children
        }, void 0, false, {
            fileName: "[project]/app/providers.tsx",
            lineNumber: 10,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/app/providers.tsx",
        lineNumber: 9,
        columnNumber: 5
    }, this);
}
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/action-async-storage.external.js [external] (next/dist/server/app-render/action-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/action-async-storage.external.js", () => require("next/dist/server/app-render/action-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/dynamic-access-async-storage.external.js [external] (next/dist/server/app-render/dynamic-access-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/dynamic-access-async-storage.external.js", () => require("next/dist/server/app-render/dynamic-access-async-storage.external.js"));

module.exports = mod;
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__bd1c224a._.js.map