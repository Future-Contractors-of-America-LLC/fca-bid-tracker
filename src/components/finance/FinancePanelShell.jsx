import {
  financeCardStyle,
  financeEyebrowStyle,
  financeMutedText,
} from "./financeStyles";

export default function FinancePanelShell({ eyebrow, title, detail, children, actions = null }) {
  return (
    <div style={{ ...financeCardStyle, marginBottom: 16 }}>
      {eyebrow ? <div style={financeEyebrowStyle}>{eyebrow}</div> : null}
      {title ? <h2 style={{ margin: "6px 0 8px", fontSize: "1.1rem" }}>{title}</h2> : null}
      {detail ? <p style={{ ...financeMutedText, marginTop: 0, marginBottom: actions ? 12 : 0 }}>{detail}</p> : null}
      {actions ? <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 12 }}>{actions}</div> : null}
      {children}
    </div>
  );
}

export { FinancePanelShell };
