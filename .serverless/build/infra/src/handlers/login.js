"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// infra/src/handlers/login.ts
var login_exports = {};
__export(login_exports, {
  handler: () => handler2
});
module.exports = __toCommonJS(login_exports);

// infra/src/handlers/ghl-login.ts
var bearerToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJsb2NhdGlvbl9pZCI6IjZCSXRESEVyQTRTVllyUDgxVk1DIiwiY29tcGFueV9pZCI6IjFVbGN6NWpEUjY1N0hwUEFIU0VyIiwidmVyc2lvbiI6MSwiaWF0IjoxNzAyNTAwMjk3Njg4LCJzdWIiOiJ1c2VyX2lkIn0.fqrY7YeSxhmjWhgXySUrWTYvlZwfjjXCP9o8mTZ8exU";
var accessCodeFieldId = "D3ogBTF9YTkxJybeMVvF";
var agencyIdFieldId = "2nUnTxRCuWPiGQ4j23we";
var agencyNameFieldId = "mSth0jJ8VQk1k9caFxCC";
var agencyColorFieldId = "0STRDPbWyZ6ChSApAtjz";
var agencyLogoFieldId = "Bvng0E2Yf5TkmEI8KyD6";
var ALLOWED_ORIGINS = [
  "https://myrecruiteragency.com",
  "https://www.myrecruiteragency.com",
  "https://master.d2yp6hyv6u0efd.amplifyapp.com",
  "http://localhost:3001",
  "http://localhost:3000"
];
function getHeaders(origin) {
  const allowOrigin = origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Allow-Headers": "Content-Type,Authorization,X-Amz-Date,X-Api-Key,X-Amz-Security-Token",
    "Access-Control-Allow-Methods": "POST,OPTIONS"
  };
}
var handler = async (event) => {
  const origin = event.headers?.origin || event.headers?.Origin || event.headers?.["origin"] || "";
  const headers = getHeaders(origin);
  const method = (event.requestContext.http?.method || "").toUpperCase();
  if (method === "OPTIONS") {
    return { statusCode: 200, headers, body: JSON.stringify({ ok: true }) };
  }
  if (method !== "POST") {
    return { statusCode: 405, headers, body: JSON.stringify({ ok: false, error: `Method not allowed` }) };
  }
  try {
    if (!event.body) {
      return { statusCode: 400, headers, body: JSON.stringify({ ok: false, error: "Missing body" }) };
    }
    const { email, phone, accessCode } = JSON.parse(event.body);
    if (!email || !phone || !accessCode) {
      return { statusCode: 400, headers, body: JSON.stringify({ ok: false, error: "Missing credentials" }) };
    }
    const emailTrim = String(email).trim();
    const phoneTrim = String(phone).trim();
    const accessCodeInput = String(accessCode).trim();
    if (!/^\+?\d+$/.test(phoneTrim)) {
      return { statusCode: 400, headers, body: JSON.stringify({ ok: false, error: "Invalid phone" }) };
    }
    if (!/^\d+$/.test(accessCodeInput)) {
      return { statusCode: 400, headers, body: JSON.stringify({ ok: false, error: "Invalid access code format" }) };
    }
    const encodedEmail = encodeURIComponent(emailTrim);
    const encodedPhone = encodeURIComponent(phoneTrim);
    const apiUrl = `https://rest.gohighlevel.com/v1/contacts/lookup?email=${encodedEmail}&phone=${encodedPhone}`;
    const res = await fetch(apiUrl, {
      headers: {
        Authorization: `Bearer ${bearerToken}`,
        "Content-Type": "application/json"
      },
      cache: "no-store"
    });
    const data = await res.json();
    if (!res.ok) {
      const errMsg = data?.message || "Lookup failed";
      return { statusCode: res.status, headers, body: JSON.stringify({ ok: false, error: errMsg }) };
    }
    const contact = data?.contacts?.[0];
    if (!contact) {
      return { statusCode: 404, headers, body: JSON.stringify({ ok: false, error: "Contact not found" }) };
    }
    const customFields = contact.customField || [];
    const accessField = customFields.find((f) => f.id === accessCodeFieldId);
    const storedAccessCode = accessField?.value;
    const storedAccessCodeStr = storedAccessCode == null ? "" : String(storedAccessCode).trim();
    if (!storedAccessCodeStr || storedAccessCodeStr !== accessCodeInput) {
      return { statusCode: 401, headers, body: JSON.stringify({ ok: false, error: "Invalid access code" }) };
    }
    const agencyId = (customFields.find((f) => f.id === agencyIdFieldId)?.value || "").toString().trim();
    const agencyName = (customFields.find((f) => f.id === agencyNameFieldId)?.value || "").toString().trim();
    const agencyColor = (customFields.find((f) => f.id === agencyColorFieldId)?.value || "").toString().trim();
    const agencyLogo = (customFields.find((f) => f.id === agencyLogoFieldId)?.value || "").toString().trim();
    const isNew = agencyId === "READY";
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        ok: true,
        contact: {
          id: contact.id,
          email: contact.email,
          firstName: contact.firstName,
          lastName: contact.lastName,
          phone: contact.phone,
          accessCode: storedAccessCode
        },
        agency: {
          id: agencyId || void 0,
          name: agencyName || void 0,
          color: agencyColor || void 0,
          logoUrl: agencyLogo || void 0,
          isNew
        }
      })
    };
  } catch (e) {
    console.error("ghl-login lambda error", e);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ ok: false, error: e?.message || "Server error" })
    };
  }
};

// infra/src/handlers/login.ts
var handler2 = async (event) => {
  return handler(event);
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  handler
});
//# sourceMappingURL=login.js.map
