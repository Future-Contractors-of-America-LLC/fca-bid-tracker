/** Shared visual tokens for portal and shell surfaces — keep in sync with index.css variables. */
export const portalTokens = {
  font: 'var(--sans, "Segoe UI", system-ui, -apple-system, BlinkMacSystemFont, Roboto, sans-serif)',
  ink: "#0f172a",
  muted: "#64748b",
  body: "#475569",
  border: "#e2e8f0",
  borderStrong: "#cbd5e1",
  surface: "#f8fafc",
  panel: "#ffffff",
  primary: "#2563eb",
  primarySoft: "#eff6ff",
  primaryInk: "#1d4ed8",
  shadowSm: "0 1px 2px rgba(15, 23, 42, 0.05)",
  shadowMd: "0 8px 30px rgba(15, 23, 42, 0.08)",
  shadowLg: "0 16px 40px rgba(15, 23, 42, 0.1)",
  radiusSm: 10,
  radiusMd: 14,
  radiusLg: 18,
  maxContent: 1180,
};

export const portalCardStyle = {
  border: `1px solid ${portalTokens.border}`,
  borderRadius: portalTokens.radiusMd,
  padding: 18,
  background: portalTokens.panel,
  boxShadow: portalTokens.shadowSm,
};

export const portalEyebrowStyle = {
  color: portalTokens.muted,
  fontWeight: 700,
  fontSize: 12,
  textTransform: "uppercase",
  letterSpacing: "0.08em",
};
