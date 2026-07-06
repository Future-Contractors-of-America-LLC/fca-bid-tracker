import { publicPackageRouteGroups } from "../publicPackageRouteGroups";
import { isProtectedCustomerRoute, resolveLoginHref } from "../customerSession";

const containerStyle = {
  border: "1px solid #dbe3ef",
  borderRadius: 16,
  padding: 20,
  background: "#ffffff",
  boxShadow: "0 12px 24px rgba(15, 23, 42, 0.04)",
};

export default function PublicPackageRouteGroupsPanel({
  eyebrow = "Product route groups",
  title = "Public package claims now resolve to exact reachable routes",
  detail = "Every package claim below maps to routes that already exist in repo truth so public conversion stays aligned with real product slices.",
  groups = publicPackageRouteGroups,
}) {
  const mapPublicHref = (href) => (isProtectedCustomerRoute(href) ? resolveLoginHref(href) : href);

  return (
    <section style={containerStyle}>
      <div style={{ color: "#2563eb", fontWeight: 700, marginBottom: 8 }}>{eyebrow}</div>
      <h2 style={{ marginTop: 0, marginBottom: 10 }}>{title}</h2>
      <p style={{ color: "#475569", lineHeight: 1.7, marginTop: 0 }}>{detail}</p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: 16, marginTop: 16 }}>
        {groups.map((group) => (
          <div key={group.key} style={{ border: "1px solid #dbe3ef", borderRadius: 12, padding: 14, background: "#f8fbff" }}>
            <div style={{ fontWeight: 700, marginBottom: 8 }}>{group.title}</div>
            <div style={{ color: "#475569", lineHeight: 1.7, marginBottom: 10 }}>{group.detail}</div>
            <div style={{ display: "grid", gap: 8 }}>
              {group.routes.map((route) => (
                <a key={`${group.key}-${route.href}`} href={mapPublicHref(route.href)} style={{ color: "#1d4ed8", fontWeight: 700, textDecoration: "none" }}>
                  {route.label}
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
