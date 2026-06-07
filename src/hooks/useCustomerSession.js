import { useEffect, useMemo, useState } from "react";
import {
  clearCustomerSession,
  readCustomerSession,
  updateCustomerSession,
  writeCustomerSession,
} from "../customerSession";
import { resolvePlanPreset } from "../pricingPlans";

function normalizeProductSelection(enabledProducts = {}) {
  return {
    saas: enabledProducts.saas !== false,
    lms: enabledProducts.lms !== false,
    auricrux: enabledProducts.auricrux !== false,
  };
}

function normalizeCommsSelection(enabledComms = {}) {
  return {
    chat: enabledComms.chat !== false,
    sms: enabledComms.sms !== false,
    phone: enabledComms.phone !== false,
    email: enabledComms.email !== false,
    teams: enabledComms.teams !== false,
    conference: enabledComms.conference !== false,
    lecture: enabledComms.lecture !== false,
  };
}

export function resolveRoleDefaultProducts(role = "Owner / Admin") {
  const normalizedRole = (role || "").trim();

  switch (normalizedRole) {
    case "Estimator":
      return { saas: true, lms: false, auricrux: true };
    case "Project Coordinator":
      return { saas: true, lms: true, auricrux: true };
    case "Superintendent":
      return { saas: true, lms: true, auricrux: true };
    case "Accounting":
      return { saas: true, lms: false, auricrux: true };
    case "Field Operations":
      return { saas: false, lms: true, auricrux: true };
    case "Owner / Admin":
    default:
      return { saas: true, lms: true, auricrux: true };
  }
}

export function resolveRoleDefaultComms(role = "Owner / Admin") {
  const normalizedRole = (role || "").trim();

  switch (normalizedRole) {
    case "Estimator":
      return { chat: true, sms: false, phone: false, email: true, teams: false, conference: false, lecture: false };
    case "Project Coordinator":
      return { chat: true, sms: true, phone: true, email: true, teams: true, conference: true, lecture: false };
    case "Superintendent":
      return { chat: true, sms: true, phone: true, email: true, teams: false, conference: true, lecture: false };
    case "Accounting":
      return { chat: true, sms: false, phone: false, email: true, teams: true, conference: false, lecture: false };
    case "Field Operations":
      return { chat: true, sms: true, phone: true, email: false, teams: false, conference: false, lecture: true };
    case "Owner / Admin":
    default:
      return { chat: true, sms: true, phone: true, email: true, teams: true, conference: true, lecture: true };
  }
}

export default function useCustomerSession() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    setSession(readCustomerSession());
  }, []);

  return useMemo(
    () => ({
      session,
      isAuthenticated: Boolean(session?.authenticated),
      login({
        email,
        company,
        role = "Owner / Admin",
        nextHref = "/portal/platform",
        selectedPlan = "startup",
        enabledProducts,
        enabledComms,
      }) {
        const normalizedEmail = (email || "").trim().toLowerCase();
        const normalizedCompany = (company || "").trim();
        const normalizedRole = (role || "").trim() || "Owner / Admin";
        const planPreset = resolvePlanPreset(selectedPlan);
        const normalizedProducts = normalizeProductSelection(enabledProducts || planPreset.enabledProducts || resolveRoleDefaultProducts(role));
        const normalizedComms = normalizeCommsSelection(enabledComms || planPreset.enabledComms || resolveRoleDefaultComms(role));

        if (!normalizedEmail || !normalizedCompany) {
          return { ok: false, error: "Email and company are required." };
        }

        if (!normalizedProducts.saas && !normalizedProducts.lms && !normalizedProducts.auricrux) {
          return { ok: false, error: "At least one customer product surface must be enabled." };
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
          selectedPlan: planPreset.key,
          enabledProducts: normalizedProducts,
          enabledComms: normalizedComms,
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
      setCommsAccess(channel, enabled) {
        if (!["chat", "sms", "phone", "email", "teams", "conference", "lecture"].includes(channel)) {
          return { ok: false, error: "Unknown communications access target." };
        }

        const saved = updateCustomerSession({
          enabledComms: {
            [channel]: enabled,
          },
        });

        if (!saved) {
          return { ok: false, error: "No authenticated customer session was found." };
        }

        setSession(saved);
        return { ok: true, session: saved };
      },
      applyPlanPreset(planKey) {
        const planPreset = resolvePlanPreset(planKey);
        const saved = updateCustomerSession({
          selectedPlan: planPreset.key,
          enabledProducts: planPreset.enabledProducts,
          enabledComms: planPreset.enabledComms,
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
