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

// infra/src/handlers/auth.ts
var auth_exports = {};
__export(auth_exports, {
  handler: () => handler
});
module.exports = __toCommonJS(auth_exports);

// infra/src/lib/session.ts
var import_crypto = require("crypto");
var SECRET = process.env.SESSION_SECRET || "dev-secret-change-me";
var COOKIE_NAME = "an_session";
function sign(payload) {
  const sig = (0, import_crypto.createHmac)("sha256", SECRET).update(payload).digest("base64url");
  return `${payload}.${sig}`;
}
function verify(token) {
  const idx = token.lastIndexOf(".");
  if (idx < 0) return null;
  const payload = token.slice(0, idx);
  const sig = token.slice(idx + 1);
  const expected = (0, import_crypto.createHmac)("sha256", SECRET).update(payload).digest("base64url");
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !(0, import_crypto.timingSafeEqual)(a, b)) return null;
  try {
    return JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
  } catch {
    return null;
  }
}
function encodeSession(session) {
  const payload = Buffer.from(JSON.stringify(session)).toString("base64url");
  return sign(payload);
}
function parseSession(token) {
  if (!token) return null;
  return verify(token);
}
function parseCookie(header) {
  if (!header) return {};
  return header.split(";").reduce((acc, part) => {
    const [k, v] = part.trim().split("=");
    if (k && v) acc[k] = v;
    return acc;
  }, {});
}
function parseSessionFromRequest(event) {
  const cookieHeader = event.headers.cookie || event.headers.Cookie;
  const cookies = parseCookie(cookieHeader);
  const token = cookies[COOKIE_NAME];
  return parseSession(token);
}
function buildSessionCookie(token, secure = true) {
  const attrs = [
    `${COOKIE_NAME}=${token}`,
    "HttpOnly",
    "Path=/",
    "SameSite=None",
    ...secure ? ["Secure"] : [],
    "Max-Age=604800"
    // 7d
  ];
  return attrs.join("; ");
}
function buildClearCookie(secure = true) {
  const attrs = [`${COOKIE_NAME}=; Path=/; Max-Age=0; HttpOnly; SameSite=None${secure ? "; Secure" : ""}`];
  return attrs.join("; ");
}

// infra/src/handlers/cors.ts
var ALLOWED_ORIGINS = [
  "https://master.d2yp6hyv6u0efd.amplifyapp.com",
  "https://myrecruiteragency.com",
  "https://www.myrecruiteragency.com",
  "http://localhost:3000",
  "http://localhost:3001"
];
function buildCors(origin) {
  const allow = origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": allow,
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Allow-Headers": "Content-Type,Authorization,X-Amz-Date,X-Api-Key,X-Amz-Security-Token",
    "Access-Control-Allow-Methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS"
  };
}
function response(statusCode, body, origin, extraHeaders) {
  const cors = buildCors(origin);
  return {
    statusCode,
    headers: { ...cors, ...extraHeaders || {} },
    body: JSON.stringify(body)
  };
}

// infra/src/handlers/auth.ts
var handler = async (event) => {
  const origin = event.headers?.origin || event.headers?.Origin || event.headers?.["origin"] || "";
  const method = (event.requestContext.http?.method || "").toUpperCase();
  if (!method) return response(400, { ok: false, error: "Missing method" }, origin);
  const host = event.headers["x-forwarded-host"] || event.headers["Host"] || "";
  const proto = event.headers["x-forwarded-proto"] || "https";
  const resolvedOrigin = origin || `${proto}://${host}`;
  const secureCookie = proto === "https" && !resolvedOrigin.includes("localhost");
  if (method === "OPTIONS") {
    return response(200, { ok: true }, origin);
  }
  if (method === "GET") {
    const cookieHeader = event.headers?.cookie || event.headers?.Cookie;
    const session = parseSessionFromRequest(event);
    console.log("auth GET", { origin, cookie: cookieHeader, session });
    return response(200, { ok: true, session }, origin);
  }
  if (method === "POST") {
    if (!event.body) return response(400, { ok: false, error: "Missing body" }, origin);
    const payload = JSON.parse(event.body);
    if (!payload.agencyId || !payload.email || !payload.role) {
      return response(400, { ok: false, error: "agencyId, email, role required" }, origin);
    }
    const token = encodeSession({
      agencyId: payload.agencyId,
      agencyEmail: payload.email,
      role: payload.role,
      userId: payload.userId
    });
    const cookie = buildSessionCookie(token, secureCookie);
    return response(200, { ok: true, session: payload }, origin, { "set-cookie": cookie });
  }
  if (method === "DELETE") {
    return response(200, { ok: true }, origin, { "set-cookie": buildClearCookie(secureCookie) });
  }
  return response(405, { ok: false, error: `Method not allowed` }, origin);
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  handler
});
//# sourceMappingURL=auth.js.map
