const PORTAL_PAGE_CONTEXT_EVENT = "fca-portal-page-context";

export function readPortalPageContext() {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem("fca_portal_page_context");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function publishPortalPageContext(context) {
  if (typeof window === "undefined") return;
  try {
    if (!context) {
      window.sessionStorage.removeItem("fca_portal_page_context");
    } else {
      window.sessionStorage.setItem("fca_portal_page_context", JSON.stringify(context));
    }
    window.dispatchEvent(new CustomEvent(PORTAL_PAGE_CONTEXT_EVENT, { detail: context || null }));
  } catch {
    // best effort only
  }
}

export function subscribePortalPageContext(callback) {
  if (typeof window === "undefined") return () => {};
  function handleEvent(event) {
    callback(event.detail || readPortalPageContext());
  }
  window.addEventListener(PORTAL_PAGE_CONTEXT_EVENT, handleEvent);
  return () => window.removeEventListener(PORTAL_PAGE_CONTEXT_EVENT, handleEvent);
}

export { PORTAL_PAGE_CONTEXT_EVENT };
