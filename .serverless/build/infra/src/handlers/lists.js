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

// infra/src/handlers/lists.ts
var lists_exports = {};
__export(lists_exports, {
  handler: () => handler
});
module.exports = __toCommonJS(lists_exports);

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

// infra/src/lib/ids.ts
function newId(prefix) {
  const rand = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  return `${prefix}-${rand}`.replace(/[^a-zA-Z0-9-_]/g, "");
}

// infra/src/lib/dynamo.ts
var import_lib_dynamodb2 = require("@aws-sdk/lib-dynamodb");
var TABLE_NAME = process.env.TABLE_NAME || "agency-narrative-crm";
async function putItem(item) {
  await docClient.send(new import_lib_dynamodb2.PutCommand({ TableName: TABLE_NAME, Item: item }));
  return item;
}
async function getItem(key) {
  const res = await docClient.send(new import_lib_dynamodb2.GetCommand({ TableName: TABLE_NAME, Key: key }));
  return res.Item;
}
async function queryByPK(PK, beginsWith) {
  const res = await docClient.send(
    new import_lib_dynamodb2.QueryCommand({
      TableName: TABLE_NAME,
      KeyConditionExpression: beginsWith ? "PK = :pk AND begins_with(SK, :sk)" : "PK = :pk",
      ExpressionAttributeValues: beginsWith ? { ":pk": PK, ":sk": beginsWith } : { ":pk": PK }
    })
  );
  return res.Items ?? [];
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

// infra/src/handlers/lists.ts
function badRequest(origin, msg) {
  return response(400, { ok: false, error: msg }, origin);
}
function getListId(event) {
  return event.pathParameters?.id;
}
var handler = async (event) => {
  const origin = event.headers?.origin || event.headers?.Origin || event.headers?.["origin"] || "";
  const method = (event.requestContext.http?.method || "").toUpperCase();
  if (!method) return response(400, { ok: false, error: "Missing method" }, origin);
  if (method === "OPTIONS") return response(200, { ok: true }, origin);
  const session = requireSession(event);
  if (!session) return response(401, { ok: false, error: "Missing session" }, origin);
  const listId = getListId(event);
  if (method === "GET") {
    if (listId) {
      const item = await getItem({ PK: `AGENCY#${session.agencyId}`, SK: `LIST#${listId}` });
      return response(200, { ok: true, list: item ?? null }, origin);
    }
    const items = await queryByPK(`AGENCY#${session.agencyId}`, "LIST#");
    const filtered = session.role === "client" ? items.filter((i) => i.clientId === session.clientId && i.type === "CLIENT_INTEREST") : items;
    return response(200, { ok: true, lists: filtered }, origin);
  }
  if (method === "POST") {
    if (!event.body) return badRequest(origin, "Missing body");
    const payload = JSON.parse(event.body);
    if (!payload.name) return badRequest(origin, "name is required");
    if (payload.items && !Array.isArray(payload.items)) return badRequest(origin, "items must be an array");
    if (session.role === "client") {
      payload.type = "CLIENT_INTEREST";
      payload.clientId = session.clientId;
      payload.items = Array.isArray(payload.items) ? payload.items.filter((i) => i && i.university) : [];
    }
    const id = payload.id || newId("list");
    const now = Date.now();
    const rec = {
      PK: `AGENCY#${session.agencyId}`,
      SK: `LIST#${id}`,
      id,
      name: payload.name,
      items: payload.items ?? [],
      agencyId: session.agencyId,
      agencyEmail: session.agencyEmail,
      clientId: payload.clientId,
      type: payload.type,
      createdAt: now,
      updatedAt: now
    };
    await putItem(rec);
    return response(200, { ok: true, list: rec }, origin);
  }
  if (method === "PUT" || method === "PATCH") {
    if (!listId) return badRequest(origin, "Missing list id");
    if (!event.body) return badRequest(origin, "Missing body");
    const payload = JSON.parse(event.body);
    const existing = await getItem({ PK: `AGENCY#${session.agencyId}`, SK: `LIST#${listId}` });
    if (!existing) return response(404, { ok: false, message: "Not found" }, origin);
    const now = Date.now();
    const merged = { ...existing, ...payload, updatedAt: now };
    await putItem(merged);
    return response(200, { ok: true, list: merged }, origin);
  }
  if (method === "DELETE") {
    if (!listId) return response(400, { ok: false, error: "Missing list id" }, origin);
    const existing = await getItem({ PK: `AGENCY#${session.agencyId}`, SK: `LIST#${listId}` });
    if (existing) {
      await putItem({
        ...existing,
        // Keep the name and items!
        deletedAt: (/* @__PURE__ */ new Date()).toISOString()
      });
    } else {
    }
    return response(200, { ok: true }, origin);
  }
  return response(405, { ok: false, error: `Method not allowed` }, origin);
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  handler
});
//# sourceMappingURL=lists.js.map
