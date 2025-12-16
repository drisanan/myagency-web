module.exports = [
"[project]/app/forms/[token]/page.client.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>IntakeFormPageClient
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
(()=>{
    const e = new Error("Cannot find module '@mui/material'");
    e.code = 'MODULE_NOT_FOUND';
    throw e;
})();
(()=>{
    const e = new Error("Cannot find module '@mui/material/styles'");
    e.code = 'MODULE_NOT_FOUND';
    throw e;
})();
(()=>{
    const e = new Error("Cannot find module '@mui/material/CircularProgress'");
    e.code = 'MODULE_NOT_FOUND';
    throw e;
})();
'use client';
;
;
;
;
;
const API_BASE_URL = ("TURBOPACK compile-time value", "https://t4334hpi3h.execute-api.us-east-1.amazonaws.com") || process.env.API_BASE_URL || '';
const resolvedApiBase = API_BASE_URL || (("TURBOPACK compile-time falsy", 0) ? "TURBOPACK unreachable" : '');
const sportsOptions = [
    'Football',
    'Basketball',
    'Baseball',
    'Soccer',
    'Track',
    'Volleyball',
    'Swimming'
];
const divisionOptions = [
    'D1',
    'D2',
    'D3',
    'NAIA',
    'JUCO'
];
const gradYearOptions = [
    '2025',
    '2026',
    '2027',
    '2028'
];
const sportPositions = {
    Football: [
        'QB',
        'RB',
        'WR',
        'TE',
        'OT',
        'OG',
        'C',
        'DE',
        'DT',
        'LB',
        'CB',
        'S',
        'K',
        'P',
        'LS'
    ],
    Basketball: [
        'PG',
        'SG',
        'SF',
        'PF',
        'C'
    ],
    Baseball: [
        'P',
        'C',
        '1B',
        '2B',
        '3B',
        'SS',
        'LF',
        'CF',
        'RF',
        'DH'
    ],
    Soccer: [
        'GK',
        'RB',
        'LB',
        'CB',
        'CDM',
        'CM',
        'CAM',
        'RW',
        'LW',
        'ST'
    ],
    Volleyball: [
        'Setter',
        'Opposite',
        'Middle Blocker',
        'Outside Hitter',
        'Libero',
        'Defensive Specialist'
    ],
    Track: [
        'Sprints',
        'Middle Distance',
        'Long Distance',
        'Hurdles',
        'Jumps',
        'Throws',
        'Relays'
    ]
};
function getPositions(sport) {
    const list = sportPositions[sport];
    return Array.isArray(list) && list.length ? list : null;
}
function IntakeFormPageClient({ token }) {
    const decodedToken = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].useMemo(()=>{
        try {
            return decodeURIComponent(token);
        } catch  {
            return token;
        }
    }, [
        token
    ]);
    const [agency, setAgency] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].useState({});
    const initialForm = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].useMemo(()=>({
            email: '',
            phone: '',
            password: '',
            firstName: '',
            lastName: '',
            sport: '',
            division: '',
            graduationYear: '',
            profileImageUrl: '',
            radar: {
                preferredPosition: '',
                school: '',
                gpa: '',
                youtubeHighlightUrl: '',
                hudlLink: '',
                instagramProfileUrl: '',
                athleteMetricsTitleOne: '',
                athleteMetricsValueOne: ''
            }
        }), []);
    const [form, setForm] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].useState(initialForm);
    const [errors, setErrors] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].useState({});
    const [submitting, setSubmitting] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].useState(false);
    const [submitError, setSubmitError] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].useState('');
    const [submitSuccess, setSubmitSuccess] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].useState('');
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].useEffect(()=>{
        (async ()=>{
            if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
            ;
            try {
                const res = await fetch(`${resolvedApiBase}/forms/agency?token=${encodeURIComponent(decodedToken)}`, {
                    credentials: 'include'
                });
                const data = await res.json();
                if (data?.ok) setAgency(data.agency || {});
            } catch  {}
        })();
    }, [
        decodedToken
    ]);
    async function submit() {
        try {
            setSubmitting(true);
            setSubmitError('');
            setSubmitSuccess('');
            const nextErrors = {};
            if (!form.email) nextErrors.email = 'Email is required';
            if (form.email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) nextErrors.email = 'Enter a valid email';
            if (!form.password) nextErrors.password = 'Password is required';
            if (!form.phone) nextErrors.phone = 'Phone is required';
            else if (!/^\+?\d+$/.test(String(form.phone).trim())) nextErrors.phone = 'Phone must be digits only';
            if (!form.firstName) nextErrors.firstName = 'First name is required';
            if (!form.lastName) nextErrors.lastName = 'Last name is required';
            if (!form.sport) nextErrors.sport = 'Sport is required';
            if (!form.division) nextErrors.division = 'Division is required';
            if (!form.graduationYear) nextErrors.graduationYear = 'Graduation year is required';
            if (Object.keys(nextErrors).length) {
                setErrors(nextErrors);
                setSubmitting(false);
                return;
            }
            if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
            ;
            const res = await fetch(`${resolvedApiBase}/forms/submit`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({
                    token: decodedToken,
                    form
                })
            });
            const data = await res.json();
            if (!res.ok || !data?.ok) throw new Error(data?.error || 'Submit failed');
            console.info('[intake:submit:success]', {
                id: data?.id
            });
            setSubmitSuccess('Submitted! You may close this page.');
            setForm(initialForm);
            setErrors({});
        } catch (e) {
            console.error('[intake:submit:error]', {
                error: e?.message
            });
            setSubmitError(e?.message || 'Submit failed');
        } finally{
            setSubmitting(false);
        }
    }
    const theme = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].useMemo(()=>{
        const primary = agency?.settings?.primaryColor || '#1976d2';
        const secondary = agency?.settings?.secondaryColor || '#9c27b0';
        return createTheme({
            palette: {
                primary: {
                    main: primary
                },
                secondary: {
                    main: secondary
                }
            }
        });
    }, [
        agency?.settings?.primaryColor,
        agency?.settings?.secondaryColor
    ]);
    const positions = getPositions(form.sport);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(ThemeProvider, {
        theme: theme,
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Box, {
            sx: {
                maxWidth: 720,
                m: '40px auto'
            },
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Paper, {
                sx: {
                    p: 3
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Box, {
                        sx: {
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2,
                            mb: 2
                        },
                        children: [
                            agency?.settings?.logoDataUrl ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                src: agency.settings.logoDataUrl,
                                alt: "Agency Logo",
                                style: {
                                    height: 48,
                                    objectFit: 'contain'
                                }
                            }, void 0, false, {
                                fileName: "[project]/app/forms/[token]/page.client.tsx",
                                lineNumber: 140,
                                columnNumber: 15
                            }, this) : null,
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Typography, {
                                variant: "h5",
                                gutterBottom: true,
                                sx: {
                                    m: 0
                                },
                                children: agency?.name || 'Athlete Intake'
                            }, void 0, false, {
                                fileName: "[project]/app/forms/[token]/page.client.tsx",
                                lineNumber: 142,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/forms/[token]/page.client.tsx",
                        lineNumber: 138,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Box, {
                        sx: {
                            display: 'grid',
                            gridTemplateColumns: {
                                xs: '1fr',
                                md: '1fr 1fr'
                            },
                            gap: 2,
                            mb: 2
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(TextField, {
                                label: "Email",
                                value: form.email,
                                onChange: (e)=>setForm({
                                        ...form,
                                        email: e.target.value
                                    }),
                                error: Boolean(errors.email),
                                helperText: errors.email
                            }, void 0, false, {
                                fileName: "[project]/app/forms/[token]/page.client.tsx",
                                lineNumber: 145,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(TextField, {
                                label: "Phone",
                                value: form.phone,
                                onChange: (e)=>setForm({
                                        ...form,
                                        phone: e.target.value
                                    }),
                                error: Boolean(errors.phone),
                                helperText: errors.phone
                            }, void 0, false, {
                                fileName: "[project]/app/forms/[token]/page.client.tsx",
                                lineNumber: 146,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(TextField, {
                                label: "Password",
                                type: "password",
                                value: form.password,
                                onChange: (e)=>setForm({
                                        ...form,
                                        password: e.target.value
                                    }),
                                error: Boolean(errors.password),
                                helperText: errors.password
                            }, void 0, false, {
                                fileName: "[project]/app/forms/[token]/page.client.tsx",
                                lineNumber: 147,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(TextField, {
                                label: "First name",
                                value: form.firstName,
                                onChange: (e)=>setForm({
                                        ...form,
                                        firstName: e.target.value
                                    }),
                                error: Boolean(errors.firstName),
                                helperText: errors.firstName
                            }, void 0, false, {
                                fileName: "[project]/app/forms/[token]/page.client.tsx",
                                lineNumber: 148,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(TextField, {
                                label: "Last name",
                                value: form.lastName,
                                onChange: (e)=>setForm({
                                        ...form,
                                        lastName: e.target.value
                                    }),
                                error: Boolean(errors.lastName),
                                helperText: errors.lastName
                            }, void 0, false, {
                                fileName: "[project]/app/forms/[token]/page.client.tsx",
                                lineNumber: 149,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(TextField, {
                                select: true,
                                label: "Sport",
                                value: form.sport,
                                onChange: (e)=>setForm({
                                        ...form,
                                        sport: e.target.value
                                    }),
                                error: Boolean(errors.sport),
                                helperText: errors.sport,
                                children: sportsOptions.map((s)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(MenuItem, {
                                        value: s,
                                        children: s
                                    }, s, false, {
                                        fileName: "[project]/app/forms/[token]/page.client.tsx",
                                        lineNumber: 151,
                                        columnNumber: 39
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/app/forms/[token]/page.client.tsx",
                                lineNumber: 150,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(TextField, {
                                select: true,
                                label: "Division",
                                value: form.division,
                                onChange: (e)=>setForm({
                                        ...form,
                                        division: e.target.value
                                    }),
                                error: Boolean(errors.division),
                                helperText: errors.division,
                                children: divisionOptions.map((d)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(MenuItem, {
                                        value: d,
                                        children: d
                                    }, d, false, {
                                        fileName: "[project]/app/forms/[token]/page.client.tsx",
                                        lineNumber: 154,
                                        columnNumber: 41
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/app/forms/[token]/page.client.tsx",
                                lineNumber: 153,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(TextField, {
                                select: true,
                                label: "Graduation Year",
                                value: form.graduationYear,
                                onChange: (e)=>setForm({
                                        ...form,
                                        graduationYear: e.target.value
                                    }),
                                error: Boolean(errors.graduationYear),
                                helperText: errors.graduationYear,
                                children: gradYearOptions.map((y)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(MenuItem, {
                                        value: y,
                                        children: y
                                    }, y, false, {
                                        fileName: "[project]/app/forms/[token]/page.client.tsx",
                                        lineNumber: 157,
                                        columnNumber: 41
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/app/forms/[token]/page.client.tsx",
                                lineNumber: 156,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(TextField, {
                                select: Boolean(positions && positions.length),
                                label: "Preferred Position",
                                value: form.radar.preferredPosition,
                                onChange: (e)=>setForm({
                                        ...form,
                                        radar: {
                                            ...form.radar,
                                            preferredPosition: e.target.value
                                        }
                                    }),
                                children: positions && positions.length ? positions.map((p)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(MenuItem, {
                                        value: p,
                                        children: p
                                    }, p, false, {
                                        fileName: "[project]/app/forms/[token]/page.client.tsx",
                                        lineNumber: 166,
                                        columnNumber: 38
                                    }, this)) : null
                            }, void 0, false, {
                                fileName: "[project]/app/forms/[token]/page.client.tsx",
                                lineNumber: 159,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(TextField, {
                                label: "School",
                                value: form.radar.school,
                                onChange: (e)=>setForm({
                                        ...form,
                                        radar: {
                                            ...form.radar,
                                            school: e.target.value
                                        }
                                    })
                            }, void 0, false, {
                                fileName: "[project]/app/forms/[token]/page.client.tsx",
                                lineNumber: 169,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(TextField, {
                                label: "GPA",
                                value: form.radar.gpa,
                                onChange: (e)=>setForm({
                                        ...form,
                                        radar: {
                                            ...form.radar,
                                            gpa: e.target.value
                                        }
                                    })
                            }, void 0, false, {
                                fileName: "[project]/app/forms/[token]/page.client.tsx",
                                lineNumber: 170,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(TextField, {
                                label: "YouTube",
                                value: form.radar.youtubeHighlightUrl,
                                onChange: (e)=>setForm({
                                        ...form,
                                        radar: {
                                            ...form.radar,
                                            youtubeHighlightUrl: e.target.value
                                        }
                                    })
                            }, void 0, false, {
                                fileName: "[project]/app/forms/[token]/page.client.tsx",
                                lineNumber: 171,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(TextField, {
                                label: "Hudl",
                                value: form.radar.hudlLink,
                                onChange: (e)=>setForm({
                                        ...form,
                                        radar: {
                                            ...form.radar,
                                            hudlLink: e.target.value
                                        }
                                    })
                            }, void 0, false, {
                                fileName: "[project]/app/forms/[token]/page.client.tsx",
                                lineNumber: 172,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(TextField, {
                                label: "Instagram",
                                value: form.radar.instagramProfileUrl,
                                onChange: (e)=>setForm({
                                        ...form,
                                        radar: {
                                            ...form.radar,
                                            instagramProfileUrl: e.target.value
                                        }
                                    })
                            }, void 0, false, {
                                fileName: "[project]/app/forms/[token]/page.client.tsx",
                                lineNumber: 173,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(TextField, {
                                label: "Metric 1 Title",
                                value: form.radar.athleteMetricsTitleOne,
                                onChange: (e)=>setForm({
                                        ...form,
                                        radar: {
                                            ...form.radar,
                                            athleteMetricsTitleOne: e.target.value
                                        }
                                    })
                            }, void 0, false, {
                                fileName: "[project]/app/forms/[token]/page.client.tsx",
                                lineNumber: 174,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(TextField, {
                                label: "Metric 1 Value",
                                value: form.radar.athleteMetricsValueOne,
                                onChange: (e)=>setForm({
                                        ...form,
                                        radar: {
                                            ...form.radar,
                                            athleteMetricsValueOne: e.target.value
                                        }
                                    })
                            }, void 0, false, {
                                fileName: "[project]/app/forms/[token]/page.client.tsx",
                                lineNumber: 175,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(TextField, {
                                type: "file",
                                inputProps: {
                                    accept: 'image/png,image/jpeg,image/jpg'
                                },
                                label: "Profile Image",
                                onChange: (e)=>{
                                    const target = e.target;
                                    const file = target.files?.[0];
                                    if (!file) return;
                                    const reader = new FileReader();
                                    reader.onload = ()=>setForm({
                                            ...form,
                                            profileImageUrl: String(reader.result || '')
                                        });
                                    reader.readAsDataURL(file);
                                },
                                helperText: "Upload png or jpg"
                            }, void 0, false, {
                                fileName: "[project]/app/forms/[token]/page.client.tsx",
                                lineNumber: 176,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/forms/[token]/page.client.tsx",
                        lineNumber: 144,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Box, {
                        sx: {
                            display: 'flex',
                            gap: 2,
                            alignItems: 'center'
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Button, {
                                variant: "contained",
                                onClick: submit,
                                disabled: submitting,
                                startIcon: submitting ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(CircularProgress, {
                                    size: 16
                                }, void 0, false, {
                                    fileName: "[project]/app/forms/[token]/page.client.tsx",
                                    lineNumber: 192,
                                    columnNumber: 104
                                }, void 0) : undefined,
                                children: submitting ? 'Submitting…' : 'Submit'
                            }, void 0, false, {
                                fileName: "[project]/app/forms/[token]/page.client.tsx",
                                lineNumber: 192,
                                columnNumber: 13
                            }, this),
                            submitError ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Typography, {
                                variant: "body2",
                                color: "error",
                                children: submitError
                            }, void 0, false, {
                                fileName: "[project]/app/forms/[token]/page.client.tsx",
                                lineNumber: 195,
                                columnNumber: 28
                            }, this) : null,
                            submitSuccess ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Typography, {
                                variant: "body2",
                                color: "success.main",
                                children: submitSuccess
                            }, void 0, false, {
                                fileName: "[project]/app/forms/[token]/page.client.tsx",
                                lineNumber: 196,
                                columnNumber: 30
                            }, this) : null
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/forms/[token]/page.client.tsx",
                        lineNumber: 191,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/forms/[token]/page.client.tsx",
                lineNumber: 137,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/app/forms/[token]/page.client.tsx",
            lineNumber: 136,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/app/forms/[token]/page.client.tsx",
        lineNumber: 135,
        columnNumber: 5
    }, this);
}
}),
];

//# sourceMappingURL=app_forms_%5Btoken%5D_page_client_tsx_6c5b6f05._.js.map