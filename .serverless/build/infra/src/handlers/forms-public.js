"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
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
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// infra/src/handlers/forms-public.ts
var forms_public_exports = {};
__export(forms_public_exports, {
  handler: () => handler
});
module.exports = __toCommonJS(forms_public_exports);

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

// infra/src/lib/ids.ts
function newId(prefix) {
  const rand = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  return `${prefix}-${rand}`.replace(/[^a-zA-Z0-9-_]/g, "");
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

// infra/src/lib/formsToken.ts
var import_crypto2 = __toESM(require("crypto"));
var ALG = "sha256";
var SECRET2 = process.env.FORMS_SECRET || "dev-forms-secret-change-me";
var enc = (o) => Buffer.from(JSON.stringify(o)).toString("base64url");
function sign(payload) {
  const header = { alg: "HS256", typ: "JWT" };
  const head = enc(header);
  const body = enc(payload);
  const hmac = import_crypto2.default.createHmac(ALG, SECRET2).update(`${head}.${body}`).digest("base64url");
  return `${head}.${body}.${hmac}`;
}
function verify2(token) {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [head, body, sig] = parts;
  const hmac = import_crypto2.default.createHmac(ALG, SECRET2).update(`${head}.${body}`).digest("base64url");
  if (hmac !== sig) return null;
  try {
    const json = JSON.parse(Buffer.from(body, "base64url").toString("utf-8"));
    if (json.exp && Date.now() > Number(json.exp)) return null;
    return json;
  } catch {
    return null;
  }
}

// infra/src/handlers/forms-public.ts
var handler = async (event) => {
  const origin = event.headers?.origin || event.headers?.Origin || event.headers?.["origin"] || "";
  const method = (event.requestContext.http?.method || "").toUpperCase();
  const path = event.rawPath || event.requestContext.http?.path || "";
  if (method === "OPTIONS") return response(200, { ok: true }, origin);
  if (method === "GET" && path.endsWith("/forms/agency")) {
    const token = event.queryStringParameters?.token;
    if (!token) return response(400, { ok: false, error: "Missing token" }, origin);
    const payload = verify2(token);
    if (!payload?.agencyEmail) {
      return response(400, { ok: false, error: "Invalid or expired token" }, origin);
    }
    const agencies = await queryGSI1(`EMAIL#${payload.agencyEmail}`, "AGENCY#");
    const agency = agencies?.[0];
    if (!agency) return response(404, { ok: false, error: "Agency not found" }, origin);
    return response(200, {
      ok: true,
      agency: {
        name: agency.name,
        email: agency.email,
        settings: agency.settings || {}
      }
    }, origin);
  }
  if (method === "POST" && path.endsWith("/forms/submit")) {
    if (!event.body) return response(400, { ok: false, error: "Missing body" }, origin);
    const body = JSON.parse(event.body);
    const { token, form } = body;
    if (!token || !form) return response(400, { ok: false, error: "Missing token or form data" }, origin);
    const payload = verify2(token);
    if (!payload?.agencyEmail) return response(400, { ok: false, error: "Invalid or expired token" }, origin);
    const agencies = await queryGSI1(`EMAIL#${payload.agencyEmail}`, "AGENCY#");
    const agency = agencies?.[0];
    if (!agency) return response(404, { ok: false, error: "Agency not found" }, origin);
    const id = newId("form");
    const now = Date.now();
    const submission = {
      PK: `AGENCY#${agency.id}`,
      SK: `FORM#${id}`,
      id,
      createdAt: now,
      consumed: false,
      agencyEmail: agency.email,
      data: form
    };
    await putItem(submission);
    return response(200, { ok: true, id }, origin);
  }
  const ensureSession = () => {
    const s = requireSession(event);
    if (!s) throw new Error("Unauthorized");
    return s;
  };
  try {
    if (method === "POST" && path.endsWith("/forms/issue")) {
      const session = ensureSession();
      const payload = {
        agencyEmail: session.agencyEmail,
        iat: Date.now(),
        exp: Date.now() + 1e3 * 60 * 60 * 24 * 30
        // 30 days
      };
      const token = sign(payload);
      const frontendHost = process.env.FRONTEND_URL || "www.myrecruiteragency.com";
      const base = frontendHost.startsWith("http") ? frontendHost : `https://${frontendHost}`;
      const url = `${base}/forms/${token}`;
      return response(200, { ok: true, token, url }, origin);
    }
    if (method === "GET" && path.endsWith("/forms/submissions")) {
      const session = ensureSession();
      const items = await queryByPK(`AGENCY#${session.agencyId}`, "FORM#");
      const pending = (items || []).filter((s) => !s.consumed);
      return response(200, { ok: true, items: pending }, origin);
    }
    if (method === "POST" && path.endsWith("/forms/consume")) {
      const session = ensureSession();
      if (!event.body) return response(400, { ok: false, error: "Missing body" }, origin);
      const { ids } = JSON.parse(event.body);
      if (!Array.isArray(ids)) return response(400, { ok: false, error: "ids must be array" }, origin);
      for (const id of ids) {
        const item = await getItem({ PK: `AGENCY#${session.agencyId}`, SK: `FORM#${id}` });
        if (item) {
          await putItem({ ...item, consumed: true });
        }
      }
      return response(200, { ok: true }, origin);
    }
  } catch (error) {
    if (error.message === "Unauthorized") {
      return response(401, { ok: false, error: "Missing session" }, origin);
    }
    console.error("Handler Error", error);
    return response(500, { ok: false, error: "Internal Server Error" }, origin);
  }
  return response(404, { ok: false, error: "Path not found" }, origin);
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  handler
});
//# sourceMappingURL=forms-public.js.map
