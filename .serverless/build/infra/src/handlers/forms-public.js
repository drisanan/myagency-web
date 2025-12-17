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

// infra/src/lib/formsToken.ts
var import_crypto = __toESM(require("crypto"));
var ALG = "sha256";
var SECRET = process.env.FORMS_SECRET || "dev-forms-secret-change-me";
var enc = (o) => Buffer.from(JSON.stringify(o)).toString("base64url");
function sign(payload) {
  const header = { alg: "HS256", typ: "JWT" };
  const head = enc(header);
  const body = enc(payload);
  const hmac = import_crypto.default.createHmac(ALG, SECRET).update(`${head}.${body}`).digest("base64url");
  return `${head}.${body}.${hmac}`;
}
function verify(token) {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [head, body, sig] = parts;
  const hmac = import_crypto.default.createHmac(ALG, SECRET).update(`${head}.${body}`).digest("base64url");
  if (hmac !== sig) return null;
  try {
    const json = JSON.parse(Buffer.from(body, "base64url").toString("utf-8"));
    if (json.exp && Date.now() > Number(json.exp)) return null;
    return json;
  } catch {
    return null;
  }
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
var SECRET2 = process.env.SESSION_SECRET || "dev-secret-change-me";
var COOKIE_DOMAIN = process.env.COOKIE_DOMAIN || ".myrecruiteragency.com";

// infra/src/handlers/common.ts
var client = new import_client_dynamodb.DynamoDBClient({});
var docClient = import_lib_dynamodb.DynamoDBDocumentClient.from(client);

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

// infra/src/handlers/forms-public.ts
var handler = async (event) => {
  const method = (event.requestContext.http?.method || "").toUpperCase();
  const path = event.requestContext.http?.path || "";
  const originHdr = event.headers["origin"] || event.headers["Origin"] || event.headers["origin"] || "";
  const host = event.headers["x-forwarded-host"] || event.headers["Host"] || "";
  const proto = event.headers["x-forwarded-proto"] || "https";
  const resolvedOrigin = originHdr || `${proto}://${host}`;
  if (!method) return response(400, { ok: false, message: "Missing method" }, resolvedOrigin);
  if (method === "OPTIONS") {
    return response(200, { ok: true }, resolvedOrigin);
  }
  if (method === "POST" && path.endsWith("/forms/issue")) {
    if (!event.body) return response(400, { ok: false, error: "Missing body" }, resolvedOrigin);
    const { agencyEmail } = JSON.parse(event.body);
    if (!agencyEmail) return response(400, { ok: false, error: "Missing agencyEmail" }, resolvedOrigin);
    const payload = {
      agencyEmail,
      iat: Date.now(),
      exp: Date.now() + 1e3 * 60 * 60 * 24 * 30
    };
    const token = sign(payload);
    const url = `${resolvedOrigin}/forms/${token}`;
    return response(200, { ok: true, token, url }, resolvedOrigin);
  }
  if (method === "GET" && path.endsWith("/forms/agency")) {
    const token = (event.queryStringParameters?.token || "").trim();
    const payload = verify(token);
    if (!payload?.agencyEmail) return response(400, { ok: false, error: "Invalid token" }, resolvedOrigin);
    const byEmail = await queryGSI1(`EMAIL#${payload.agencyEmail}`, "AGENCY#");
    const agency = (byEmail || [])[0];
    if (!agency) return response(404, { ok: false, error: "Agency not found" }, resolvedOrigin);
    return response(200, {
      ok: true,
      agency: {
        name: agency.name,
        email: agency.email,
        settings: agency.settings || {}
      }
    }, resolvedOrigin);
  }
  if (method === "POST" && path.endsWith("/forms/submit")) {
    if (!event.body) return response(400, { ok: false, error: "Missing body" }, resolvedOrigin);
    const body = JSON.parse(event.body || "{}");
    const token = (body.token || "").trim();
    const form = body.form || {};
    const payload = verify(token);
    if (!payload?.agencyEmail) return response(400, { ok: false, error: "Invalid token" }, resolvedOrigin);
    const safeForm = form || {};
    const id = newId("form");
    const rec = {
      PK: `AGENCY#${payload.agencyEmail}`,
      SK: `FORM#${id}`,
      id,
      createdAt: Date.now(),
      consumed: false,
      agencyEmail: payload.agencyEmail,
      data: {
        email: safeForm.email || "",
        phone: safeForm.phone || "",
        password: safeForm.password || "",
        firstName: safeForm.firstName || "",
        lastName: safeForm.lastName || "",
        sport: safeForm.sport || "",
        division: safeForm.division || "",
        graduationYear: safeForm.graduationYear || "",
        profileImageUrl: safeForm.profileImageUrl || "",
        radar: safeForm.radar || {}
      }
    };
    await putItem(rec);
    return response(200, { ok: true, id }, resolvedOrigin);
  }
  if (method === "GET" && path.endsWith("/forms/submissions")) {
    const agencyEmail = (event.queryStringParameters?.agencyEmail || "").trim();
    if (!agencyEmail) return response(400, { ok: false, error: "Missing agencyEmail" }, resolvedOrigin);
    const items = await queryByPK(`AGENCY#${agencyEmail}`, "FORM#");
    const pending = (items || []).filter((i) => !i.consumed);
    return response(200, { ok: true, items: pending }, resolvedOrigin);
  }
  if (method === "POST" && path.endsWith("/forms/consume")) {
    if (!event.body) return response(400, { ok: false, error: "Missing body" }, resolvedOrigin);
    const { agencyEmail, ids } = JSON.parse(event.body || "{}");
    if (!agencyEmail || !Array.isArray(ids)) return response(400, { ok: false, error: "Missing parameters" }, resolvedOrigin);
    for (const id of ids) {
      const item = await getItem({ PK: `AGENCY#${agencyEmail}`, SK: `FORM#${id}` });
      if (item) await putItem({ ...item, consumed: true });
    }
    return response(200, { ok: true }, resolvedOrigin);
  }
  return response(400, { ok: false, message: `Unsupported path ${path}` }, resolvedOrigin);
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  handler
});
//# sourceMappingURL=forms-public.js.map
