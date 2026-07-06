import { centralFetch } from "./backendBase";

async function readJsonSafe(response) {
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.toLowerCase().includes("application/json")) return null;
  try {
    return await response.json();
  } catch {
    return null;
  }
}

function assertOk(response, payload, fallbackMessage) {
  if (!response.ok || !payload?.ok) {
    throw new Error(payload?.error || fallbackMessage);
  }
}

export async function fetchAdminPayrollProfile() {
  const response = await centralFetch("/api/admin/payroll-profile", { method: "GET" });
  const payload = await readJsonSafe(response);
  assertOk(response, payload, "Unable to load admin payroll profile.");
  return payload;
}

export async function saveAdminPayrollProfile(item) {
  const response = await centralFetch("/api/admin/payroll-profile", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(item || {}),
  });
  const payload = await readJsonSafe(response);
  assertOk(response, payload, "Unable to save admin payroll profile.");
  return payload;
}

export async function fetchAdminPayrollDirectory() {
  const response = await centralFetch("/api/admin/payroll-directory", { method: "GET" });
  const payload = await readJsonSafe(response);
  assertOk(response, payload, "Unable to load admin payroll directory.");
  return payload;
}

export async function saveAdminPayrollDirectory(items = []) {
  const response = await centralFetch("/api/admin/payroll-directory", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ items }),
  });
  const payload = await readJsonSafe(response);
  assertOk(response, payload, "Unable to save admin payroll directory.");
  return payload;
}

export async function fetchEmployeePayrollProfile(email = "") {
  const search = new URLSearchParams();
  if (email) search.set("email", email);
  const query = search.toString() ? `?${search.toString()}` : "";
  const response = await centralFetch(`/api/employee/payroll-profile${query}`, { method: "GET" });
  const payload = await readJsonSafe(response);
  assertOk(response, payload, "Unable to load employee payroll profile.");
  return payload;
}

export async function saveEmployeePayrollProfile(item = {}, { submit = false } = {}) {
  const response = await centralFetch("/api/employee/payroll-profile", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...item,
      submittedAt: submit ? new Date().toISOString() : null,
    }),
  });
  const payload = await readJsonSafe(response);
  assertOk(response, payload, "Unable to save employee payroll profile.");
  return payload;
}

export async function fetchInternalCompanyProfile() {
  const response = await centralFetch("/api/admin/internal-company-profile", { method: "GET" });
  const payload = await readJsonSafe(response);
  assertOk(response, payload, "Unable to load internal company profile.");
  return payload;
}

export async function saveInternalCompanyProfile(item = {}) {
  const response = await centralFetch("/api/admin/internal-company-profile", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(item),
  });
  const payload = await readJsonSafe(response);
  assertOk(response, payload, "Unable to save internal company profile.");
  return payload;
}

export async function fetchInternalEmployeeDirectory() {
  const response = await centralFetch("/api/admin/internal-employee-directory", { method: "GET" });
  const payload = await readJsonSafe(response);
  assertOk(response, payload, "Unable to load internal employee directory.");
  return payload;
}

export async function saveInternalEmployeeDirectory(items = []) {
  const response = await centralFetch("/api/admin/internal-employee-directory", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ items }),
  });
  const payload = await readJsonSafe(response);
  assertOk(response, payload, "Unable to save internal employee directory.");
  return payload;
}

export async function fetchEmployeeInternalProfile(email = "") {
  const search = new URLSearchParams();
  if (email) search.set("email", email);
  const query = search.toString() ? `?${search.toString()}` : "";
  const response = await centralFetch(`/api/employee/internal-profile${query}`, { method: "GET" });
  const payload = await readJsonSafe(response);
  assertOk(response, payload, "Unable to load employee internal profile.");
  return payload;
}

export async function saveEmployeeInternalProfile(item = {}) {
  const response = await centralFetch("/api/employee/internal-profile", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(item),
  });
  const payload = await readJsonSafe(response);
  assertOk(response, payload, "Unable to save employee internal profile.");
  return payload;
}
