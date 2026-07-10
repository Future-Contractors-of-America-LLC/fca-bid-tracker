import { useEffect, useMemo, useState } from "react";
import {
  CUSTOMER_SESSION_EVENT,
  clearCustomerSession,
  readCustomerSession,
  hydrateCustomerSession,
  updateCustomerSession,
  persistCustomerPreferences,
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
        const synced = await hydrateCustomerSession();
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
        accountMode,
        authBoundary,
        sessionToken = null,
        profile = null,
        companySettings = null,
        brandSkin = null,
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
          accountMode,
          authBoundary,
          enabledProducts: normalizedProducts,
          enabledComms: normalizedComms,
          sessionToken,
          profile,
          companySettings,
          brandSkin,
        });

        setSession(saved);
        logAutomationEvent("login-activation", `Workspace activated for ${normalizedCompany}`, `Auricrux activated ${planPreset.name} with ${Object.values(normalizedProducts).filter(Boolean).length} product layers and ${Object.values(normalizedComms).filter(Boolean).length} communications lanes through ${accountSource}.`, nextHref);
        logCommercialEvent("workspace-activation", `${planPreset.name} workspace activated`, `Auricrux turned a commercial entry into a live authenticated workspace for ${normalizedCompany}.`, nextHref === "/portal/platform" ? "/pricing" : nextHref);
        return { ok: true, session: saved };
      },
      async updateSession(updates = {}) {
        const result = await persistCustomerPreferences(updates);
        if (!result.ok && !result.session) {
          return { ok: false, error: result.error || "No authenticated customer session was found." };
        }

        setSession(result.session);
        logAutomationEvent(
          "session-update",
          `Workspace profile updated for ${result.session.company}`,
          result.warning
            ? `Profile saved locally. ${result.warning}`
            : `Auricrux persisted profile preferences (${result.backingSource || "server"}).`,
          result.session.nextHref || "/portal/platform",
        );
        logCommercialEvent(
          "commercial-update",
          `Commercial profile updated for ${result.session.company}`,
          "Auricrux preserved a customer commercial/profile mutation so rollout and revenue continuity remain visible.",
          result.session.nextHref || "/portal/platform",
        );
        return {
          ok: true,
          session: result.session,
          warning: result.warning || "",
          backingSource: result.backingSource,
        };
      },
      setProductAccess(product, enabled) {
        if (!PRODUCT_KEYS.includes(product)) {
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
        logAutomationEvent("product-repair", `${product.toUpperCase()} access ${enabled ? "enabled" : "disabled"}`, `Auricrux ${enabled ? "enabled" : "disabled"} ${product.toUpperCase()} access and propagated the change across the workspace shell.`, saved.nextHref || "/portal/platform");
        logCommercialEvent("product-continuity", `${product.toUpperCase()} commercial availability ${enabled ? "restored" : "reduced"}`, `Auricrux ${enabled ? "restored" : "reduced"} ${product.toUpperCase()} product availability and updated the revenue-capable workspace shape.`, saved.nextHref || "/portal/platform");
        return { ok: true, session: saved };
      },
      setCommsAccess(channel, enabled) {
        if (!COMMUNICATION_KEYS.includes(channel)) {
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
        logAutomationEvent("comms-repair", `${channel.toUpperCase()} lane ${enabled ? "enabled" : "disabled"}`, `Auricrux ${enabled ? "enabled" : "disabled"} ${channel.toUpperCase()} for the current customer session and preserved the result for cross-route automation memory.`, saved.nextHref || "/portal/messages");
        logCommercialEvent("comms-continuity", `${channel.toUpperCase()} communications ${enabled ? "enabled" : "disabled"}`, `Auricrux ${enabled ? "enabled" : "disabled"} ${channel.toUpperCase()} so sales, billing, support, and rollout channels stay commercially usable.`, saved.nextHref || "/portal/messages");
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
        logAutomationEvent("plan-promotion", `${planPreset.name} activated`, `Auricrux applied ${planPreset.name} and aligned product access plus communications lanes to the commercial package.`, saved.nextHref || "/portal/platform");
        logCommercialEvent("plan-promotion", `${planPreset.name} commercial package activated`, `Auricrux aligned pricing, product depth, and communications scope to ${planPreset.name} for stronger revenue continuity.`, saved.nextHref || "/pricing");
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
