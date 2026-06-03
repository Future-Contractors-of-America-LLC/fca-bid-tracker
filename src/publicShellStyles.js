export const pageShellStyle = {
  padding: "clamp(20px, 4vw, 40px)",
  fontFamily: "Arial",
  maxWidth: 1120,
  margin: "0 auto",
  boxSizing: "border-box",
  width: "100%",
};

export const cardStyle = {
  border: "1px solid #e5e7eb",
  borderRadius: 14,
  padding: 18,
  background: "#fff",
  boxShadow: "0 12px 24px rgba(15, 23, 42, 0.04)",
};

export const heroCardStyle = {
  border: "1px solid #dbe3ef",
  borderRadius: 18,
  padding: 24,
  background: "linear-gradient(135deg, #eff6ff 0%, #ffffff 100%)",
  boxShadow: "0 18px 40px rgba(15, 23, 42, 0.06)",
};

export const sectionGridStyle = {
  display: "grid",
  gap: 16,
};

export const responsiveGrid = (minWidth = 280) => ({
  display: "grid",
  gridTemplateColumns: `repeat(auto-fit, minmax(min(100%, ${minWidth}px), 1fr))`,
  gap: 16,
});

export const twoColumnGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 320px), 1fr))",
  gap: 16,
  alignItems: "start",
};

export const heroButtonRowStyle = {
  display: "flex",
  flexWrap: "wrap",
  gap: 12,
  marginTop: 12,
  alignItems: "stretch",
};

const baseCtaStyle = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  textDecoration: "none",
  padding: "10px 14px",
  borderRadius: 10,
  fontWeight: 700,
  minHeight: 42,
  boxSizing: "border-box",
  textAlign: "center",
};

export const ctaPrimaryStyle = {
  ...baseCtaStyle,
  background: "#111827",
  color: "#fff",
};

export const ctaSecondaryStyle = {
  ...baseCtaStyle,
  background: "#eff6ff",
  color: "#1d4ed8",
  border: "1px solid #bfdbfe",
};

export const ctaLightStyle = {
  ...baseCtaStyle,
  background: "#f8fafc",
  color: "#111827",
  border: "1px solid #cbd5e1",
};

export const ctaStyleMap = {
  primary: ctaPrimaryStyle,
  secondary: ctaSecondaryStyle,
  light: ctaLightStyle,
};
