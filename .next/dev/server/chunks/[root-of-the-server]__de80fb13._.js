module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[project]/app/api/auth/ghl-login/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
;
const bearerToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJsb2NhdGlvbl9pZCI6InNreFdlMVVIV29URXJURHBienFVIiwiY29tcGFueV9pZCI6IlFEQUxhVGNVQWNpNTdVT2hwaUVxIiwidmVyc2lvbiI6MSwiaWF0IjoxNjk0NzEyNDAzMDYzLCJzdWIiOiJ1c2VyX2lkIn0.N_UmYQr-Ls_THm8iYDBBEZI1_RKqZGlOUPI2t0ncfRE';
const accessCodeFieldId = 't6VuS58tw4n5DEfHTAmp';
async function POST(req) {
    try {
        const { email, phone, accessCode } = await req.json();
        if (!email || !phone || !accessCode) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                ok: false,
                error: 'Missing credentials'
            }, {
                status: 400
            });
        }
        const emailTrim = String(email).trim();
        const phoneTrim = String(phone).trim();
        const accessCodeInput = String(accessCode).trim();
        if (!/^\+?\d+$/.test(phoneTrim)) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                ok: false,
                error: 'Invalid phone'
            }, {
                status: 400
            });
        }
        if (!/^\d+$/.test(accessCodeInput)) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                ok: false,
                error: 'Invalid access code format'
            }, {
                status: 400
            });
        }
        const encodedEmail = encodeURIComponent(emailTrim);
        const encodedPhone = encodeURIComponent(phoneTrim);
        const apiUrl = `https://rest.gohighlevel.com/v1/contacts/lookup?email=${encodedEmail}&phone=${encodedPhone}`;
        const res = await fetch(apiUrl, {
            headers: {
                Authorization: `Bearer ${bearerToken}`,
                'Content-Type': 'application/json'
            },
            cache: 'no-store'
        });
        const data = await res.json();
        if (!res.ok) {
            const errMsg = data?.message || 'Lookup failed';
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                ok: false,
                error: errMsg
            }, {
                status: res.status
            });
        }
        const contact = data?.contacts?.[0];
        if (!contact) return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            ok: false,
            error: 'Contact not found'
        }, {
            status: 404
        });
        const accessField = (contact.customField || []).find((f)=>f.id === accessCodeFieldId);
        const storedAccessCode = accessField?.value;
        const storedAccessCodeStr = storedAccessCode === undefined || storedAccessCode === null ? '' : String(storedAccessCode).trim();
        if (!storedAccessCodeStr || storedAccessCodeStr !== accessCodeInput) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                ok: false,
                error: 'Invalid access code'
            }, {
                status: 401
            });
        }
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            ok: true,
            contact: {
                id: contact.id,
                email: contact.email,
                firstName: contact.firstName,
                lastName: contact.lastName,
                phone: contact.phone,
                accessCode: storedAccessCode
            }
        });
    } catch (e) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            ok: false,
            error: e?.message || 'Server error'
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__de80fb13._.js.map