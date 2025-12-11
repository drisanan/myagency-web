module.exports = [
"[project]/services/authGHL.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/* __next_internal_action_entry_do_not_use__ [{"7082ae8be2a06385f53f5f02ae6f2178ef4b712919":"loginWithGHL"},"",""] */ __turbopack_context__.s([
    "loginWithGHL",
    ()=>loginWithGHL
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/server-reference.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$validate$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/action-validate.js [app-rsc] (ecmascript)");
;
const bearerToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJsb2NhdGlvbl9pZCI6InNreFdlMVVIV29URXJURHBienFVIiwiY29tcGFueV9pZCI6IlFEQUxhVGNVQWNpNTdVT2hwaUVxIiwidmVyc2lvbiI6MSwiaWF0IjoxNjk0NzEyNDAzMDYzLCJzdWIiOiJ1c2VyX2lkIn0.N_UmYQr-Ls_THm8iYDBBEZI1_RKqZGlOUPI2t0ncfRE';
const accessCodeFieldId = 't6VuS58tw4n5DEfHTAmp';
async function loginWithGHL(email, phone, accessCodeInput) {
    const encodedEmail = encodeURIComponent(email);
    const encodedPhone = encodeURIComponent(phone);
    const apiUrl = `https://rest.gohighlevel.com/v1/contacts/lookup?email=${encodedEmail}&phone=${encodedPhone}`;
    const res = await fetch(apiUrl, {
        headers: {
            Authorization: `Bearer ${bearerToken}`,
            'Content-Type': 'application/json'
        },
        cache: 'no-store'
    });
    if (!res.ok) return {
        ok: false,
        error: 'Lookup failed'
    };
    const data = await res.json();
    const contact = data?.contacts?.[0];
    if (!contact) return {
        ok: false,
        error: 'Contact not found'
    };
    const accessField = (contact.customField || []).find((f)=>f.id === accessCodeFieldId);
    const storedAccessCode = accessField?.value || '';
    if (!storedAccessCode || storedAccessCode !== accessCodeInput) {
        return {
            ok: false,
            error: 'Invalid access code'
        };
    }
    return {
        ok: true,
        contact: {
            id: contact.id,
            email: contact.email,
            firstName: contact.firstName,
            lastName: contact.lastName,
            phone: contact.phone,
            accessCode: storedAccessCode
        }
    };
}
;
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$validate$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ensureServerEntryExports"])([
    loginWithGHL
]);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(loginWithGHL, "7082ae8be2a06385f53f5f02ae6f2178ef4b712919", null);
}),
"[project]/.next-internal/server/app/auth/login/page/actions.js { ACTIONS_MODULE0 => \"[project]/services/authGHL.ts [app-rsc] (ecmascript)\" } [app-rsc] (server actions loader, ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
var __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$authGHL$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/services/authGHL.ts [app-rsc] (ecmascript)");
;
}),
"[project]/.next-internal/server/app/auth/login/page/actions.js { ACTIONS_MODULE0 => \"[project]/services/authGHL.ts [app-rsc] (ecmascript)\" } [app-rsc] (server actions loader, ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "7082ae8be2a06385f53f5f02ae6f2178ef4b712919",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$services$2f$authGHL$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["loginWithGHL"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f2e$next$2d$internal$2f$server$2f$app$2f$auth$2f$login$2f$page$2f$actions$2e$js__$7b$__ACTIONS_MODULE0__$3d3e$__$225b$project$5d2f$services$2f$authGHL$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$2922$__$7d$__$5b$app$2d$rsc$5d$__$28$server__actions__loader$2c$__ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i('[project]/.next-internal/server/app/auth/login/page/actions.js { ACTIONS_MODULE0 => "[project]/services/authGHL.ts [app-rsc] (ecmascript)" } [app-rsc] (server actions loader, ecmascript) <locals>');
var __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$authGHL$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/services/authGHL.ts [app-rsc] (ecmascript)");
}),
"[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/server-reference.js [app-rsc] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/* eslint-disable import/no-extraneous-dependencies */ Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "registerServerReference", {
    enumerable: true,
    get: function() {
        return _server.registerServerReference;
    }
});
const _server = __turbopack_context__.r("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-turbopack-server.js [app-rsc] (ecmascript)"); //# sourceMappingURL=server-reference.js.map
}),
"[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/action-validate.js [app-rsc] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

// This function ensures that all the exported values are valid server actions,
// during the runtime. By definition all actions are required to be async
// functions, but here we can only check that they are functions.
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "ensureServerEntryExports", {
    enumerable: true,
    get: function() {
        return ensureServerEntryExports;
    }
});
function ensureServerEntryExports(actions) {
    for(let i = 0; i < actions.length; i++){
        const action = actions[i];
        if (typeof action !== 'function') {
            throw Object.defineProperty(new Error(`A "use server" file can only export async functions, found ${typeof action}.\nRead more: https://nextjs.org/docs/messages/invalid-use-server-value`), "__NEXT_ERROR_CODE", {
                value: "E352",
                enumerable: false,
                configurable: true
            });
        }
    }
} //# sourceMappingURL=action-validate.js.map
}),
];

//# sourceMappingURL=_31742909._.js.map