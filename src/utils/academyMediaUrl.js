/**
 * Resolve academy lecture/skills media paths against blob CDN when configured.
 * Local dev: same-origin /academy/media/... from public/.
 * Production: FCA_ACADEMY_MEDIA_CDN + relative path (set in dist/config/fca-academy-media.js).
 */
export function academyMediaCdnBase() {
  if (typeof window !== "undefined" && window.FCA_ACADEMY_MEDIA_CDN) {
    return String(window.FCA_ACADEMY_MEDIA_CDN).replace(/\/$/, "");
  }
  const envBase = import.meta.env?.VITE_FCA_ACADEMY_MEDIA_CDN;
  return envBase ? String(envBase).replace(/\/$/, "") : "";
}

export function resolveAcademyMediaUrl(pathOrUrl) {
  if (!pathOrUrl) return pathOrUrl;
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;

  const cdn = academyMediaCdnBase();
  if (!cdn) return pathOrUrl;

  const rel = pathOrUrl.startsWith("/") ? pathOrUrl.slice(1) : pathOrUrl;
  return `${cdn}/${rel}`;
}
