const DEFAULT_BASE = "https://auricrux-central.azurewebsites.net";

export function backendBaseUrl() {
  if (typeof window !== "undefined" && window.FCA_BACKEND?.baseUrl) {
    return String(window.FCA_BACKEND.baseUrl).replace(/\/$/, "");
  }
  return DEFAULT_BASE;
}

export function centralApi(path) {
  const base = backendBaseUrl();
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalized}`;
}

export function centralFetch(path, options = {}) {
  return fetch(centralApi(path), {
    credentials: "omit",
    ...options,
    headers: {
      Accept: "application/json",
      ...(options.headers || {}),
    },
  });
}
