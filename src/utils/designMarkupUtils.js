export function distanceBetween(a, b) {
  const dx = (b[0] - a[0]);
  const dy = (b[1] - a[1]);
  return Math.sqrt(dx * dx + dy * dy);
}

export function quantityFromGeometry(geometry, defaultQuantity = 1) {
  const coords = geometry?.coordinates || [];
  if (coords.length < 2) return defaultQuantity;
  let total = 0;
  for (let index = 1; index < coords.length; index += 1) {
    total += distanceBetween(coords[index - 1], coords[index]);
  }
  return Math.round(Math.max(total, defaultQuantity) * 100 * 100) / 100;
}

export function formatScaleDistance(normalizedDistance, scaleLabel = "") {
  const feet = normalizedDistance * 100;
  if (scaleLabel) return `${feet.toFixed(1)} ft @ ${scaleLabel}`;
  return `${feet.toFixed(1)} ft`;
}

export function filterMarkupsByLayer(markups, visibleLayerIds) {
  if (!visibleLayerIds?.length) return markups;
  return markups.filter((markup) => visibleLayerIds.includes(markup.layerId || "default"));
}

export const MARKUP_COLORS = {
  pen: "#2563eb",
  cloud: "#7c3aed",
  dimension: "#059669",
  callout: "#2563eb",
  punch: "#dc2626",
  count: "#d97706",
};

export const DEFAULT_LAYERS = [
  { id: "default", name: "Review", visible: true, color: "#2563eb" },
  { id: "layer-punch", name: "Punch", visible: true, color: "#dc2626" },
  { id: "layer-takeoff", name: "Takeoff", visible: true, color: "#059669" },
];
