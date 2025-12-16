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

// infra/src/handlers/ghl-login.ts
var ghl_login_exports = {};
__export(ghl_login_exports, {
  handler: () => handler
});
module.exports = __toCommonJS(ghl_login_exports);
var bearerToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjb21wYW55X2lkIjoiMVVsY3o1akRSNjU3SHBQQUhTRXIiLCJ2ZXJzaW9uIjoxLCJpYXQiOjE3NjU1NjAxNDk2MzAsInN1YiI6ImJmaXRFa2pvM2tBenFlaXlkMmhmIn0.d4IzBIrDouTnSq4EraYL0YmfZP54lpDW4rMP3MkCXKY";
var accessCodeFieldId = "t6VuS58tw4n5DEfHTAmp";
var ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || "https://master.d2yp6hyv6u0efd.amplifyapp.com";
function getHeaders(origin) {
  const allowOrigin = origin && origin === ALLOWED_ORIGIN ? origin : ALLOWED_ORIGIN;
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
  const method = event.requestContext.http?.method || event.httpMethod;
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
    const accessField = (contact.customField || []).find((f) => f.id === accessCodeFieldId);
    const storedAccessCode = accessField?.value;
    const storedAccessCodeStr = storedAccessCode == null ? "" : String(storedAccessCode).trim();
    if (!storedAccessCodeStr || storedAccessCodeStr !== accessCodeInput) {
      return { statusCode: 401, headers, body: JSON.stringify({ ok: false, error: "Invalid access code" }) };
    }
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  handler
});
//# sourceMappingURL=ghl-login.js.map
