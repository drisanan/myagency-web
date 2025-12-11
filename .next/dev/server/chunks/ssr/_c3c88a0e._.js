module.exports = [
"[project]/config/index.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
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
"[project]/services/http.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "http",
    ()=>http
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$config$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/config/index.ts [app-ssr] (ecmascript)");
;
async function http(path, options = {}) {
    const { apiBaseUrl } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$config$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getServiceConfig"])();
    const url = `${apiBaseUrl}${path}`;
    const res = await fetch(url, {
        method: options.method ?? 'GET',
        headers: {
            'Content-Type': 'application/json',
            ...options.headers ?? {}
        },
        body: options.body ? JSON.stringify(options.body) : undefined,
        cache: 'no-store'
    });
    if (!res.ok) {
        const text = await res.text().catch(()=>'');
        throw new Error(`HTTP ${res.status}: ${text || res.statusText}`);
    }
    return await res.json();
}
}),
"[project]/features/radar/feedService.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getTrending",
    ()=>getTrending,
    "toggleWatchlist",
    ()=>toggleWatchlist
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$http$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/services/http.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__ = __turbopack_context__.i("[project]/node_modules/zod/v4/classic/external.js [app-ssr] (ecmascript) <export * as z>");
;
;
async function getTrending(page = 1) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$http$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["http"])(`/radar/trending?page=${page}`, {
        method: 'GET'
    });
}
const ToggleSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    athleteId: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string(),
    follow: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].boolean()
});
async function toggleWatchlist(input) {
    const body = ToggleSchema.parse(input);
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$http$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["http"])(`/radar/watchlist`, {
        method: 'POST',
        body
    });
}
}),
"[project]/features/radar/useRadarFeed.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useRadarFeed",
    ()=>useRadarFeed
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@tanstack/react-query/build/modern/useQuery.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@tanstack/react-query/build/modern/useMutation.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@tanstack/react-query/build/modern/QueryClientProvider.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$features$2f$radar$2f$feedService$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/features/radar/feedService.ts [app-ssr] (ecmascript)");
;
;
function useRadarFeed(page = 1) {
    const queryClient = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useQueryClient"])();
    const feedQuery = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useQuery"])({
        queryKey: [
            'radar',
            'trending',
            page
        ],
        queryFn: ()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$features$2f$radar$2f$feedService$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getTrending"])(page)
    });
    const followMutation = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMutation"])({
        mutationFn: (input)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$features$2f$radar$2f$feedService$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toggleWatchlist"])(input),
        onSuccess: ()=>{
            queryClient.invalidateQueries({
                queryKey: [
                    'radar',
                    'trending'
                ]
            });
        }
    });
    return {
        feedQuery,
        followMutation
    };
}
}),
"[project]/features/radar/RadarFeedList.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "RadarFeedList",
    ()=>RadarFeedList
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$List$2f$List$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@mui/material/esm/List/List.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$ListItem$2f$ListItem$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@mui/material/esm/ListItem/ListItem.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$ListItemText$2f$ListItemText$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@mui/material/esm/ListItemText/ListItemText.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Button$2f$Button$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@mui/material/esm/Button/Button.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$CircularProgress$2f$CircularProgress$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@mui/material/esm/CircularProgress/CircularProgress.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Alert$2f$Alert$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@mui/material/esm/Alert/Alert.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$features$2f$radar$2f$useRadarFeed$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/features/radar/useRadarFeed.ts [app-ssr] (ecmascript)");
'use client';
;
;
;
;
;
;
;
;
function RadarFeedList() {
    const { feedQuery, followMutation } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$features$2f$radar$2f$useRadarFeed$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRadarFeed"])(1);
    if (feedQuery.isLoading) return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$CircularProgress$2f$CircularProgress$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
        role: "progressbar"
    }, void 0, false, {
        fileName: "[project]/features/radar/RadarFeedList.tsx",
        lineNumber: 14,
        columnNumber: 35
    }, this);
    if (feedQuery.isError) return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Alert$2f$Alert$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
        severity: "error",
        children: "Failed to load feed"
    }, void 0, false, {
        fileName: "[project]/features/radar/RadarFeedList.tsx",
        lineNumber: 15,
        columnNumber: 33
    }, this);
    const items = feedQuery.data ?? [];
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$List$2f$List$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
        children: items.map((a)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$ListItem$2f$ListItem$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                secondaryAction: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Button$2f$Button$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                    variant: "outlined",
                    onClick: ()=>followMutation.mutate({
                            athleteId: a.id,
                            follow: true
                        }),
                    children: "Follow"
                }, void 0, false, {
                    fileName: "[project]/features/radar/RadarFeedList.tsx",
                    lineNumber: 21,
                    columnNumber: 11
                }, void 0),
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$ListItemText$2f$ListItemText$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                    primary: a.name
                }, void 0, false, {
                    fileName: "[project]/features/radar/RadarFeedList.tsx",
                    lineNumber: 28,
                    columnNumber: 11
                }, this)
            }, a.id, false, {
                fileName: "[project]/features/radar/RadarFeedList.tsx",
                lineNumber: 20,
                columnNumber: 9
            }, this))
    }, void 0, false, {
        fileName: "[project]/features/radar/RadarFeedList.tsx",
        lineNumber: 18,
        columnNumber: 5
    }, this);
}
}),
];

//# sourceMappingURL=_c3c88a0e._.js.map