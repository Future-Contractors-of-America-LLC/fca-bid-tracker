import { centralFetch } from "./backendBase";

async function readJson(response) {
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.toLowerCase().includes("application/json")) return null;
  try {
    return await response.json();
  } catch {
    return null;
  }
}

export async function fetchM365Status() {
  const response = await centralFetch("/api/m365/status");
  const payload = await readJson(response);
  if (!response.ok || !payload) {
    throw new Error(payload?.error || "Unable to load Microsoft 365 status.");
  }
  return payload;
}

export async function fetchSharePointDriveStatus() {
  const response = await centralFetch("/api/m365/sharepoint/status");
  const payload = await readJson(response);
  if (!response.ok || !payload) {
    throw new Error(payload?.error || "Unable to load SharePoint status.");
  }
  return payload;
}

export async function listSharePointFolderItems(folderPath = "") {
  const params = new URLSearchParams();
  if (folderPath) params.set("path", folderPath);
  const response = await centralFetch(`/api/m365/sharepoint/folder?${params.toString()}`);
  const payload = await readJson(response);
  if (!response.ok || !payload) {
    throw new Error(payload?.error || "Unable to list SharePoint folder items.");
  }
  return payload;
}

export async function uploadSharePointFile({ fileName, contentBase64, folderPath = "" }) {
  const response = await centralFetch("/api/m365/sharepoint/upload", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fileName, contentBase64, folderPath }),
  });
  const payload = await readJson(response);
  if (!response.ok || !payload?.ok) {
    throw new Error(payload?.error || "Unable to upload file to SharePoint.");
  }
  return payload;
}

export function sharePointItemHref(item) {
  if (!item) return "";
  return item.webUrl || item.downloadUrl || "";
}
