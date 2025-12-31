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

// infra/src/handlers/profile-public.ts
var profile_public_exports = {};
__export(profile_public_exports, {
  handler: () => handler
});
module.exports = __toCommonJS(profile_public_exports);

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
var DEBUG_SESSION = process.env.DEBUG_SESSION === "true";

// infra/src/lib/dynamo.ts
var TABLE_NAME = process.env.TABLE_NAME || "agency-narrative-crm";
async function queryGSI3(GSI3PK, beginsWith) {
  const res = await docClient.send(
    new import_lib_dynamodb2.QueryCommand({
      TableName: TABLE_NAME,
      IndexName: "GSI3",
      KeyConditionExpression: beginsWith ? "GSI3PK = :g3pk AND begins_with(GSI3SK, :g3sk)" : "GSI3PK = :g3pk",
      ExpressionAttributeValues: beginsWith ? { ":g3pk": GSI3PK, ":g3sk": beginsWith } : { ":g3pk": GSI3PK }
    })
  );
  return res.Items ?? [];
}
async function scanByGSI3PK(GSI3PK) {
  const params = {
    TableName: TABLE_NAME,
    FilterExpression: "GSI3PK = :g3pk",
    ExpressionAttributeValues: { ":g3pk": GSI3PK }
  };
  const res = await docClient.send(new import_lib_dynamodb2.ScanCommand(params));
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

// infra/src/handlers/profile-public.ts
var handler = async (event) => {
  const origin = event.headers?.origin || event.headers?.Origin || "*";
  const method = (event.requestContext.http?.method || "").toUpperCase();
  const path = event.rawPath || "";
  if (method === "OPTIONS") return response(200, { ok: true }, origin);
  if (method === "GET" && path.includes("/check-username")) {
    const username = event.queryStringParameters?.username?.toLowerCase().replace(/[^a-z0-9-]/g, "");
    if (!username || username.length < 3) {
      return response(400, { ok: false, error: "Username must be at least 3 characters", available: false }, origin);
    }
    const reserved = ["admin", "athlete", "agency", "api", "auth", "client", "dashboard", "help", "login", "profile", "settings", "support", "www"];
    if (reserved.includes(username)) {
      return response(200, { ok: true, available: false, reason: "reserved" }, origin);
    }
    try {
      let existing = [];
      try {
        existing = await queryGSI3(`USERNAME#${username}`);
      } catch (e) {
        if (e.name === "ValidationException" || e.message?.includes("GSI3")) {
          existing = await scanByGSI3PK(`USERNAME#${username}`);
        } else {
          throw e;
        }
      }
      return response(200, { ok: true, available: existing.length === 0 }, origin);
    } catch (e) {
      console.error("[profile-public] check-username error:", e);
      return response(500, { ok: false, error: "Failed to check username" }, origin);
    }
  }
  if (method === "GET") {
    const username = event.pathParameters?.username?.toLowerCase();
    if (!username) {
      return response(400, { ok: false, error: "Username is required" }, origin);
    }
    try {
      let items = [];
      try {
        items = await queryGSI3(`USERNAME#${username}`);
      } catch (e) {
        if (e.name === "ValidationException" || e.message?.includes("GSI3")) {
          items = await scanByGSI3PK(`USERNAME#${username}`);
        } else {
          throw e;
        }
      }
      if (items.length === 0) {
        return response(404, { ok: false, error: "Profile not found" }, origin);
      }
      const client2 = items[0];
      const publicProfile = {
        id: client2.id,
        username: client2.username,
        firstName: client2.firstName,
        lastName: client2.lastName,
        sport: client2.sport,
        phone: client2.phone,
        email: client2.email,
        galleryImages: client2.galleryImages || [],
        radar: client2.radar || {}
        // Don't expose: accessCodeHash, authEnabled, agencyId, agencyEmail, PK, SK, GSI keys
      };
      return response(200, { ok: true, profile: publicProfile }, origin);
    } catch (e) {
      console.error("[profile-public] fetch error:", e);
      return response(500, { ok: false, error: "Failed to fetch profile" }, origin);
    }
  }
  return response(405, { ok: false, error: "Method not allowed" }, origin);
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  handler
});
//# sourceMappingURL=profile-public.js.map
