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

// infra/src/handlers/prompts.ts
var prompts_exports = {};
__export(prompts_exports, {
  handler: () => handler
});
module.exports = __toCommonJS(prompts_exports);

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
async function deleteItem(key) {
  await docClient.send(new import_lib_dynamodb2.DeleteCommand({ TableName: TABLE_NAME, Key: key }));
}

// infra/src/handlers/prompts.ts
var OPENAI_BASE = "https://api.openai.com";
var OPENAI_KEY = "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";
var MODEL = "gpt-4o-mini";
async function callOpenAI(messages) {
  if (!OPENAI_KEY) throw new Error("OpenAI key not configured");
  const res = await fetch(`${OPENAI_BASE}/v1/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENAI_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      temperature: 0.7
    })
  });
  const text = await res.text();
  if (!res.ok) {
    console.error("openai.error", { status: res.status, body: text });
    throw new Error(`OpenAI request failed (${res.status}): ${text || res.statusText}`);
  }
  try {
    const json = JSON.parse(text);
    return json?.choices?.[0]?.message?.content || "";
  } catch {
    return "";
  }
}
var handler = async (event) => {
  const origin = event.headers?.origin || event.headers?.Origin || event.headers?.["origin"] || "";
  const method = (event.requestContext.http?.method || "").toUpperCase();
  const path = event.rawPath || event.requestContext.http?.path || "";
  if (method === "OPTIONS") return response(200, { ok: true }, origin);
  const session = requireSession(event);
  if (!session?.agencyId) {
    return response(401, { ok: false, error: "Missing session" }, origin);
  }
  const agencyEmail = session.agencyEmail || "";
  if (method === "POST" && path.endsWith("/ai/intro")) {
    if (!event.body) return response(400, { ok: false, error: "Missing body" }, origin);
    const body = JSON.parse(event.body || "{}");
    const { sport, collegeName, coachMessage, tone, qualities = [], additionalInsights } = body;
    const systemMsg = `You are an expert college recruiting assistant. Write a concise, effective intro email for a high school athlete contacting a college coach. Keep it under 150 words.`;
    const userMsg = `
      Context:
      - Sport: ${sport || "Not specified"}
      - Target College: ${collegeName || "Not specified"}
      - Tone: ${tone || "Professional yet personal"}
      - Key Qualities to highlight: ${qualities.join(", ")}
      
      Instructions from User: ${coachMessage || "Write an intro."}
      
      Additional Data: ${additionalInsights || ""}
      
      Write the email body only. Do not include subject lines unless asked.
    `.trim();
    try {
      const intro = await callOpenAI([
        { role: "system", content: systemMsg },
        { role: "user", content: userMsg }
      ]);
      return response(200, { ok: true, intro }, origin);
    } catch (err) {
      console.error("AI Gen Error:", err);
      return response(500, { ok: false, error: "AI generation failed" }, origin);
    }
  }
  if (method === "GET" && path.endsWith("/prompts")) {
    const items = await queryByPK(`AGENCY#${session.agencyId}`, "PROMPT#");
    let prompts = (items || []).map((p) => ({
      id: p.id,
      agencyEmail: p.agencyEmail,
      clientId: p.clientId,
      name: p.name,
      text: p.text,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt
    }));
    const filterClientId = event.queryStringParameters?.clientId;
    if (filterClientId) {
      prompts = prompts.filter((p) => p.clientId === filterClientId);
    }
    return response(200, { ok: true, prompts }, origin);
  }
  if (method === "POST" && path.endsWith("/prompts")) {
    if (!event.body) return response(400, { ok: false, error: "Missing body" }, origin);
    const body = JSON.parse(event.body || "{}");
    let { name, text, clientId } = body;
    const id = body.id || newId("prompt");
    const now = Date.now();
    if (body.generate || !text) {
    }
    if (!name || !text) {
      return response(400, { ok: false, error: "name and text are required" }, origin);
    }
    const rec = {
      PK: `AGENCY#${session.agencyId}`,
      SK: `PROMPT#${id}`,
      GSI1PK: `EMAIL#${agencyEmail}`,
      GSI1SK: `PROMPT#${id}`,
      id,
      agencyEmail,
      clientId: clientId || null,
      name,
      text,
      createdAt: body.createdAt || now,
      // Preserve creation date on update
      updatedAt: now
    };
    await putItem(rec);
    return response(200, { ok: true, prompt: rec }, origin);
  }
  if (method === "DELETE" && /\/prompts\/[^/]+$/.test(path)) {
    const id = path.split("/").pop();
    if (!id) return response(400, { ok: false, error: "Missing id" }, origin);
    const existing = await getItem({ PK: `AGENCY#${session.agencyId}`, SK: `PROMPT#${id}` });
    if (existing) {
      await deleteItem({ PK: `AGENCY#${session.agencyId}`, SK: `PROMPT#${id}` });
    }
    return response(200, { ok: true }, origin);
  }
  return response(404, { ok: false, error: "Path not found" }, origin);
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  handler
});
//# sourceMappingURL=prompts.js.map
