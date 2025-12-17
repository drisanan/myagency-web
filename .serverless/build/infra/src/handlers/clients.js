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

// infra/src/handlers/clients.ts
var clients_exports = {};
__export(clients_exports, {
  handler: () => handler
});
module.exports = __toCommonJS(clients_exports);

// infra/src/handlers/common.ts
var import_client_dynamodb = require("@aws-sdk/client-dynamodb");
var import_lib_dynamodb = require("@aws-sdk/lib-dynamodb");

// infra/src/lib/session.ts
var import_crypto = require("crypto");
var SECRET = process.env.SESSION_SECRET || "dev-secret-change-me";
var COOKIE_NAME = "an_session";
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
function parseSessionFromRequest(event) {
  const cookieHeader = event.headers.cookie || event.headers.Cookie;
  const cookies = parseCookie(cookieHeader);
  const token = cookies[COOKIE_NAME];
  return parseSession(token);
}

// infra/src/handlers/common.ts
var client = new import_client_dynamodb.DynamoDBClient({});
var docClient = import_lib_dynamodb.DynamoDBDocumentClient.from(client);
function getSession(event) {
  const parsed = parseSessionFromRequest(event);
  if (parsed) return parsed;
  const agencyId = event.headers["x-agency-id"] || event.headers["X-Agency-Id"];
  const agencyEmail = event.headers["x-agency-email"] || event.headers["X-Agency-Email"];
  const role = event.headers["x-role"] || "agency";
  if (!agencyId) return null;
  return { agencyId, agencyEmail, role };
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

// infra/src/handlers/clients.ts
function getClientId(event) {
  return event.pathParameters?.id;
}
var handler = async (event) => {
  const origin = event.headers?.origin || event.headers?.Origin || event.headers?.["origin"] || "";
  const method = (event.requestContext.http?.method || "").toUpperCase();
  if (!method) return response(400, { ok: false, error: "Missing method" }, origin);
  if (method === "OPTIONS") return response(200, { ok: true }, origin);
  const session = requireSession(event);
  if (!session) return response(401, { ok: false, error: "Missing session (x-agency-id header expected for now)" }, origin);
  const clientId = getClientId(event);
  if (method === "GET") {
    if (clientId) {
      const item = await getItem({ PK: `AGENCY#${session.agencyId}`, SK: `CLIENT#${clientId}` });
      return response(200, { ok: true, client: item ?? null }, origin);
    }
    const items = await queryByPK(`AGENCY#${session.agencyId}`, "CLIENT#");
    return response(200, { ok: true, clients: items }, origin);
  }
  if (method === "POST") {
    if (!event.body) return response(400, { ok: false, error: "Missing body" }, origin);
    const payload = JSON.parse(event.body);
    const id = payload.id || newId("client");
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const rec = {
      PK: `AGENCY#${session.agencyId}`,
      SK: `CLIENT#${id}`,
      GSI1PK: `EMAIL#${payload.email}`,
      GSI1SK: `CLIENT#${id}`,
      id,
      email: payload.email,
      firstName: payload.firstName,
      lastName: payload.lastName,
      sport: payload.sport,
      agencyId: session.agencyId,
      agencyEmail: session.agencyEmail,
      createdAt: now,
      updatedAt: now
    };
    await putItem(rec);
    return response(200, { ok: true, client: rec }, origin);
  }
  if (method === "PUT" || method === "PATCH") {
    if (!clientId) return response(400, { ok: false, error: "Missing client id" }, origin);
    if (!event.body) return response(400, { ok: false, error: "Missing body" }, origin);
    const payload = JSON.parse(event.body);
    const existing = await getItem({ PK: `AGENCY#${session.agencyId}`, SK: `CLIENT#${clientId}` });
    if (!existing) return response(404, { ok: false, message: "Not found" }, origin);
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const merged = { ...existing, ...payload, updatedAt: now };
    await putItem(merged);
    return response(200, { ok: true, client: merged }, origin);
  }
  if (method === "DELETE") {
    if (!clientId) return response(400, { ok: false, error: "Missing client id" }, origin);
    await putItem({
      PK: `AGENCY#${session.agencyId}`,
      SK: `CLIENT#${clientId}`,
      deletedAt: (/* @__PURE__ */ new Date()).toISOString()
    });
    return response(200, { ok: true }, origin);
  }
  return response(405, { ok: false, error: `Method not allowed` }, origin);
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  handler
});
//# sourceMappingURL=clients.js.map
