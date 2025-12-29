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

// infra/src/handlers/agencies.ts
var agencies_exports = {};
__export(agencies_exports, {
  handler: () => handler
});
module.exports = __toCommonJS(agencies_exports);

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

// infra/src/lib/dynamo.ts
var import_lib_dynamodb2 = require("@aws-sdk/lib-dynamodb");

// infra/src/handlers/common.ts
var import_client_dynamodb = require("@aws-sdk/client-dynamodb");
var import_lib_dynamodb = require("@aws-sdk/lib-dynamodb");

// infra/src/lib/session.ts
var import_crypto = require("crypto");
var SECRET = process.env.SESSION_SECRET || "dev-secret-change-me";
var COOKIE_NAME = "an_session";
var COOKIE_DOMAIN = process.env.COOKIE_DOMAIN || ".myrecruiteragency.com";
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
function readCookieString(event) {
  if (event.cookies && event.cookies.length > 0) {
    return event.cookies.join("; ");
  }
  return event.headers.cookie || event.headers.Cookie;
}
function parseSessionFromRequest(event) {
  const cookieHeader = readCookieString(event);
  const cookies = parseCookie(cookieHeader);
  const token = cookies[COOKIE_NAME];
  return parseSession(token);
}

// infra/src/handlers/common.ts
var client = new import_client_dynamodb.DynamoDBClient({});
var docClient = import_lib_dynamodb.DynamoDBDocumentClient.from(client);
var DEBUG_SESSION = process.env.DEBUG_SESSION === "true";
function getSession(event) {
  const origin = event.headers?.origin || event.headers?.Origin || event.headers?.["origin"] || "";
  const parsed = parseSessionFromRequest(event);
  if (DEBUG_SESSION) {
    console.log("session_debug", {
      origin,
      hasCookiesArray: Array.isArray(event.cookies) && event.cookies.length > 0,
      hasCookieHeader: Boolean(event.headers?.cookie || event.headers?.Cookie),
      session: parsed,
      method: event.requestContext?.http?.method,
      path: event.rawPath
    });
  }
  if (parsed) return parsed;
  const agencyId = event.headers["x-agency-id"] || event.headers["X-Agency-Id"];
  const agencyEmail = event.headers["x-agency-email"] || event.headers["X-Agency-Email"];
  const role = event.headers["x-role"] || "agency";
  if (!agencyId) return null;
  const fallback = { agencyId, agencyEmail, role };
  if (DEBUG_SESSION) {
    console.log("session_debug_fallback", { origin, fallback });
  }
  return fallback;
}
function requireSession(event) {
  return getSession(event);
}

// infra/src/lib/dynamo.ts
var TABLE_NAME = process.env.TABLE_NAME || "agency-narrative-crm";
function normalizeCreatedAt(item) {
  if (!item) return item;
  const ca = item.createdAt;
  if (typeof ca === "string") {
    const num = Number(ca) || Date.parse(ca) || Date.now();
    item.createdAt = num;
  }
  return item;
}
async function putItem(item) {
  normalizeCreatedAt(item);
  await docClient.send(new import_lib_dynamodb2.PutCommand({ TableName: TABLE_NAME, Item: item }));
  return item;
}
async function getItem(key) {
  const res = await docClient.send(new import_lib_dynamodb2.GetCommand({ TableName: TABLE_NAME, Key: key }));
  return res.Item;
}
async function queryGSI1(GSI1PK, beginsWith) {
  const res = await docClient.send(
    new import_lib_dynamodb2.QueryCommand({
      TableName: TABLE_NAME,
      IndexName: "GSI1",
      KeyConditionExpression: beginsWith ? "GSI1PK = :g1pk AND begins_with(GSI1SK, :g1sk)" : "GSI1PK = :g1pk",
      ExpressionAttributeValues: beginsWith ? { ":g1pk": GSI1PK, ":g1sk": beginsWith } : { ":g1pk": GSI1PK }
    })
  );
  return res.Items ?? [];
}

// infra/src/lib/ids.ts
function newId(prefix) {
  const rand = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  return `${prefix}-${rand}`.replace(/[^a-zA-Z0-9-_]/g, "");
}

// infra/src/handlers/agencies.ts
function toRecord(input) {
  const id = input.id || newId("agency");
  return {
    PK: `AGENCY#${id}`,
    SK: "PROFILE",
    GSI1PK: `EMAIL#${input.email}`,
    GSI1SK: `AGENCY#${id}`,
    id,
    name: input.name || "New Agency",
    email: input.email || "",
    settings: input.settings
  };
}
var handler = async (event) => {
  const origin = event.headers?.origin || event.headers?.Origin || event.headers?.["origin"] || "";
  const method = (event.requestContext.http?.method || "").toUpperCase();
  if (method === "OPTIONS") return response(200, { ok: true }, origin);
  if (!method) return response(400, { ok: false, error: "Missing method" }, origin);
  console.log("agencies handler start", { method, path: event.rawPath });
  try {
    const session = requireSession(event);
    if (method === "GET") {
      if (!session) {
        return response(401, { ok: false, error: "Missing session" }, origin);
      }
      const found = await queryGSI1(`EMAIL#${session.agencyEmail}`, "AGENCY#");
      return response(200, { ok: true, agencies: found || [] }, origin);
    }
    if (method === "PUT" && event.rawPath?.endsWith("/agencies/settings")) {
      if (!session) return response(401, { ok: false, error: "Unauthorized" }, origin);
      if (!event.body) return response(400, { ok: false, error: "Missing body" }, origin);
      const parsed = JSON.parse(event.body || "{}");
      const email = session.agencyEmail;
      const existing = await queryGSI1(`EMAIL#${email}`, "AGENCY#");
      const agency = existing?.[0];
      if (!agency) return response(404, { ok: false, error: "Agency not found" }, origin);
      const updated = { ...agency, settings: parsed.settings || {} };
      await putItem(updated);
      console.log("agencies update settings", { email, settings: updated.settings });
      return response(200, { ok: true, settings: updated.settings }, origin);
    }
    if (method === "POST") {
      const body = event.body ? JSON.parse(event.body) : {};
      if (body.id && session && body.id !== session.agencyId) {
        return response(403, { ok: false, error: "Cannot update another agency" }, origin);
      }
      if (!body.email || !body.name) {
        return response(400, { ok: false, error: "name and email are required" }, origin);
      }
      const rec = toRecord(body);
      try {
        await putItem(rec);
        return response(200, { ok: true, id: rec.id }, origin);
      } catch (err) {
        console.error("agencies upsert error", { error: err?.message });
        return response(500, { ok: false, error: "Failed to upsert agency" }, origin);
      }
    }
    if (method === "DELETE") {
      if (!session) return response(401, { ok: false, error: "Unauthorized" }, origin);
      const idToDelete = event.pathParameters?.id || event.queryStringParameters?.id;
      if (idToDelete !== session.agencyId) {
        return response(403, { ok: false, error: "Cannot delete another agency" }, origin);
      }
      const existing = await getItem({ PK: `AGENCY#${session.agencyId}`, SK: "PROFILE" });
      if (!existing) return response(404, { ok: false, error: "Not found" }, origin);
      await putItem({ ...existing, deletedAt: (/* @__PURE__ */ new Date()).toISOString() });
      console.log("agencies soft-deleted", { id: session.agencyId });
      return response(200, { ok: true }, origin);
    }
    return response(405, { ok: false, error: `Method not allowed` }, origin);
  } catch (e) {
    console.error("agencies handler error", { error: e?.message });
    return response(500, { ok: false, error: "Server error" }, origin);
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  handler
});
//# sourceMappingURL=agencies.js.map
