import { useEffect, useMemo, useState } from "react";
import { mutateCustomerEntitlements } from "../api/customerEntitlementsClient";
import {
  CUSTOMER_SESSION_EVENT,
  clearCustomerSession,
  readCustomerSession,
  syncCustomerSessionFromServer,
  updateCustomerSession,
  writeCustomerSession,
} from "../customerSession";
import { appendAutomationLog, clearAutomationLog } from "../sessionAutomationLog";
import { appendCommercialLog, clearCommercialLog } from "../sessionCommercialLog";
import { resolvePlanPreset } from "../pricingPlans";

const PRODUCT_KEYS = ["saas", "lms", "auricrux"];
const COMMUNICATION_KEYS = ["chat", "sms", "phone", "email", "teams", "conference", "lecture"];

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

function logAutomationEvent(type, title, detail, route = "/portal/platform") {
  appendAutomationLog({ type, title, detail, route });
}

function logCommercialEvent(type, title, detail, route = "/pricing") {
  appendCommercialLog({ type, title, detail, route });
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
  const [session, setSession] = useState(() => readCustomerSession());

  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    let active = true;

    async function hydrate() {
      try {
        const synced = await syncCustomerSessionFromServer();
        if (!active) return;
        setSession(synced || readCustomerSession());
      } catch {
        if (!active) return;
        setSession(readCustomerSession());
      }
    }

    function handleSessionUpdate() {
      if (!active) return;
      setSession(readCustomerSession());
    }

    hydrate();
    window.addEventListener(CUSTOMER_SESSION_EVENT, handleSessionUpdate);

    return () => {
      active = false;
      window.removeEventListener(CUSTOMER_SESSION_EVENT, handleSessionUpdate);
    };
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
        customerId,
        workspaceLabel,
        accountSource = "workspace-shell",
        authBoundary,
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
          customerId: customerId || `CUST-${companyKey || "FCA"}-001`,
          workspaceLabel: workspaceLabel || `${normalizedCompany} Workspace`,
          nextHref,
          lastLoginAt: new Date().toISOString(),
          selectedPlan: planPreset.key,
          accountSource,
          authBoundary,
          enabledProducts: normalizedProducts,
          enabledComms: normalizedComms,
        });

        setSession(saved);
        logAutomationEvent("login-activation", `Workspace activated for ${normalizedCompany}`, `Auricrux activated ${planPreset.name} with ${Object.values(normalizedProducts).filter(Boolean).length} product layers and ${Object.values(normalizedComms).filter(Boolean).length} communications lanes through ${accountSource}.`, nextHref);
        logCommercialEvent("workspace-activation", `${planPreset.name} workspace activated`, `Auricrux turned a commercial entry into a live authenticated workspace for ${normalizedCompany}.`, nextHref === "/portal/platform" ? "/pricing" : nextHref);
        return { ok: true, session: saved };
      },
      updateSession(updates = {}) {
        const saved = updateCustomerSession(updates);
        if (!saved) {
          return { ok: false, error: "No authenticated customer session was found." };
        }

        setSession(saved);
        logAutomationEvent("session-update", `Workspace profile updated for ${saved.company}`, "Auricrux recorded a direct customer-session update and preserved it for cross-route continuity.", saved.nextHref || "/portal/platform");
        logCommercialEvent("commercial-update", `Commercial profile updated for ${saved.company}`, "Auricrux preserved a customer commercial/profile mutation so rollout and revenue continuity remain visible.", saved.nextHref || "/portal/platform");
        return { ok: true, session: saved };
      },
      async setProductAccess(product, enabled) {
        if (!PRODUCT_KEYS.includes(product)) {
          return { ok: false, error: "Unknown product access target." };
        }

        const serverResult = await mutateCustomerEntitlements({
          action: "set-product",
          product,
          enabled,
        });
        if (!serverResult.ok) {
          return { ok: false, error: serverResult.error || "Product access changes require administrator approval on the server." };
        }

        const saved = writeCustomerSession({
          ...(readCustomerSession() || {}),
          ...serverResult.account,
          authenticated: true,
        });
        setSession(saved);
        logAutomationEvent("product-repair", `${product.toUpperCase()} access ${enabled ? "enabled" : "disabled"}`, `Server confirmed ${product.toUpperCase()} entitlement change.`, saved.nextHref || "/portal/platform");
        return { ok: true, session: saved };
      },
      async setCommsAccess(channel, enabled) {
        if (!COMMUNICATION_KEYS.includes(channel)) {
          return { ok: false, error: "Unknown communications access target." };
        }

        const serverResult = await mutateCustomerEntitlements({
          action: "set-comms",
          channel,
          enabled,
        });
        if (!serverResult.ok) {
          return { ok: false, error: serverResult.error || "Communications access changes require administrator approval on the server." };
        }

        const saved = writeCustomerSession({
          ...(readCustomerSession() || {}),
          ...serverResult.account,
          authenticated: true,
        });
        setSession(saved);
        logAutomationEvent("comms-repair", `${channel.toUpperCase()} lane ${enabled ? "enabled" : "disabled"}`, `Server confirmed ${channel.toUpperCase()} entitlement change.`, saved.nextHref || "/portal/messages");
        return { ok: true, session: saved };
      },
      async applyPlanPreset(planKey) {
        const planPreset = resolvePlanPreset(planKey);
        const serverResult = await mutateCustomerEntitlements({
          action: "apply-plan",
          planKey: planPreset.key,
        });
        if (!serverResult.ok) {
          return { ok: false, error: serverResult.error || "Plan changes require administrator approval on the server." };
        }

        const saved = writeCustomerSession({
          ...(readCustomerSession() || {}),
          ...serverResult.account,
          authenticated: true,
        });
        setSession(saved);
        logAutomationEvent("plan-promotion", `${planPreset.name} activated`, `Server confirmed ${planPreset.name} plan entitlements.`, saved.nextHref || "/portal/platform");
        return { ok: true, session: saved };
      },
      async logout() {
        await clearCustomerSession({ server: true });
        clearAutomationLog();
        clearCommercialLog();
        setSession(null);
      },
    }),
    [session],
  );
}
