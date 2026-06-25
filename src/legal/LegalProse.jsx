import { legalHeading, legalSubheading, legalLink, legalTable, legalTh, legalTd } from "./legalStyles";
import { FCA_ENTITY, formatPrincipalOffice } from "./entityInfo";

const LINK_RE = /\[([^\]]+)\]\(([^)]+)\)/g;

function renderInline(text) {
  if (!text) return null;
  const parts = [];
  let last = 0;
  let match;
  let key = 0;
  const re = new RegExp(LINK_RE.source, "g");
  while ((match = re.exec(text)) !== null) {
    if (match.index > last) parts.push(text.slice(last, match.index));
    parts.push(
      <a key={key++} href={match[2]} style={legalLink}>
        {match[1]}
      </a>
    );
    last = match.index + match[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts.length === 1 && typeof parts[0] === "string" ? parts[0] : parts;
}

export function LegalEffective({ date = "June 19, 2026", version = "1.0" }) {
  return (
    <p>
      <strong>Effective date:</strong> {date} &nbsp;|&nbsp; <strong>Version:</strong> {version}
    </p>
  );
}

export function LegalNotice() {
  return (
    <p style={{ fontSize: 14, color: "#334155", marginBottom: 20, lineHeight: 1.75 }}>
      These policies form a binding agreement between you and {FCA_ENTITY.legalName}, a Virginia limited liability
      company. By accessing or using our website, portal, mobile applications, academy, or APIs, you acknowledge that
      you have read, understood, and agree to be bound by the applicable terms. If you do not agree, you must not use
      the Services. For legal inquiries contact{" "}
      <a href={`mailto:${FCA_ENTITY.emails.legal}`} style={legalLink}>
        {FCA_ENTITY.emails.legal}
      </a>
      .
    </p>
  );
}

export function LegalH3({ children }) {
  return <h3 style={legalHeading}>{children}</h3>;
}

export function LegalH4({ children }) {
  return <h4 style={legalSubheading}>{children}</h4>;
}

export function LegalP({ children }) {
  const content = typeof children === "string" ? renderInline(children) : children;
  return <p>{content}</p>;
}

export function LegalUl({ items = [] }) {
  return (
    <ul style={{ lineHeight: 1.8, paddingLeft: 22 }}>
      {items.map((item) => (
        <li key={item}>{typeof item === "string" ? renderInline(item) : item}</li>
      ))}
    </ul>
  );
}

export function LegalTable({ headers = [], rows = [] }) {
  return (
    <table style={legalTable}>
      <thead>
        <tr>
          {headers.map((h) => (
            <th key={h} style={legalTh}>
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={i}>
            {row.map((cell, j) => (
              <td key={j} style={legalTd}>
                {typeof cell === "string" ? renderInline(cell) : cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function LegalContact({ email, label = "Contact" }) {
  return (
    <LegalP>
      <strong>{label}:</strong>{" "}
      <a href={`mailto:${email}`} style={legalLink}>
        {email}
      </a>
    </LegalP>
  );
}

export function LegalPostalAddress({ label = "Postal address" }) {
  return (
    <LegalP>
      <strong>{label}:</strong>
      <br />
      {FCA_ENTITY.legalName}
      <br />
      {formatPrincipalOffice(false)}
    </LegalP>
  );
}
