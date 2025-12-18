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

// infra/src/handlers/forms-public.ts
var forms_public_exports = {};
__export(forms_public_exports, {
  consumeFormSubmissions: () => consumeFormSubmissions,
  getFormAgency: () => getFormAgency,
  issueFormToken: () => issueFormToken,
  listFormSubmissions: () => listFormSubmissions,
  submitForm: () => submitForm
});
module.exports = __toCommonJS(forms_public_exports);
var API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.API_BASE_URL;
function requireApiBase() {
  if (!API_BASE_URL) throw new Error("API_BASE_URL is not configured");
  return API_BASE_URL;
}
async function apiFetch(path, init) {
  const base = requireApiBase();
  if (typeof fetch === "undefined") {
    throw new Error("fetch is not available");
  }
  const headers = {
    "Content-Type": "application/json",
    ...init?.headers
  };
  const url = `${base}${path}`;
  const options = {
    ...init,
    headers,
    credentials: "include"
    // <--- Key for session persistence
  };
  console.log("[forms.apiFetch]", {
    url,
    method: options.method || "GET",
    hasBody: Boolean(options.body),
    credentials: options.credentials
  });
  const res = await fetch(url, options);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API ${path} failed: ${res.status} ${text}`);
  }
  return res.json();
}
async function issueFormToken(agencyEmail) {
  const data = await apiFetch("/forms/issue", {
    method: "POST",
    body: JSON.stringify({ agencyEmail })
  });
  return data;
}
async function getFormAgency(token) {
  const qs = new URLSearchParams({ token }).toString();
  const data = await apiFetch(`/forms/agency?${qs}`);
  return data?.agency;
}
async function submitForm(token, form) {
  const data = await apiFetch("/forms/submit", {
    method: "POST",
    body: JSON.stringify({ token, form })
  });
  return data;
}
async function listFormSubmissions(agencyEmail) {
  const qs = new URLSearchParams({ agencyEmail }).toString();
  const data = await apiFetch(`/forms/submissions?${qs}`);
  return data?.items ?? [];
}
async function consumeFormSubmissions(agencyEmail, ids) {
  await apiFetch("/forms/consume", {
    method: "POST",
    body: JSON.stringify({ agencyEmail, ids })
  });
  return { ok: true };
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  consumeFormSubmissions,
  getFormAgency,
  issueFormToken,
  listFormSubmissions,
  submitForm
});
//# sourceMappingURL=forms-public.js.map
