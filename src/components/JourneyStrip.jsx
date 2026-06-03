const itemStyle = {
  border: "1px solid #dbe3ef",
  background: "#ffffff",
  borderRadius: 999,
  padding: "8px 12px",
  fontSize: 12,
  fontWeight: 700,
  color: "#334155",
  textDecoration: "none",
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
};

export default function JourneyStrip({ items = [], current }) {
  if (!items.length) return null;

  return (
    <div
      style={{
        marginTop: 18,
        display: "flex",
        gap: 10,
        flexWrap: "wrap",
        alignItems: "center",
      }}
    >
      {items.map((item, index) => {
        const isActive = item.key === current;
        return (
          <a
            key={item.key}
            href={item.href}
            style={{
              ...itemStyle,
              background: isActive ? "#eff6ff" : itemStyle.background,
              border: isActive ? "1px solid #2563eb" : itemStyle.border,
              color: isActive ? "#1d4ed8" : itemStyle.color,
            }}
          >
            <span
              style={{
                width: 20,
                height: 20,
                borderRadius: 999,
                background: isActive ? "#2563eb" : "#e2e8f0",
                color: isActive ? "#fff" : "#475569",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 11,
                fontWeight: 700,
              }}
            >
              {index + 1}
            </span>
            <span>{item.label}</span>
          </a>
        );
      })}
    </div>
  );
}
