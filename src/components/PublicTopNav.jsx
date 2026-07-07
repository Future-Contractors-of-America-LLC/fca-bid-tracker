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
  background: "#ffffff",
  borderBottom: "1px solid #e2e8f0",
  boxShadow: "0 1px 3px rgba(15, 23, 42, 0.06)",
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
  fontWeight: 800,
  color: "#0f172a",
  fontSize: 14,
  letterSpacing: "-0.01em",
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
  color: "#0f172a",
  fontWeight: 600,
  fontSize: 14,
  padding: "8px 10px",
  borderRadius: 6,
  cursor: "pointer",
  fontFamily: "inherit",
};

const linkStyle = {
  textDecoration: "none",
  color: "#334155",
  fontWeight: 600,
  fontSize: 14,
  padding: "8px 10px",
  borderRadius: 6,
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
  color: "#1d4ed8",
  fontWeight: 700,
  fontSize: 13,
  padding: "8px 12px",
  borderRadius: 6,
  whiteSpace: "nowrap",
};

const primaryCtaStyle = {
  textDecoration: "none",
  background: "#1d4ed8",
  color: "#fff",
  fontWeight: 700,
  fontSize: 13,
  padding: "8px 14px",
  borderRadius: 6,
  whiteSpace: "nowrap",
};

const hamburgerStyle = {
  border: "1px solid #e2e8f0",
  background: "#fff",
  borderRadius: 8,
  width: 40,
  height: 40,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  fontFamily: "inherit",
  fontSize: 18,
  color: "#0f172a",
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
    label: "Platform",
    items: [
      { label: "Operating system overview", href: "/platform" },
      { label: "Features", href: "/features" },
      { label: "Solutions", href: "/solutions" },
      { label: "Auricrux intelligence", href: "/auricrux" },
    ],
  },
  {
    label: "Decision Paths",
    items: [
      { label: "Owner / Executive", href: "/#owner-executive" },
      { label: "Operations Director", href: "/#operations-director" },
      { label: "Field Superintendent", href: "/#field-superintendent" },
      { label: "Pricing and rollout", href: "/pricing" },
    ],
  },
  {
    label: "Academy",
    items: [
      { label: "Course catalog", href: "/academy/catalog" },
      { label: "Academy store", href: "/academy/store" },
      { label: "FCA Academy Student Portal", href: "/academy/student-portal" },
      { label: "CTE Program Portal", href: "/cte/portal" },
    ],
  },
  {
    label: "Trust & Governance",
    items: [
      { label: "Trust workspace", href: "/login?next=/portal/admin" },
      { label: "Audit trail", href: "/portal/audit" },
      { label: "Security", href: "/security" },
      { label: "Legal center", href: "/legal" },
      { label: "Data privacy", href: "/privacy" },
    ],
  },
];

function isNavActive(currentPath, href) {
  return currentPath === href || (href !== "/portal" && currentPath.startsWith(`${href}/`));
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
          background: active ? "#eff6ff" : open ? "#f8fafc" : "transparent",
          color: active ? "#1d4ed8" : "#0f172a",
        }}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        {menu.label} <span aria-hidden style={{ fontSize: 10, marginLeft: 2 }}>v</span>
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

  const authActions = session?.authenticated ? (
    <>
      <AuricruxAssistantButton />
      <a href={workspaceHref} style={signInStyle} onClick={closeMobile}>Workspace</a>
      <a href={loginHref} onClick={handleLogout} style={signInStyle}>Sign out</a>
    </>
  ) : (
    <>
      <AuricruxAssistantButton />
      <a href={loginHref} style={signInStyle} onClick={closeMobile}>Sign in</a>
      <a href="/intake" style={primaryCtaStyle} onClick={closeMobile}>Get started</a>
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

      <header style={headerStyle} className="fca-topnav-blur">
        <div style={innerStyle}>
          <a href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
            <FcaBrandMark compact showTagline={false} />
            <span className="fca-brand-long" style={brandTextStyle}>Future Contractors of America</span>
          </a>

          {mode === "portal" ? (
            <nav className="fca-nav-desktop" style={{ ...desktopNavStyle, display: isDesktop ? "flex" : "none" }} aria-label="Portal navigation">
              {portalNavPrimary.map((item) => (
                <a
                  key={item.href}
                  href={resolveGuestSafeHref(item.href)}
                  style={{
                    ...linkStyle,
                    display: "inline-block",
                    color: isNavActive(currentPath, item.href) ? "#1d4ed8" : "#334155",
                    background: isNavActive(currentPath, item.href) ? "#eff6ff" : "transparent",
                  }}
                >
                  {item.label}
                </a>
              ))}
            </nav>
          ) : (
            <nav className="fca-nav-desktop" style={{ ...desktopNavStyle, display: isDesktop ? "flex" : "none" }} aria-label="Site navigation">
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
                <NavDropdown key={menu.label} menu={menu} currentPath={currentPath} onNavigate={closeMobile} />
              ))}
              <a
                href="/contact"
                style={{
                  ...linkStyle,
                  display: "inline-block",
                  color: currentPath === "/contact" ? "#1d4ed8" : "#334155",
                  background: currentPath === "/contact" ? "#eff6ff" : "transparent",
                }}
              >
                Contact
              </a>
              <a
                href="/pricing"
                style={{
                  ...linkStyle,
                  display: "inline-block",
                  color: currentPath === "/pricing" ? "#1d4ed8" : "#334155",
                  background: currentPath === "/pricing" ? "#eff6ff" : "transparent",
                }}
              >
                Pricing
              </a>
            </nav>
          )}

          <div className="fca-nav-desktop" style={{ ...desktopActionsStyle, display: isDesktop ? "flex" : "none" }}>
            {authActions}
          </div>

          <div className="fca-nav-mobile-actions" style={mobileActionsStyle}>
            {!session?.authenticated ? (
              <a href={loginHref} style={{ ...primaryCtaStyle, padding: "8px 12px" }}>Sign in</a>
            ) : (
              <a href={workspaceHref} style={{ ...primaryCtaStyle, padding: "8px 12px" }}>Workspace</a>
            )}
            <button type="button" style={hamburgerStyle} onClick={() => setMobileOpen(true)} aria-label="Open menu">
              Menu
            </button>
          </div>
        </div>
      </header>

      <MobileDrawer open={mobileOpen} onClose={closeMobile}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <strong style={{ fontSize: 16, color: "#0f172a" }}>Menu</strong>
          <button type="button" onClick={closeMobile} style={{ ...hamburgerStyle, fontSize: 14 }} aria-label="Close">Close</button>
        </div>

        <div style={{ padding: "12px 16px", display: "grid", gap: 8, borderBottom: "1px solid #e2e8f0" }}>
          {session?.authenticated ? (
            <>
              <AuricruxAssistantButton onNavigate={closeMobile} />
              <a href={workspaceHref} style={primaryCtaStyle} onClick={closeMobile}>Open workspace</a>
              <a href={adminWorkspaceHref} style={signInStyle} onClick={closeMobile}>Admin workspace</a>
              <a href={loginHref} onClick={handleLogout} style={signInStyle}>Sign out</a>
            </>
          ) : (
            <>
              <AuricruxAssistantButton onNavigate={closeMobile} />
              <a href={loginHref} style={primaryCtaStyle} onClick={closeMobile}>Sign in</a>
              <a href="/intake" style={signInStyle} onClick={closeMobile}>Get started</a>
            </>
          )}
        </div>

        <div style={{ padding: "8px 8px 24px", overflow: "auto", flex: 1 }}>
          {mode === "portal" ? (
            <div style={{ marginBottom: 12, padding: "0 8px" }}>
              <div style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", color: "#64748b", padding: "8px 12px 4px" }}>
                Quick links
              </div>
              {portalNavPrimary.map((item) => (
                <a
                  key={item.href}
                  href={resolveGuestSafeHref(item.href)}
                  style={{
                    ...linkStyle,
                    padding: "10px 12px",
                    color: isNavActive(currentPath, item.href) ? "#1d4ed8" : "#0f172a",
                    background: isNavActive(currentPath, item.href) ? "#eff6ff" : "transparent",
                  }}
                  onClick={closeMobile}
                >
                  {item.label}
                </a>
              ))}
            </div>
          ) : null}
          {(mode === "portal" ? portalNavGroups : [{ label: "Site", items: [{ label: "Home", href: "/" }] }, ...NAV_MENUS.map((m) => ({ label: m.label, items: m.items }))]).map((group) => (
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
