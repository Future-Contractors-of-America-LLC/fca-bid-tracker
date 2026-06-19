export const pageShellStyle = {
  padding: "clamp(20px, 4vw, 40px)",
  fontFamily: '"Segoe UI", system-ui, -apple-system, BlinkMacSystemFont, Roboto, sans-serif',
  maxWidth: 1280,
  margin: "0 auto",
  boxSizing: "border-box",
  width: "100%",
  color: "#0f172a",
};

export const cardStyle = {
  border: "1px solid #e2e8f0",
  borderRadius: 8,
  padding: 20,
  background: "#ffffff",
  boxShadow: "none",
};

export const heroCardStyle = {
  border: "none",
  borderRadius: 0,
  padding: "clamp(32px, 5vw, 56px) clamp(20px, 4vw, 40px)",
  background: "linear-gradient(180deg, #0f172a 0%, #1e293b 100%)",
  color: "#f8fafc",
  boxShadow: "none",
  marginLeft: "calc(-1 * clamp(20px, 4vw, 40px))",
  marginRight: "calc(-1 * clamp(20px, 4vw, 40px))",
  marginBottom: 32,
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
  background: "linear-gradient(135deg, #1d4ed8 0%, #3157d7 70%, #1f3ea8 100%)",
  color: "#fff",
  border: "1px solid #1e40af",
};

export const ctaSecondaryStyle = {
  ...baseCtaStyle,
  background: "linear-gradient(135deg, #eff6ff 0%, #ffffff 100%)",
  color: "#1d4ed8",
  border: "1px solid #bfdbfe",
};

export const ctaLightStyle = {
  ...baseCtaStyle,
  background: "linear-gradient(135deg, #fff7e1 0%, #ffffff 100%)",
  color: "#7c5313",
  border: "1px solid #ecd089",
};

export const ctaStyleMap = {
  primary: ctaPrimaryStyle,
  secondary: ctaSecondaryStyle,
  light: ctaLightStyle,
};
