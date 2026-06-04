import { useEffect, useMemo, useState } from "react";
import {
  clearCustomerSession,
  readCustomerSession,
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
      login({ email, company, nextHref = "/portal" }) {
        const normalizedEmail = (email || "").trim().toLowerCase();
        const normalizedCompany = (company || "").trim();

        if (!normalizedEmail || !normalizedCompany) {
          return { ok: false, error: "Email and company are required." };
        }

        const saved = writeCustomerSession({
          email: normalizedEmail,
          company: normalizedCompany,
          workspaceLabel: `${normalizedCompany} Workspace`,
          nextHref,
          lastLoginAt: new Date().toISOString(),
        });

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
