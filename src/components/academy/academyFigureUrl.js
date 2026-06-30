const CENTRAL =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_AURICRUX_CENTRAL_API) ||
  "https://auricrux-central.azurewebsites.net/api";

export function academyFigureUrl(imageAssetKey) {
  if (!imageAssetKey) return "";
  const key = String(imageAssetKey).replace(/\.svg$/i, "");
  return `${String(CENTRAL).replace(/\/$/, "")}/academy-figures/${encodeURIComponent(key)}.svg`;
}
