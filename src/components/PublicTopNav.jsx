import { useEffect, useRef, useState } from "react";
import FcaBrandMark from "./FcaBrandMark";
import {
  clearCustomerSession,
  isProtectedCustomerRoute,
  readCustomerSession,
  resolveAdminWorkspaceHref,
  resolveLoginHref,
  resolveWorkspaceEntryHref,
} from "../customerSession";
import { navigateTo } from "../navigation";
import { portalNavGroups, portalNavPrimary } from "../systemState";
import { toggleAuricruxAssistant } from "../auricruxAssistant";

const headerStyle = {
  position: "sticky",
  top: 0,
  zIndex: 1000,
  background: "rgba(12, 35, 64, 0.96)",
  borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
  boxShadow: "0 8px 28px rgba(15, 23, 42, 0.18)",
  backdropFilter: "blur(12px)",
};

const innerStyle = {
  maxWidth: 1280,
  margin: "0 auto",
  padding: "0 16px",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 12,
  minHeight: 56,
};

const brandTextStyle = {
  fontWeight: 700,
  color: "#f8fafc",
  fontSize: 15,
  letterSpacing: "-0.02em",
};

const desktopNavStyle = {
  display: "none",
  alignItems: "center",
  gap: 2,
};

const desktopActionsStyle = {
  display: "none",
  alignItems: "center",
  gap: 6,
  flexShrink: 0,
};

const mobileActionsStyle = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  flexShrink: 0,
};

const menuButtonStyle = {
  border: "none",
  background: "transparent",
  color: "#e2e8f0",
  fontWeight: 600,
  fontSize: 14,
  padding: "8px 12px",
  borderRadius: 8,
  cursor: "pointer",
  fontFamily: "inherit",
};

const linkStyle = {
  textDecoration: "none",
  color: "#cbd5e1",
  fontWeight: 600,
  fontSize: 14,
  padding: "8px 12px",
  borderRadius: 8,
  display: "block",
};

const dropdownStyle = {
  position: "absolute",
  top: "calc(100% + 4px)",
  left: 0,
  minWidth: 200,
  background: "#fff",
  border: "1px solid #e2e8f0",
  borderRadius: 10,
  boxShadow: "0 12px 32px rgba(15, 23, 42, 0.12)",
  padding: 6,
  zIndex: 1100,
};

const signInStyle = {
  textDecoration: "none",
  color: "#f8fafc",
  fontWeight: 700,
  fontSize: 13,
  padding: "9px 12px",
  borderRadius: 8,
  whiteSpace: "nowrap",
  border: "1px solid rgba(255,255,255,0.45)",
  background: "rgba(255,255,255,0.08)",
};

const primaryCtaStyle = {
  textDecoration: "none",
  background: "#c4a052",
  color: "#0c2340",
  fontWeight: 800,
  fontSize: 13,
  padding: "9px 16px",
  borderRadius: 8,
  whiteSpace: "nowrap",
};

/** CTAs inside the white mobile drawer — never reuse dark-header colors here. */
const drawerSignInStyle = {
  textDecoration: "none",
  color: "#0c2340",
  fontWeight: 700,
  fontSize: 14,
  padding: "11px 14px",
  borderRadius: 8,
  border: "1px solid #cbd5e1",
  background: "#fff",
  textAlign: "center",
};

const drawerPrimaryCtaStyle = {
  ...primaryCtaStyle,
  display: "block",
  textAlign: "center",
  padding: "12px 16px",
  fontSize: 14,
};

const drawerCloseStyle = {
  border: "1px solid #cbd5e1",
  background: "#f8fafc",
  borderRadius: 10,
  padding: "8px 12px",
  cursor: "pointer",
  fontFamily: "inherit",
  fontSize: 14,
  fontWeight: 700,
  color: "#0f172a",
};

const hamburgerStyle = {
  border: "1px solid rgba(255,255,255,0.18)",
  background: "transparent",
  borderRadius: 10,
  width: 42,
  height: 42,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  fontFamily: "inherit",
  fontSize: 18,
  color: "#f8fafc",
};

const mobileDrawerStyle = {
  position: "fixed",
  inset: 0,
  zIndex: 1200,
  display: "flex",
  flexDirection: "column",
};

const mobileDrawerBackdrop = {
  position: "absolute",
  inset: 0,
  background: "rgba(15, 23, 42, 0.45)",
};

const mobileDrawerPanel = {
  position: "relative",
  marginLeft: "auto",
  width: "min(100%, 320px)",
  height: "100%",
  background: "#fff",
  boxShadow: "-8px 0 32px rgba(15, 23, 42, 0.15)",
  display: "flex",
  flexDirection: "column",
  overflow: "auto",
};

const NAV_MENUS = [
  {
    label: "Academy",
    items: [
      { label: "Course catalog", href: "/academy/catalog" },
      { label: "Academy store", href: "/academy/store" },
      { label: "Student login", href: "/academy/student-portal" },
    ],
  },
  {
    label: "CTE",
    items: [
      { label: "CTE school portal", href: "/cte/portal" },
      { label: "Browse CTE courses", href: "/academy/catalog?pathway=vdoe-cte" },
      { label: "Contact CTE team", href: "/contact?topic=cte" },
    ],
  },
];

function isNavActive(currentPath, href) {
  if (!href) return false;
  const [path, query] = href.split("?");
  const pathMatch = currentPath === path || (path !== "/portal" && currentPath.startsWith(`${path}/`));
  if (!pathMatch) return false;
  if (typeof window === "undefined") return !query;
  const have = new URLSearchParams(window.location.search);
  if (!query) {
    // Keep commercial catalog inactive while browsing the isolated CTE pathway.
    if (path === "/academy/catalog" && have.get("pathway") === "vdoe-cte") return false;
    return true;
  }
  const want = new URLSearchParams(query);
  for (const [key, value] of want.entries()) {
    if (have.get(key) !== value) return false;
  }
  return true;
}

const assistantButtonStyle = {
  border: "1px solid #e8c46a",
  background: "linear-gradient(135deg, #fffaf0 0%, #fff 100%)",
  color: "#8a6a14",
  fontWeight: 700,
  fontSize: 13,
  padding: "8px 12px",
  borderRadius: 6,
  whiteSpace: "nowrap",
  cursor: "pointer",
  fontFamily: "inherit",
};

function AuricruxAssistantButton({ onNavigate }) {
  return (
    <button
      type="button"
      style={assistantButtonStyle}
      onClick={() => {
        toggleAuricruxAssistant();
        onNavigate?.();
      }}
    >
      Ask Auricrux
    </button>
  );
}

function useMediaQuery(query) {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    const media = window.matchMedia(query);
    const onChange = () => setMatches(media.matches);
    onChange();
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, [query]);
  return matches;
}

function NavDropdown({ menu, currentPath, onNavigate }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function onDocClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  const active = menu.items.some((item) => isNavActive(currentPath, item.href));

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        type="button"
        style={{
          ...menuButtonStyle,
          background: active || open ? "rgba(255,255,255,0.1)" : "transparent",
          color: "#f8fafc",
        }}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        {menu.label} <span aria-hidden style={{ fontSize: 10, marginLeft: 4, opacity: 0.75 }}>▾</span>
      </button>
      {open ? (
        <div style={dropdownStyle}>
          {menu.items.map((item) => (
            <a
              key={item.href}
              href={item.href}
              style={{
                ...linkStyle,
                background: isNavActive(currentPath, item.href) ? "#eff6ff" : "transparent",
                color: isNavActive(currentPath, item.href) ? "#1d4ed8" : "#334155",
              }}
              onClick={() => {
                setOpen(false);
                onNavigate?.();
              }}
            >
              {item.label}
            </a>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function MobileDrawer({ open, onClose, children }) {
  useEffect(() => {
    if (!open) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div style={mobileDrawerStyle} role="dialog" aria-modal="true" aria-label="Navigation menu">
      <button type="button" style={{ ...mobileDrawerBackdrop, border: "none", padding: 0 }} onClick={onClose} aria-label="Close menu" />
      <div style={mobileDrawerPanel}>
        {children}
      </div>
    </div>
  );
}

export default function PublicTopNav({ mode = "public" }) {
  const session = readCustomerSession();
  const isDesktop = useMediaQuery("(min-width: 960px)");
  const [mobileOpen, setMobileOpen] = useState(false);
  const currentPath = typeof window === "undefined" ? "/" : window.location.pathname.replace(/\/$/, "") || "/";
  const loginHref = resolveLoginHref();
  const adminWorkspaceHref = resolveAdminWorkspaceHref(session);
  const workspaceHref = resolveWorkspaceEntryHref(session, "/portal/platform");
  const profileHref = resolveGuestSafeHref("/portal/profile");

  function resolveGuestSafeHref(href) {
    if (!href || session?.authenticated) return href;
    return isProtectedCustomerRoute(href) ? resolveLoginHref(href) : href;
  }

  async function handleLogout(event) {
    event.preventDefault();
    await clearCustomerSession({ server: true });
    setMobileOpen(false);
    navigateTo(loginHref);
  }

  function closeMobile() {
    setMobileOpen(false);
  }

  const isPortal = mode === "portal";
  const activeHeaderStyle = isPortal
    ? {
        ...headerStyle,
        background: "#ffffff",
        borderBottom: "1px solid #e2e8f0",
        boxShadow: "0 1px 3px rgba(15, 23, 42, 0.06)",
        backdropFilter: "none",
      }
    : headerStyle;
  const activeBrandTextStyle = isPortal ? { ...brandTextStyle, color: "#0f172a" } : brandTextStyle;
  const activeLinkColor = (active) => (isPortal
    ? { color: active ? "#1d4ed8" : "#334155", background: active ? "#eff6ff" : "transparent" }
    : { color: active ? "#fff" : "#cbd5e1", background: active ? "rgba(255,255,255,0.12)" : "transparent" });
  const activeSignInStyle = isPortal
    ? { ...signInStyle, color: "#1d4ed8", border: "1px solid #cbd5e1" }
    : signInStyle;
  const activePrimaryCtaStyle = isPortal
    ? { ...primaryCtaStyle, background: "#1d4ed8", color: "#fff" }
    : primaryCtaStyle;
  const activeHamburgerStyle = isPortal
    ? { ...hamburgerStyle, border: "1px solid #e2e8f0", color: "#0f172a" }
    : hamburgerStyle;

  const authActions = session?.authenticated ? (
    <>
      <a href={profileHref} style={activeSignInStyle} onClick={closeMobile}>Account</a>
      <a href={workspaceHref} style={activePrimaryCtaStyle} onClick={closeMobile}>Workspace</a>
      <a href={loginHref} onClick={handleLogout} style={activeSignInStyle}>Sign out</a>
    </>
  ) : (
    <>
      <a href={loginHref} style={activeSignInStyle} onClick={closeMobile}>Sign in</a>
      <a href="/intake" style={activePrimaryCtaStyle} onClick={closeMobile}>Get started</a>
    </>
  );

  return (
    <>
      <style>{`
        .fca-nav-desktop { display: none; }
        .fca-nav-mobile-actions { display: flex; }
        @media (min-width: 960px) {
          .fca-nav-desktop { display: flex; flex-wrap: wrap; row-gap: 4px; }
          .fca-nav-mobile-actions { display: none; }
          .fca-brand-long { display: inline; }
          .fca-brand-short { display: none; }
        }
        @media (max-width: 959px) {
          .fca-brand-long { display: none; }
          .fca-brand-short { display: inline; }
        }
      `}</style>

      <header style={activeHeaderStyle} className="fca-topnav-blur">
        <div style={innerStyle}>
          <a href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
            <FcaBrandMark compact showTagline={false} />
            <span className="fca-brand-long" style={activeBrandTextStyle}>Future Contractors of America</span>
          </a>

          {isPortal ? (
            <nav className="fca-nav-desktop" style={{ ...desktopNavStyle, display: isDesktop ? "flex" : "none" }} aria-label="Portal navigation">
              {portalNavPrimary.map((item) => (
                <a
                  key={item.href}
                  href={resolveGuestSafeHref(item.href)}
                  style={{
                    ...linkStyle,
                    display: "inline-block",
                    ...activeLinkColor(isNavActive(currentPath, item.href)),
                  }}
                >
                  {item.label}
                </a>
              ))}
            </nav>
          ) : (
            <nav className="fca-nav-desktop" style={{ ...desktopNavStyle, display: isDesktop ? "flex" : "none" }} aria-label="Site navigation">
              <a
                href="/platform"
                style={{
                  ...linkStyle,
                  display: "inline-block",
                  color: currentPath === "/platform" || currentPath === "/features" ? "#fff" : "#e2e8f0",
                  background: currentPath === "/platform" || currentPath === "/features" ? "rgba(255,255,255,0.12)" : "transparent",
                }}
              >
                Platform
              </a>
              <a
                href="/proof"
                style={{
                  ...linkStyle,
                  display: "inline-block",
                  color: currentPath === "/proof" ? "#fff" : "#e2e8f0",
                  background: currentPath === "/proof" ? "rgba(255,255,255,0.12)" : "transparent",
                }}
              >
                Proof
              </a>
              {NAV_MENUS.map((menu) => (
                <NavDropdown key={menu.label} menu={menu} currentPath={currentPath} onNavigate={closeMobile} />
              ))}
              <a
                href="/pricing"
                style={{
                  ...linkStyle,
                  display: "inline-block",
                  color: currentPath === "/pricing" ? "#fff" : "#e2e8f0",
                  background: currentPath === "/pricing" ? "rgba(255,255,255,0.12)" : "transparent",
                }}
              >
                Pricing
              </a>
              <a
                href="/contact"
                style={{
                  ...linkStyle,
                  display: "inline-block",
                  color: currentPath === "/contact" ? "#fff" : "#e2e8f0",
                  background: currentPath === "/contact" ? "rgba(255,255,255,0.12)" : "transparent",
                }}
              >
                Contact
              </a>
            </nav>
          )}

          <div className="fca-nav-desktop" style={{ ...desktopActionsStyle, display: isDesktop ? "flex" : "none" }}>
            {authActions}
          </div>

          <div className="fca-nav-mobile-actions" style={mobileActionsStyle}>
            {!session?.authenticated ? (
              <a href="/intake" style={{ ...activePrimaryCtaStyle, padding: "8px 12px" }}>Get started</a>
            ) : (
              <a href={workspaceHref} style={{ ...activePrimaryCtaStyle, padding: "8px 12px" }}>Workspace</a>
            )}
            <button type="button" style={activeHamburgerStyle} onClick={() => setMobileOpen(true)} aria-label="Open menu">
              <span aria-hidden style={{ display: "grid", gap: 4 }}>
                <span style={{ width: 16, height: 2, background: isPortal ? "#0f172a" : "#f8fafc", display: "block" }} />
                <span style={{ width: 16, height: 2, background: isPortal ? "#0f172a" : "#f8fafc", display: "block" }} />
                <span style={{ width: 16, height: 2, background: isPortal ? "#0f172a" : "#f8fafc", display: "block" }} />
              </span>
            </button>
          </div>
        </div>
      </header>

      <MobileDrawer open={mobileOpen} onClose={closeMobile}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <strong style={{ fontSize: 16, color: "#0f172a" }}>Menu</strong>
          <button type="button" onClick={closeMobile} style={drawerCloseStyle} aria-label="Close">Close</button>
        </div>

        <div style={{ padding: "12px 16px", display: "grid", gap: 8, borderBottom: "1px solid #e2e8f0" }}>
          {session?.authenticated ? (
            <>
              <a href={workspaceHref} style={drawerPrimaryCtaStyle} onClick={closeMobile}>Open workspace</a>
              <a href={profileHref} style={drawerSignInStyle} onClick={closeMobile}>Account</a>
              <a href={adminWorkspaceHref} style={drawerSignInStyle} onClick={closeMobile}>Admin</a>
              <a href={loginHref} onClick={handleLogout} style={drawerSignInStyle}>Sign out</a>
            </>
          ) : (
            <>
              <a href="/intake" style={drawerPrimaryCtaStyle} onClick={closeMobile}>Get started</a>
              <a href={loginHref} style={drawerSignInStyle} onClick={closeMobile}>Sign in</a>
            </>
          )}
        </div>

        <div style={{ padding: "8px 8px 24px", overflow: "auto", flex: 1 }}>
          {(mode === "portal"
            ? portalNavGroups
            : [
                {
                  label: "Site",
                  items: [
                    { label: "Platform", href: "/platform" },
                    { label: "Proof", href: "/proof" },
                    { label: "Pricing", href: "/pricing" },
                    { label: "Contact", href: "/contact" },
                  ],
                },
                ...NAV_MENUS.map((m) => ({ label: m.label, items: m.items })),
              ]).map((group) => (
            <div key={group.label} style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", color: "#64748b", padding: "8px 12px 4px" }}>
                {group.label}
              </div>
              {group.items.map((item) => (
                <a
                  key={item.href}
                  href={resolveGuestSafeHref(item.href)}
                  onClick={closeMobile}
                  style={{
                    ...linkStyle,
                    padding: "10px 12px",
                    color: currentPath === item.href ? "#1d4ed8" : "#0f172a",
                    background: currentPath === item.href ? "#eff6ff" : "transparent",
                  }}
                >
                  {item.label}
                </a>
              ))}
            </div>
          ))}
        </div>
      </MobileDrawer>
    </>
  );
}
