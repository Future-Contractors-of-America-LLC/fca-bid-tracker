/** Shared visual language - Ivy League academic identity + Canvas operational LMS. */

/** Full LMS catalog: 1212 FCA Academy + 39 FCA CTE (VDOE) = 1251. */
export const ACADEMY_CATALOG_EXPECTED_TOTAL = 1251;
export const ACADEMY_CATALOG_ACADEMY_TOTAL = 1212;
export const ACADEMY_CATALOG_CTE_TOTAL = 39;
export const ACADEMY_CATALOG_VERSION = "2026.07.2";

export const academyTheme = {
  serif: "Georgia, 'Iowan Old Style', 'Palatino Linotype', 'Times New Roman', serif",
  sans: "'Segoe UI', 'Helvetica Neue', system-ui, sans-serif",
  ivyNavy: "#0c2340",
  ivyBlue: "#00356b",
  ivyGold: "#c4a052",
  canvasBg: "#f2f2f2",
  canvasSidebar: "#ffffff",
  canvasBorder: "#d1d5db",
  canvasLink: "#0c2340",
  success: "#15803d",
  locked: "#94a3b8",
  current: "#2563eb",
};

export const academyCardStyle = {
  border: `1px solid ${academyTheme.canvasBorder}`,
  borderRadius: 4,
  padding: 20,
  background: "#fff",
  boxShadow: "0 1px 3px rgba(15, 23, 42, 0.06)",
};

export function academyPageStyle() {
  return {
    fontFamily: academyTheme.sans,
    background: academyTheme.canvasBg,
    minHeight: "100vh",
  };
}
