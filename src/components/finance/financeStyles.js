import {
  portalButtonPrimary,
  portalButtonSecondary,
  portalCardStyle,
  portalEyebrowStyle,
  portalInputStyle,
  portalTokens,
} from "../../portalDesignTokens";

export const financeCardStyle = portalCardStyle;

export const financeInputStyle = portalInputStyle;

export const financeEyebrowStyle = portalEyebrowStyle;

export const financePrimaryButton = {
  ...portalButtonPrimary,
  border: "none",
  cursor: "pointer",
  background: "linear-gradient(135deg, #15803d 0%, #2ca01c 100%)",
};

export const financeSecondaryButton = {
  ...portalButtonSecondary,
  cursor: "pointer",
};

export const financeSectionTitle = {
  fontWeight: 800,
  fontSize: "1.05rem",
  marginBottom: 12,
  color: portalTokens.ink,
};

export const financeMutedText = {
  color: portalTokens.body,
  fontSize: 14,
  lineHeight: 1.6,
};

export const financeTableStyle = {
  width: "100%",
  borderCollapse: "collapse",
  fontSize: 14,
};

export const financeThStyle = {
  textAlign: "left",
  padding: "12px 14px",
  borderBottom: `1px solid ${portalTokens.border}`,
  color: portalTokens.muted,
  fontSize: 12,
  textTransform: "uppercase",
  letterSpacing: "0.06em",
};

export const financeTdStyle = {
  padding: "14px",
  borderBottom: `1px solid ${portalTokens.border}`,
  verticalAlign: "top",
};
