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

// infra/src/handlers/common.ts
var import_client_dynamodb = require("@aws-sdk/client-dynamodb");
var import_lib_dynamodb = require("@aws-sdk/lib-dynamodb");

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
    "SameSite=Lax",
    ...secure ? ["Secure"] : [],
    "Max-Age=604800"
    // 7d
  ];
  return attrs.join("; ");
}
function buildClearCookie(secure = true) {
  const attrs = [`${COOKIE_NAME}=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax${secure ? "; Secure" : ""}`];
  return attrs.join("; ");
}

// infra/src/handlers/common.ts
var client = new import_client_dynamodb.DynamoDBClient({});
var docClient = import_lib_dynamodb.DynamoDBDocumentClient.from(client);
function jsonResponse(statusCode, body) {
  return {
    statusCode,
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body)
  };
}
function badRequest(message) {
  return jsonResponse(400, { ok: false, message });
}

// infra/src/handlers/auth.ts
var handler = async (event) => {
  if (!event.requestContext.http?.method) {
    return badRequest("Missing method");
  }
  const method = event.requestContext.http.method.toUpperCase();
  const originHdr = event.headers["origin"] || event.headers["Origin"] || "";
  const host = event.headers["x-forwarded-host"] || event.headers["Host"] || "";
  const proto = event.headers["x-forwarded-proto"] || "https";
  const resolvedOrigin = originHdr || `${proto}://${host}`;
  const secureCookie = proto === "https" && !resolvedOrigin.includes("localhost");
  const corsHeaders = {
    "access-control-allow-origin": resolvedOrigin,
    "access-control-allow-credentials": "true",
    "access-control-allow-headers": "Content-Type,Authorization",
    "access-control-allow-methods": "GET,POST,DELETE,OPTIONS"
  };
  if (method === "OPTIONS") {
    return { statusCode: 200, headers: corsHeaders, body: JSON.stringify({ ok: true }) };
  }
  switch (method) {
    case "GET":
      return {
        statusCode: 200,
        headers: { ...corsHeaders, "content-type": "application/json" },
        body: JSON.stringify({ ok: true, session: parseSessionFromRequest(event) })
      };
    case "POST":
      if (!event.body) return badRequest("Missing body");
      const payload = JSON.parse(event.body);
      if (!payload.agencyId || !payload.email || !payload.role) {
        return badRequest("agencyId, email, role required");
      }
      const token = encodeSession({
        agencyId: payload.agencyId,
        agencyEmail: payload.email,
        role: payload.role,
        userId: payload.userId
      });
      const cookie = buildSessionCookie(token, secureCookie);
      return {
        statusCode: 200,
        headers: { ...corsHeaders, "content-type": "application/json", "set-cookie": cookie },
        body: JSON.stringify({ ok: true, session: payload })
      };
    case "DELETE":
      return {
        statusCode: 200,
        headers: { ...corsHeaders, "set-cookie": buildClearCookie(secureCookie) },
        body: JSON.stringify({ ok: true })
      };
    default:
      return badRequest(`Unsupported method ${method}`);
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  handler
});
//# sourceMappingURL=auth.js.map
