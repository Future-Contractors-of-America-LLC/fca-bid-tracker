import { useEffect, useRef, useState } from "react";
import FcaBrandMark from "./FcaBrandMark";
import {
  clearCustomerSession,
  readCustomerSession,
  resolveLoginHref,
  resolveWorkspaceEntryHref,
} from "../customerSession";
import { navigateTo } from "../navigation";

const headerStyle = {
  position: "sticky",
  top: 0,
  zIndex: 1000,
  background: "#ffffff",
  borderBottom: "1px solid #e2e8f0",
  boxShadow: "0 1px 0 rgba(15, 23, 42, 0.04)",
};

const innerStyle = {
  maxWidth: 1280,
  margin: "0 auto",
  padding: "0 clamp(16px, 3vw, 32px)",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 16,
  minHeight: 64,
};

const navStyle = {
  display: "flex",
  alignItems: "center",
  gap: 4,
  flexWrap: "wrap",
};

const menuButtonStyle = {
  border: "none",
  background: "transparent",
  color: "#0f172a",
  fontWeight: 600,
  fontSize: 14,
  padding: "10px 12px",
  borderRadius: 8,
  cursor: "pointer",
  fontFamily: "inherit",
};

const linkStyle = {
  textDecoration: "none",
  color: "#334155",
  fontWeight: 600,
  fontSize: 14,
  padding: "10px 12px",
  borderRadius: 8,
  display: "block",
};

const dropdownStyle = {
  position: "absolute",
  top: "calc(100% + 4px)",
  left: 0,
  minWidth: 220,
  background: "#fff",
  border: "1px solid #e2e8f0",
  borderRadius: 12,
  boxShadow: "0 16px 40px rgba(15, 23, 42, 0.12)",
  padding: 8,
  zIndex: 1100,
};

const signInStyle = {
  textDecoration: "none",
  color: "#1d4ed8",
  fontWeight: 700,
  fontSize: 14,
  padding: "10px 14px",
  borderRadius: 8,
};

const primaryCtaStyle = {
  textDecoration: "none",
  background: "linear-gradient(135deg, #1d4ed8 0%, #1e3a8a 100%)",
  color: "#fff",
  fontWeight: 700,
  fontSize: 14,
  padding: "10px 16px",
  borderRadius: 8,
};

const NAV_MENUS = [
  {
    label: "Platform",
    items: [
      { label: "Overview", href: "/platform" },
      { label: "Features", href: "/features" },
      { label: "Solutions", href: "/solutions" },
      { label: "Auricrux Intelligence", href: "/auricrux" },
    ],
  },
  {
    label: "Commercial",
    items: [
      { label: "Pricing", href: "/pricing" },
      { label: "Digital Products", href: "/products" },
      { label: "Get Started", href: "/intake" },
    ],
  },
  {
    label: "Academy",
    items: [
      { label: "Academy Home", href: "/academy" },
      { label: "Course Catalog", href: "/academy/catalog" },
    ],
  },
  {
    label: "Company",
    items: [
      { label: "Contact", href: "/contact" },
      { label: "Warranty", href: "/warranty" },
      { label: "Referrals", href: "/referrals" },
    ],
  },
  {
    label: "Legal",
    items: [
      { label: "Terms", href: "/terms" },
      { label: "Privacy", href: "/privacy" },
      { label: "Refunds", href: "/refunds" },
      { label: "Intellectual Property", href: "/ip" },
    ],
  },
];

function NavDropdown({ menu, currentPath }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function onDocClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  const active = menu.items.some((item) => currentPath === item.href || currentPath.startsWith(`${item.href}/`));

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        type="button"
        style={{
          ...menuButtonStyle,
          background: active ? "#eff6ff" : open ? "#f8fafc" : "transparent",
          color: active ? "#1d4ed8" : "#0f172a",
        }}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        {menu.label}
      </button>
      {open ? (
        <div style={dropdownStyle}>
          {menu.items.map((item) => (
            <a
              key={item.href}
              href={item.href}
              style={{
                ...linkStyle,
                background: currentPath === item.href ? "#eff6ff" : "transparent",
                color: currentPath === item.href ? "#1d4ed8" : "#334155",
              }}
              onClick={() => setOpen(false)}
            >
              {item.label}
            </a>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export default function PublicTopNav({ mode = "public" }) {
  const session = readCustomerSession();
  const currentPath = typeof window === "undefined" ? "/" : window.location.pathname.replace(/\/$/, "") || "/";
  const loginHref = resolveLoginHref();
  const workspaceHref = resolveWorkspaceEntryHref(session, "/portal/platform");

  const portalItems = [
    { label: "Dashboard", href: "/portal/platform" },
    { label: "Projects", href: "/portal/projects" },
    { label: "Bids", href: "/portal/bids" },
    { label: "Estimates", href: "/portal/estimates" },
    { label: "Proposals", href: "/portal/proposals" },
    { label: "Files", href: "/portal/files" },
    { label: "Messages", href: "/portal/messages" },
    { label: "Billing", href: "/portal/billing" },
    { label: "Academy", href: "/portal/academy" },
    { label: "Auricrux", href: "/portal/auricrux" },
    { label: "Support", href: "/portal/support" },
    { label: "Admin", href: "/portal/admin" },
  ];

  async function handleLogout(event) {
    event.preventDefault();
    await clearCustomerSession({ server: true });
    navigateTo(loginHref);
  }

  return (
    <header style={headerStyle}>
      <div style={innerStyle}>
        <a href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
          <FcaBrandMark compact />
          <span style={{ fontWeight: 800, color: "#0f172a", fontSize: 15, whiteSpace: "nowrap" }}>
            Future Contractors of America
          </span>
        </a>

        <nav style={navStyle} aria-label={mode === "portal" ? "Portal navigation" : "Site navigation"}>
          {mode === "portal" ? (
            portalItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                style={{
                  ...linkStyle,
                  display: "inline-block",
                  color: currentPath === item.href ? "#1d4ed8" : "#334155",
                  background: currentPath === item.href ? "#eff6ff" : "transparent",
                }}
              >
                {item.label}
              </a>
            ))
          ) : (
            <>
              <a
                href="/"
                style={{
                  ...linkStyle,
                  display: "inline-block",
                  color: currentPath === "/" ? "#1d4ed8" : "#334155",
                  background: currentPath === "/" ? "#eff6ff" : "transparent",
                }}
              >
                Home
              </a>
              {NAV_MENUS.map((menu) => (
                <NavDropdown key={menu.label} menu={menu} currentPath={currentPath} />
              ))}
            </>
          )}
        </nav>

        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          {session?.authenticated ? (
            <>
              <a href={workspaceHref} style={signInStyle}>Workspace</a>
              <a href={loginHref} onClick={handleLogout} style={signInStyle}>Sign out</a>
            </>
          ) : (
            <>
              <a href={loginHref} style={signInStyle}>Sign in</a>
              <a href="/intake" style={primaryCtaStyle}>Get started</a>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
