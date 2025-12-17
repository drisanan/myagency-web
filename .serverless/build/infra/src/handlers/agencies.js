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
var SECRET = process.env.SESSION_SECRET || "dev-secret-change-me";
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
  if (!method) return response(400, { ok: false, error: "Missing method" }, origin);
  console.log("agencies handler start", { method, path: event.rawPath, qs: event.queryStringParameters });
  try {
    if (method === "OPTIONS") return response(200, { ok: true }, origin);
    if (method === "GET") {
      const email = event.queryStringParameters?.email;
      if (email) {
        const found = await queryGSI1(`EMAIL#${email}`, "AGENCY#");
        return response(200, { ok: true, agencies: found || [] }, origin);
      }
      return response(200, { ok: true, agencies: [] }, origin);
    }
    if (method === "PUT" && event.rawPath?.endsWith("/agencies/settings")) {
      if (!event.body) return response(400, { ok: false, error: "Missing body" }, origin);
      const parsed = JSON.parse(event.body || "{}");
      const email = parsed.email;
      if (!email) return response(400, { ok: false, error: "Missing email" }, origin);
      const existing = await queryGSI1(`EMAIL#${email}`, "AGENCY#");
      const agency = existing?.[0];
      if (!agency) return response(404, { ok: false, error: "Agency not found" }, origin);
      const updated = { ...agency, settings: parsed.settings || {} };
      await putItem(updated);
      console.log("agencies update settings", { email, settings: updated.settings });
      return response(200, { ok: true, settings: updated.settings }, origin);
    }
    if (method === "POST") {
      console.log("agencies POST start", { rawBody: event.body });
      const body = event.body ? JSON.parse(event.body) : {};
      if (!body.email || !body.name) {
        console.warn("agencies POST missing fields", { body });
        return response(400, { ok: false, error: "name and email are required" }, origin);
      }
      const rec = toRecord(body);
      try {
        await putItem(rec);
        console.log("agencies upsert success", { id: rec.id, email: rec.email, settings: rec.settings });
        return response(200, { ok: true, id: rec.id }, origin);
      } catch (err) {
        console.error("agencies upsert error", { error: err?.message, stack: err?.stack, id: rec.id, email: rec.email });
        return response(500, { ok: false, error: err?.message || "Failed to upsert agency" }, origin);
      }
    }
    if (method === "DELETE") {
      const id = event.queryStringParameters?.id;
      if (!id) return response(400, { ok: false, error: "Missing id" }, origin);
      const existing = await getItem({ PK: `AGENCY#${id}`, SK: "PROFILE" });
      if (!existing) return response(404, { ok: false, error: "Not found" }, origin);
      await putItem({ ...existing, deletedAt: (/* @__PURE__ */ new Date()).toISOString() });
      console.log("agencies soft-deleted", { id });
      return response(200, { ok: true }, origin);
    }
    return response(405, { ok: false, error: `Method not allowed` }, origin);
  } catch (e) {
    console.error("agencies handler error", { error: e?.message, stack: e?.stack });
    return response(500, { ok: false, error: e?.message || "Server error" }, origin);
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  handler
});
//# sourceMappingURL=agencies.js.map
