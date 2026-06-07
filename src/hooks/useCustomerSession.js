import { useEffect, useMemo, useState } from "react";
import {
  clearCustomerSession,
  readCustomerSession,
  updateCustomerSession,
  writeCustomerSession,
} from "../customerSession";

export default function useCustomerSession() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    setSession(readCustomerSession());
  }, []);

  return useMemo(
    () => ({
      session,
      isAuthenticated: Boolean(session?.authenticated),
      login({ email, company, role = "Owner / Admin", nextHref = "/portal/platform" }) {
        const normalizedEmail = (email || "").trim().toLowerCase();
        const normalizedCompany = (company || "").trim();
        const normalizedRole = (role || "").trim() || "Owner / Admin";

        if (!normalizedEmail || !normalizedCompany) {
          return { ok: false, error: "Email and company are required." };
        }

        const companyKey = normalizedCompany
          .replace(/[^a-z0-9]+/gi, "-")
          .replace(/^-+|-+$/g, "")
          .toUpperCase();

        const saved = writeCustomerSession({
          email: normalizedEmail,
          company: normalizedCompany,
          role: normalizedRole,
          customerId: `CUST-${companyKey || "FCA"}-001`,
          workspaceLabel: `${normalizedCompany} Workspace`,
          nextHref,
          lastLoginAt: new Date().toISOString(),
          enabledProducts: {
            saas: true,
            lms: true,
            auricrux: true,
          },
        });

        setSession(saved);
        return { ok: true, session: saved };
      },
      updateSession(updates = {}) {
        const saved = updateCustomerSession(updates);
        if (!saved) {
          return { ok: false, error: "No authenticated customer session was found." };
        }

        setSession(saved);
        return { ok: true, session: saved };
      },
      setProductAccess(product, enabled) {
        if (!["saas", "lms", "auricrux"].includes(product)) {
          return { ok: false, error: "Unknown product access target." };
        }

        const saved = updateCustomerSession({
          enabledProducts: {
            [product]: enabled,
          },
        });

        if (!saved) {
          return { ok: false, error: "No authenticated customer session was found." };
        }

        setSession(saved);
        return { ok: true, session: saved };
      },
      logout() {
        clearCustomerSession();
        setSession(null);
      },
    }),
    [session]
  );
}
