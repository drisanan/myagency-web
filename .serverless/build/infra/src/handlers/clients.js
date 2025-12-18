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
  createClient: () => createClient,
  deleteClient: () => deleteClient,
  getClient: () => getClient,
  listClients: () => listClients,
  updateClient: () => updateClient
});
module.exports = __toCommonJS(clients_exports);
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
    // <--- THIS FIXES THE 401 "MISSING SESSION"
  };
  console.log("[clients.apiFetch]", {
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
async function listClients() {
  const data = await apiFetch("/clients");
  return data?.clients ?? [];
}
async function getClient(id) {
  const data = await apiFetch(`/clients/${id}`);
  return data?.client;
}
async function createClient(input) {
  const data = await apiFetch("/clients", {
    method: "POST",
    body: JSON.stringify(input)
  });
  return data?.client;
}
async function updateClient(id, patch) {
  const data = await apiFetch(`/clients/${id}`, {
    method: "PATCH",
    body: JSON.stringify(patch)
  });
  return data?.client;
}
async function deleteClient(id) {
  await apiFetch(`/clients/${id}`, { method: "DELETE" });
  return { ok: true };
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  createClient,
  deleteClient,
  getClient,
  listClients,
  updateClient
});
//# sourceMappingURL=clients.js.map
