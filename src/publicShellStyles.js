export const pageShellStyle = {
  padding: "clamp(20px, 4vw, 40px)",
  fontFamily: "Arial",
  maxWidth: 1120,
  margin: "0 auto",
  boxSizing: "border-box",
  width: "100%",
};

export const cardStyle = {
  border: "1px solid #dbe4f3",
  borderRadius: 14,
  padding: 18,
  background: "linear-gradient(135deg, #ffffff 0%, #f8fbff 100%)",
  boxShadow: "0 14px 28px rgba(15, 23, 42, 0.06)",
};

export const heroCardStyle = {
  border: "1px solid #dbe3ef",
  borderRadius: 18,
  padding: 24,
  background: "linear-gradient(135deg, #e8f0ff 0%, #ffffff 58%, #fff7e5 100%)",
  boxShadow: "0 20px 44px rgba(15, 23, 42, 0.08)",
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
