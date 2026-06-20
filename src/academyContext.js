const ACADEMY_CONTEXT_EVENT = "fca-academy-context";

export function readAcademyContext() {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem("fca_academy_module_context");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function publishAcademyContext(context) {
  if (typeof window === "undefined") return;
  try {
    if (!context) {
      window.sessionStorage.removeItem("fca_academy_module_context");
    } else {
      window.sessionStorage.setItem("fca_academy_module_context", JSON.stringify(context));
    }
    window.dispatchEvent(new CustomEvent(ACADEMY_CONTEXT_EVENT, { detail: context || null }));
  } catch {
    // best effort only
  }
}

export function subscribeAcademyContext(callback) {
  if (typeof window === "undefined") return () => {};
  function handleEvent(event) {
    callback(event.detail || readAcademyContext());
  }
  window.addEventListener(ACADEMY_CONTEXT_EVENT, handleEvent);
  return () => window.removeEventListener(ACADEMY_CONTEXT_EVENT, handleEvent);
}

export { ACADEMY_CONTEXT_EVENT };
