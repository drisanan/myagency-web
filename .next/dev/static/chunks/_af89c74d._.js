(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/theme/typography.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
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
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/theme/colors.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
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
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/tenancy/themeBuilder.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "createTenantTheme",
    ()=>createTenantTheme
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$styles$2f$createTheme$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__createTheme$3e$__ = __turbopack_context__.i("[project]/node_modules/@mui/material/esm/styles/createTheme.js [app-client] (ecmascript) <export default as createTheme>");
var __TURBOPACK__imported__module__$5b$project$5d2f$theme$2f$typography$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/theme/typography.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$theme$2f$colors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/theme/colors.ts [app-client] (ecmascript)");
;
;
;
function createTenantTheme(tenant) {
    const theme = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$styles$2f$createTheme$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__createTheme$3e$__["createTheme"])({
        palette: {
            primary: {
                main: __TURBOPACK__imported__module__$5b$project$5d2f$theme$2f$colors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["colors"].actionBg,
                contrastText: __TURBOPACK__imported__module__$5b$project$5d2f$theme$2f$colors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["colors"].actionText
            },
            secondary: {
                main: tenant.brand.secondary || '#5D4AFB'
            }
        },
        typography: __TURBOPACK__imported__module__$5b$project$5d2f$theme$2f$typography$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["typography"],
        components: {
            MuiButton: {
                styleOverrides: {
                    root: {
                        borderRadius: 8
                    },
                    containedPrimary: {
                        backgroundColor: __TURBOPACK__imported__module__$5b$project$5d2f$theme$2f$colors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["colors"].actionBg,
                        color: __TURBOPACK__imported__module__$5b$project$5d2f$theme$2f$colors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["colors"].actionText,
                        '&:hover': {
                            backgroundColor: '#99e600'
                        }
                    },
                    outlinedPrimary: {
                        borderColor: __TURBOPACK__imported__module__$5b$project$5d2f$theme$2f$colors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["colors"].actionBg,
                        color: __TURBOPACK__imported__module__$5b$project$5d2f$theme$2f$colors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["colors"].actionText,
                        '&:hover': {
                            borderColor: '#99e600',
                            backgroundColor: 'rgba(170,251,0,0.08)'
                        }
                    },
                    textPrimary: {
                        color: __TURBOPACK__imported__module__$5b$project$5d2f$theme$2f$colors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["colors"].actionText
                    }
                }
            },
            MuiTabs: {
                styleOverrides: {
                    indicator: {
                        backgroundColor: __TURBOPACK__imported__module__$5b$project$5d2f$theme$2f$colors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["colors"].actionBg
                    }
                }
            },
            MuiTab: {
                styleOverrides: {
                    root: {
                        '&.Mui-selected': {
                            color: __TURBOPACK__imported__module__$5b$project$5d2f$theme$2f$colors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["colors"].actionText
                        }
                    }
                }
            },
            MuiListItemButton: {
                styleOverrides: {
                    root: {
                        '&.Mui-selected': {
                            backgroundColor: 'rgba(170,251,0,0.12)',
                            color: __TURBOPACK__imported__module__$5b$project$5d2f$theme$2f$colors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["colors"].actionText
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
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/tenancy/TenantContext.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "TenantProvider",
    ()=>TenantProvider,
    "useTenant",
    ()=>useTenant
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
const TenantCtx = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].createContext(null);
function TenantProvider({ tenant, children }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(TenantCtx.Provider, {
        value: tenant,
        children: children
    }, void 0, false, {
        fileName: "[project]/tenancy/TenantContext.tsx",
        lineNumber: 8,
        columnNumber: 10
    }, this);
}
_c = TenantProvider;
function useTenant() {
    _s();
    const ctx = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].useContext(TenantCtx);
    if (!ctx) throw new Error('useTenant must be used within TenantProvider');
    return ctx;
}
_s(useTenant, "/dMy7t63NXD4eYACoT93CePwGrg=");
var _c;
__turbopack_context__.k.register(_c, "TenantProvider");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/tenancy/TenantThemeProvider.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "TenantThemeProvider",
    ()=>TenantThemeProvider
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$styles$2f$ThemeProvider$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ThemeProvider$3e$__ = __turbopack_context__.i("[project]/node_modules/@mui/material/esm/styles/ThemeProvider.js [app-client] (ecmascript) <export default as ThemeProvider>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$CssBaseline$2f$CssBaseline$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CssBaseline$3e$__ = __turbopack_context__.i("[project]/node_modules/@mui/material/esm/CssBaseline/CssBaseline.js [app-client] (ecmascript) <export default as CssBaseline>");
var __TURBOPACK__imported__module__$5b$project$5d2f$tenancy$2f$themeBuilder$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/tenancy/themeBuilder.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$tenancy$2f$TenantContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/tenancy/TenantContext.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
;
function TenantThemeProvider({ tenant, children }) {
    _s();
    const theme = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].useMemo({
        "TenantThemeProvider.useMemo[theme]": ()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$tenancy$2f$themeBuilder$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createTenantTheme"])(tenant)
    }["TenantThemeProvider.useMemo[theme]"], [
        tenant
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$tenancy$2f$TenantContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TenantProvider"], {
        tenant: tenant,
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$styles$2f$ThemeProvider$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ThemeProvider$3e$__["ThemeProvider"], {
            theme: theme,
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$CssBaseline$2f$CssBaseline$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CssBaseline$3e$__["CssBaseline"], {}, void 0, false, {
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
_s(TenantThemeProvider, "TF0AHbRu8DO10P/SWtT0KIxHEhc=");
_c = TenantThemeProvider;
var _c;
__turbopack_context__.k.register(_c, "TenantThemeProvider");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/features/auth/session.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "SessionProvider",
    ()=>SessionProvider,
    "useSession",
    ()=>useSession
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
'use client';
;
const SessionCtx = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].createContext(null);
function SessionProvider({ children }) {
    _s();
    const [session, setSession] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].useState(null);
    const [loading, setLoading] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].useState(true);
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].useEffect({
        "SessionProvider.useEffect": ()=>{
            const raw = ("TURBOPACK compile-time truthy", 1) ? window.localStorage.getItem('session') : "TURBOPACK unreachable";
            if (raw) setSession(JSON.parse(raw));
            setLoading(false);
        }
    }["SessionProvider.useEffect"], []);
    const set = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].useCallback({
        "SessionProvider.useCallback[set]": (s)=>{
            setSession(s);
            if ("TURBOPACK compile-time truthy", 1) {
                if (s) window.localStorage.setItem('session', JSON.stringify(s));
                else window.localStorage.removeItem('session');
            }
        }
    }["SessionProvider.useCallback[set]"], []);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(SessionCtx.Provider, {
        value: {
            session,
            setSession: set,
            loading
        },
        children: children
    }, void 0, false, {
        fileName: "[project]/features/auth/session.tsx",
        lineNumber: 26,
        columnNumber: 10
    }, this);
}
_s(SessionProvider, "1PlkmgPwBNOeUvGfIVMUxJ8G0vU=");
_c = SessionProvider;
function useSession() {
    _s1();
    const ctx = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].useContext(SessionCtx);
    if (!ctx) throw new Error('useSession must be used within SessionProvider');
    return ctx;
}
_s1(useSession, "/dMy7t63NXD4eYACoT93CePwGrg=");
var _c;
__turbopack_context__.k.register(_c, "SessionProvider");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/providers.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Providers",
    ()=>Providers
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$query$2d$core$2f$build$2f$modern$2f$queryClient$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@tanstack/query-core/build/modern/queryClient.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@tanstack/react-query/build/modern/QueryClientProvider.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$features$2f$auth$2f$session$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/features/auth/session.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
function Providers({ children }) {
    _s();
    const [client] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].useState({
        "Providers.useState": ()=>new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$query$2d$core$2f$build$2f$modern$2f$queryClient$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["QueryClient"]()
    }["Providers.useState"]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["QueryClientProvider"], {
        client: client,
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$features$2f$auth$2f$session$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SessionProvider"], {
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
_s(Providers, "xB8rX2qMZOuzYtrVICOBkOffv9I=");
_c = Providers;
var _c;
__turbopack_context__.k.register(_c, "Providers");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=_af89c74d._.js.map