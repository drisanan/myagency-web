(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
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
"[project]/features/recruiter/DivisionFinder.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DivisionFinder",
    ()=>DivisionFinder
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Stack$2f$Stack$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Stack$3e$__ = __turbopack_context__.i("[project]/node_modules/@mui/material/esm/Stack/Stack.js [app-client] (ecmascript) <export default as Stack>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$TextField$2f$TextField$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__TextField$3e$__ = __turbopack_context__.i("[project]/node_modules/@mui/material/esm/TextField/TextField.js [app-client] (ecmascript) <export default as TextField>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$MenuItem$2f$MenuItem$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__MenuItem$3e$__ = __turbopack_context__.i("[project]/node_modules/@mui/material/esm/MenuItem/MenuItem.js [app-client] (ecmascript) <export default as MenuItem>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Card$2f$Card$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Card$3e$__ = __turbopack_context__.i("[project]/node_modules/@mui/material/esm/Card/Card.js [app-client] (ecmascript) <export default as Card>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$CardActionArea$2f$CardActionArea$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CardActionArea$3e$__ = __turbopack_context__.i("[project]/node_modules/@mui/material/esm/CardActionArea/CardActionArea.js [app-client] (ecmascript) <export default as CardActionArea>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$CardContent$2f$CardContent$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CardContent$3e$__ = __turbopack_context__.i("[project]/node_modules/@mui/material/esm/CardContent/CardContent.js [app-client] (ecmascript) <export default as CardContent>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Typography$2f$Typography$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Typography$3e$__ = __turbopack_context__.i("[project]/node_modules/@mui/material/esm/Typography/Typography.js [app-client] (ecmascript) <export default as Typography>");
var __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$recruiterMeta$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/services/recruiterMeta.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
function DivisionFinder() {
    _s();
    const [division, setDivision] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].useState('');
    const [state, setState] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].useState('');
    const [divisions, setDivisions] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].useState([]);
    const [states, setStates] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].useState([]);
    const [universities, setUniversities] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].useState([]);
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].useEffect({
        "DivisionFinder.useEffect": ()=>{
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$recruiterMeta$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getDivisions"])().then(setDivisions);
        }
    }["DivisionFinder.useEffect"], []);
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].useEffect({
        "DivisionFinder.useEffect": ()=>{
            if (division) (0, __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$recruiterMeta$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getStates"])(division).then(setStates);
            setState('');
            setUniversities([]);
        }
    }["DivisionFinder.useEffect"], [
        division
    ]);
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].useEffect({
        "DivisionFinder.useEffect": ()=>{
            if (division && state) (0, __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$recruiterMeta$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getUniversities"])({
                division,
                state
            }).then(setUniversities);
        }
    }["DivisionFinder.useEffect"], [
        division,
        state
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Stack$2f$Stack$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Stack$3e$__["Stack"], {
        spacing: 2,
        sx: {
            maxWidth: 720
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
                        fileName: "[project]/features/recruiter/DivisionFinder.tsx",
                        lineNumber: 26,
                        columnNumber: 29
                    }, this))
            }, void 0, false, {
                fileName: "[project]/features/recruiter/DivisionFinder.tsx",
                lineNumber: 19,
                columnNumber: 7
            }, this),
            division && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$TextField$2f$TextField$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__TextField$3e$__["TextField"], {
                select: true,
                label: "State",
                value: state,
                onChange: (e)=>setState(e.target.value),
                SelectProps: {
                    MenuProps: {
                        disablePortal: true
                    }
                },
                children: states.map((s)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$MenuItem$2f$MenuItem$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__MenuItem$3e$__["MenuItem"], {
                        value: s.code,
                        children: s.name
                    }, s.code, false, {
                        fileName: "[project]/features/recruiter/DivisionFinder.tsx",
                        lineNumber: 36,
                        columnNumber: 26
                    }, this))
            }, void 0, false, {
                fileName: "[project]/features/recruiter/DivisionFinder.tsx",
                lineNumber: 29,
                columnNumber: 9
            }, this),
            division && state && universities.map((u)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Card$2f$Card$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Card$3e$__["Card"], {
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$CardActionArea$2f$CardActionArea$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CardActionArea$3e$__["CardActionArea"], {
                        href: `/recruiter/university/${u.id}`,
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$CardContent$2f$CardContent$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CardContent$3e$__["CardContent"], {
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Typography$2f$Typography$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Typography$3e$__["Typography"], {
                                children: u.name
                            }, void 0, false, {
                                fileName: "[project]/features/recruiter/DivisionFinder.tsx",
                                lineNumber: 41,
                                columnNumber: 24
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/features/recruiter/DivisionFinder.tsx",
                            lineNumber: 41,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/features/recruiter/DivisionFinder.tsx",
                        lineNumber: 40,
                        columnNumber: 26
                    }, this)
                }, u.id, false, {
                    fileName: "[project]/features/recruiter/DivisionFinder.tsx",
                    lineNumber: 40,
                    columnNumber: 9
                }, this))
        ]
    }, void 0, true, {
        fileName: "[project]/features/recruiter/DivisionFinder.tsx",
        lineNumber: 18,
        columnNumber: 5
    }, this);
}
_s(DivisionFinder, "n6EuMKppJNEfclzq46jFhgQJGDM=");
_c = DivisionFinder;
var _c;
__turbopack_context__.k.register(_c, "DivisionFinder");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=_5db38ab4._.js.map