module.exports = [
"[project]/tenancy/themeBuilder.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "createTenantTheme",
    ()=>createTenantTheme
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$styles$2f$createTheme$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__default__as__createTheme$3e$__ = __turbopack_context__.i("[project]/node_modules/@mui/material/esm/styles/createTheme.js [app-rsc] (ecmascript) <export default as createTheme>");
;
function createTenantTheme(tenant) {
    const theme = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$styles$2f$createTheme$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__default__as__createTheme$3e$__["createTheme"])({
        palette: {
            primary: {
                main: tenant.brand.primary
            },
            secondary: {
                main: tenant.brand.secondary
            }
        },
        typography: {
            fontFamily: 'Inter, Roboto, Helvetica, Arial, sans-serif'
        },
        components: {
            MuiButton: {
                styleOverrides: {
                    root: {
                        borderRadius: 8
                    }
                }
            }
        }
    });
    return theme;
}
}),
"[project]/tenancy/TenantContext.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "TenantProvider",
    ()=>TenantProvider,
    "useTenant",
    ()=>useTenant
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-jsx-dev-runtime.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react.js [app-rsc] (ecmascript)");
;
;
const TenantCtx = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"].createContext(null);
function TenantProvider({ tenant, children }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(TenantCtx.Provider, {
        value: tenant,
        children: children
    }, void 0, false, {
        fileName: "[project]/tenancy/TenantContext.tsx",
        lineNumber: 7,
        columnNumber: 10
    }, this);
}
function useTenant() {
    const ctx = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"].useContext(TenantCtx);
    if (!ctx) throw new Error('useTenant must be used within TenantProvider');
    return ctx;
}
}),
"[project]/tenancy/TenantThemeProvider.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "TenantThemeProvider",
    ()=>TenantThemeProvider
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-jsx-dev-runtime.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$styles$2f$ThemeProvider$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__default__as__ThemeProvider$3e$__ = __turbopack_context__.i("[project]/node_modules/@mui/material/esm/styles/ThemeProvider.js [app-rsc] (ecmascript) <export default as ThemeProvider>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$CssBaseline$2f$CssBaseline$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__default__as__CssBaseline$3e$__ = __turbopack_context__.i("[project]/node_modules/@mui/material/esm/CssBaseline/CssBaseline.js [app-rsc] (ecmascript) <export default as CssBaseline>");
var __TURBOPACK__imported__module__$5b$project$5d2f$tenancy$2f$themeBuilder$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/tenancy/themeBuilder.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$tenancy$2f$TenantContext$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/tenancy/TenantContext.tsx [app-rsc] (ecmascript)");
;
;
;
;
;
function TenantThemeProvider({ tenant, children }) {
    const theme = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"].useMemo(()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$tenancy$2f$themeBuilder$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["createTenantTheme"])(tenant), [
        tenant
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$tenancy$2f$TenantContext$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["TenantProvider"], {
        tenant: tenant,
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$styles$2f$ThemeProvider$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__default__as__ThemeProvider$3e$__["ThemeProvider"], {
            theme: theme,
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$CssBaseline$2f$CssBaseline$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__default__as__CssBaseline$3e$__["CssBaseline"], {}, void 0, false, {
                    fileName: "[project]/tenancy/TenantThemeProvider.tsx",
                    lineNumber: 17,
                    columnNumber: 9
                }, this),
                children
            ]
        }, void 0, true, {
            fileName: "[project]/tenancy/TenantThemeProvider.tsx",
            lineNumber: 16,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/tenancy/TenantThemeProvider.tsx",
        lineNumber: 15,
        columnNumber: 5
    }, this);
}
}),
"[project]/config/index.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getServiceConfig",
    ()=>getServiceConfig,
    "getTenantRegistry",
    ()=>getTenantRegistry
]);
let cachedServiceConfig = null;
let cachedTenantRegistry = null;
function getServiceConfig() {
    if (cachedServiceConfig) return cachedServiceConfig;
    // Single source of truth; override via env if needed
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.example.com';
    cachedServiceConfig = {
        apiBaseUrl
    };
    return cachedServiceConfig;
}
function getTenantRegistry() {
    if (cachedTenantRegistry) return cachedTenantRegistry;
    cachedTenantRegistry = {
        default: {
            id: 'default',
            name: 'AthleteNarrative',
            brand: {
                primary: '#1976d2',
                secondary: '#9c27b0'
            },
            flags: {}
        },
        acme: {
            id: 'acme',
            name: 'Acme Athletics',
            brand: {
                primary: '#1976d2',
                secondary: '#ff4081'
            },
            flags: {}
        }
    };
    return cachedTenantRegistry;
}
}),
"[project]/tenancy/tenantResolver.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ensureKnownTenant",
    ()=>ensureKnownTenant,
    "resolveTenantFromHost",
    ()=>resolveTenantFromHost,
    "resolveTenantFromPath",
    ()=>resolveTenantFromPath
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$config$2f$index$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/config/index.ts [app-rsc] (ecmascript)");
;
function resolveTenantFromHost(hostname) {
    // e.g., acme.example.com -> acme
    const parts = hostname.split('.').filter(Boolean);
    if (parts.length > 2) {
        return parts[0];
    }
    // if hostname is localhost or root domain, use default
    return 'default';
}
function resolveTenantFromPath(pathname) {
    // /t/<tenantId>/... -> <tenantId>
    const parts = pathname.split('/').filter(Boolean);
    if (parts[0] === 't' && parts[1]) {
        return parts[1];
    }
    return 'default';
}
function ensureKnownTenant(tenantId) {
    const reg = (0, __TURBOPACK__imported__module__$5b$project$5d2f$config$2f$index$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getTenantRegistry"])();
    return reg[tenantId] ? tenantId : 'default';
}
}),
"[project]/tenancy/serverTenant.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getServerTenant",
    ()=>getServerTenant
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/headers.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$config$2f$index$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/config/index.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$tenancy$2f$tenantResolver$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/tenancy/tenantResolver.ts [app-rsc] (ecmascript)");
;
;
;
async function getServerTenant() {
    const hdrs = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["headers"])();
    const host = hdrs.get('host') || '';
    const path = hdrs.get('x-invoke-path') || ''; // non-standard, may be empty; fallback to default
    const fromHost = (0, __TURBOPACK__imported__module__$5b$project$5d2f$tenancy$2f$tenantResolver$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ensureKnownTenant"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$tenancy$2f$tenantResolver$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["resolveTenantFromHost"])(host));
    if (fromHost !== 'default') {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$config$2f$index$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getTenantRegistry"])()[fromHost];
    }
    const fromPath = (0, __TURBOPACK__imported__module__$5b$project$5d2f$tenancy$2f$tenantResolver$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ensureKnownTenant"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$tenancy$2f$tenantResolver$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["resolveTenantFromPath"])(path));
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$config$2f$index$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getTenantRegistry"])()[fromPath];
}
}),
"[project]/app/layout.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>RootLayout,
    "metadata",
    ()=>metadata
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-jsx-dev-runtime.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$tenancy$2f$TenantThemeProvider$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/tenancy/TenantThemeProvider.tsx [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$tenancy$2f$serverTenant$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/tenancy/serverTenant.ts [app-rsc] (ecmascript)");
;
;
;
const metadata = {
    title: 'AthleteNarrative Web',
    description: 'Multi-tenant white-label web app'
};
async function RootLayout({ children }) {
    const tenant = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$tenancy$2f$serverTenant$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getServerTenant"])();
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("html", {
        lang: "en",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("body", {
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$tenancy$2f$TenantThemeProvider$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["TenantThemeProvider"], {
                tenant: tenant,
                children: children
            }, void 0, false, {
                fileName: "[project]/app/layout.tsx",
                lineNumber: 16,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/app/layout.tsx",
            lineNumber: 15,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/app/layout.tsx",
        lineNumber: 14,
        columnNumber: 5
    }, this);
}
}),
];

//# sourceMappingURL=_3f9659ef._.js.map