import { normalizePath } from "./routes";

function isExternalHref(href = "") {
  return href.startsWith("mailto:") || href.startsWith("tel:") || href.startsWith("http://") || href.startsWith("https://") || href.startsWith("#");
}

export function isCurrentRouteHref(href = "", currentPath = "/") {
  if (!href || isExternalHref(href) || href.endsWith(".html")) return false;
  return normalizePath(href) === normalizePath(currentPath);
}

export function dedupeActions(actions = []) {
  const seen = new Set();
  return actions.filter((action) => {
    const key = `${action.href || ""}::${action.label || ""}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function filterVisibleActions(actions = [], currentPath = "/") {
  return dedupeActions(actions).filter((action) => !isCurrentRouteHref(action.href, currentPath));
}

export function resolveActionPair(primaryAction, secondaryAction, currentPath = "/") {
  const pair = filterVisibleActions([primaryAction, secondaryAction].filter(Boolean), currentPath);
  return {
    primary: pair[0] || null,
    secondary: pair[1] || null,
  };
}
