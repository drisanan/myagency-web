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

// infra/src/handlers/common.ts
var import_client_dynamodb = require("@aws-sdk/client-dynamodb");
var import_lib_dynamodb = require("@aws-sdk/lib-dynamodb");

// infra/src/lib/session.ts
var SECRET = process.env.SESSION_SECRET || "dev-secret-change-me";

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
function ok(body) {
  return jsonResponse(200, body);
}

// infra/src/handlers/agencies.ts
var SEED_AGENCIES = [
  { id: "agency-001", name: "Prime Sports", email: "agency1@an.test", settings: { primaryColor: "#1976d2" } },
  { id: "agency-002", name: "NextGen", email: "agency2@an.test", settings: { primaryColor: "#9c27b0" } },
  { id: "agency-003", name: "Elite Edge", email: "agency3@an.test", settings: { primaryColor: "#2e7d32" } }
];
var handler = async (event) => {
  const method = event.requestContext.http?.method?.toUpperCase();
  if (!method) return badRequest("Missing method");
  if (method === "GET") {
    const email = event.queryStringParameters?.email;
    if (email) {
      const found = SEED_AGENCIES.find((a) => a.email === email);
      return ok({ ok: true, agencies: found ? [found] : [] });
    }
    return ok({ ok: true, agencies: SEED_AGENCIES });
  }
  if (method === "PUT" && event.rawPath?.endsWith("/agencies/settings")) {
    return ok({ ok: true, settings: JSON.parse(event.body || "{}")?.settings ?? {} });
  }
  if (method === "POST") {
    const body = event.body ? JSON.parse(event.body) : {};
    const id = body.id || `agency-${Math.random().toString(36).slice(2, 8)}`;
    return ok({ ok: true, id });
  }
  if (method === "DELETE") {
    return ok({ ok: true });
  }
  return badRequest(`Unsupported method ${method}`);
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  handler
});
//# sourceMappingURL=agencies.js.map
