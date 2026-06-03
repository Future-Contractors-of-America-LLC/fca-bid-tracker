const linkStyle = {
  textDecoration: "none",
  color: "#111827",
  fontWeight: 600,
};

export default function ShellHeader({
  eyebrow = "FCA Unified Shell",
  title,
  subtitle,
  primaryHref,
  primaryLabel,
  secondaryHref,
  secondaryLabel,
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        gap: 20,
        flexWrap: "wrap",
        alignItems: "flex-start",
        marginBottom: 28,
      }}
    >
      <div style={{ maxWidth: 760 }}>
        <p style={{ color: "#2563eb", fontWeight: 700, marginBottom: 6 }}>
          {eyebrow}
        </p>
        <h1 style={{ marginTop: 0, marginBottom: 10 }}>{title}</h1>
        {subtitle ? (
          <p style={{ marginTop: 0, color: "#4b5563", lineHeight: 1.6 }}>
            {subtitle}
          </p>
        ) : null}
      </div>

      <div
        style={{
          display: "flex",
          gap: 14,
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <a href="/" style={linkStyle}>Home</a>
        <a href="/platform" style={linkStyle}>Platform</a>
        <a href="/auricrux" style={linkStyle}>Auricrux</a>
        <a href="/pricing" style={linkStyle}>Pricing</a>
        <a href="/contact" style={linkStyle}>Contact</a>
        <a href="/login" style={linkStyle}>Login</a>
        <a href="/portal" style={linkStyle}>Portal</a>
        <a href="/academy" style={linkStyle}>Academy</a>
        <a href="/bid-entry/" style={linkStyle}>Bid Entry</a>
        <a href="/bid-status/" style={linkStyle}>Bid Status</a>
        {secondaryHref && secondaryLabel ? (
          <a href={secondaryHref} style={linkStyle}>{secondaryLabel}</a>
        ) : null}
        {primaryHref && primaryLabel ? (
          <a
            href={primaryHref}
            style={{
              textDecoration: "none",
              background: "#111827",
              color: "#fff",
              padding: "10px 14px",
              borderRadius: 10,
              fontWeight: 700,
            }}
          >
            {primaryLabel}
          </a>
        ) : null}
      </div>
    </div>
  );
}
