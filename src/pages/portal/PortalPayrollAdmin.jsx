import { useEffect, useMemo, useState } from "react";
import PortalShell from "../../components/PortalShell";
import {
  PortalAlert,
  PortalEntityTable,
  PortalPageIntro,
  PortalQuickStats,
  PortalStatusBadge,
} from "../../components/portal/PortalPrimitives";
import PortalSliceAuricrux from "../../components/portal/PortalSliceAuricrux";
import { portalButtonPrimary, portalCardStyle, portalInputStyle, portalTokens } from "../../portalDesignTokens";
import { routeStateOverlays } from "../../systemState";
import {
  fetchAdminPayrollDirectory,
  fetchAdminPayrollProfile,
  saveAdminPayrollDirectory,
  saveAdminPayrollProfile,
} from "../../api/internalOperationsClient";

const ADMIN_PAYROLL_PROFILE_KEY = "fca_admin_payroll_profile_v1";
const ADMIN_PAYROLL_EMPLOYEE_DIRECTORY_KEY = "fca_admin_payroll_employee_directory_v1";

const INPUT = {
  ...portalInputStyle,
  width: "100%",
  boxSizing: "border-box",
};

function readLocalJson(key, fallback) {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function writeLocalJson(key, value) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // best-effort cache persistence
  }
}

function defaultAdminPayrollProfile() {
  return {
    bankName: "",
    bankRoutingFingerprint: "",
    bankAccountFingerprint: "",
    payoutDestinationId: "",
    payrollProvider: "FCA",
    payrollCompanyId: "FCA-PRIMARY",
    taxProvider: "",
    taxAccountId: "",
    updatedAt: null,
  };
}

function defaultEmployeeDirectory() {
  return [
    {
      id: "employee-michael",
      employeeName: "Michael",
      employeeEmail: "michael@futurecontractorsofamerica.com",
      payrollEmployeeId: "",
      status: "Missing payroll ID",
      updatedAt: null,
    },
    {
      id: "employee-amanda",
      employeeName: "Amanda",
      employeeEmail: "amanda@futurecontractorsofamerica.com",
      payrollEmployeeId: "",
      status: "Missing payroll ID",
      updatedAt: null,
    },
  ];
}

function statusFromProfile(profile) {
  const requiredKeys = [
    profile.bankName,
    profile.bankRoutingFingerprint,
    profile.bankAccountFingerprint,
    profile.payoutDestinationId,
    profile.payrollProvider,
    profile.payrollCompanyId,
  ];
  const completeCount = requiredKeys.filter((value) => String(value || "").trim()).length;
  return {
    completeCount,
    total: requiredKeys.length,
    ready: completeCount === requiredKeys.length,
  };
}

function directoryHealth(rows) {
  const withIds = rows.filter((row) => String(row.payrollEmployeeId || "").trim()).length;
  return {
    complete: withIds,
    total: rows.length,
    ready: rows.length > 0 && withIds === rows.length,
  };
}

function normalizeText(value) {
  return String(value || "").trim();
}

function mapToReadinessKeyRows(profile, directory) {
  const michael = directory.find((row) => row.employeeName.toLowerCase() === "michael");
  const amanda = directory.find((row) => row.employeeName.toLowerCase() === "amanda");
  return [
    { id: "bank-name", key: "FCA_BANK_NAME", value: profile.bankName || "" },
    { id: "bank-routing", key: "FCA_BANK_ROUTING_FINGERPRINT", value: profile.bankRoutingFingerprint || "" },
    { id: "bank-account", key: "FCA_BANK_ACCOUNT_FINGERPRINT", value: profile.bankAccountFingerprint || "" },
    { id: "payout-destination", key: "FCA_PAYOUT_DESTINATION_ID", value: profile.payoutDestinationId || "" },
    { id: "payroll-provider", key: "FCA_PAYROLL_PROVIDER", value: profile.payrollProvider || "" },
    { id: "payroll-company", key: "FCA_PAYROLL_COMPANY_ID", value: profile.payrollCompanyId || "" },
    { id: "michael-payroll", key: "FCA_PAYROLL_EMPLOYEE_MICHAEL_ID", value: michael?.payrollEmployeeId || "" },
    { id: "amanda-payroll", key: "FCA_PAYROLL_EMPLOYEE_AMANDA_ID", value: amanda?.payrollEmployeeId || "" },
    { id: "tax-provider", key: "FCA_TAX_PROVIDER", value: profile.taxProvider || "" },
    { id: "tax-account", key: "FCA_TAX_ACCOUNT_ID", value: profile.taxAccountId || "" },
  ];
}

export default function PortalPayrollAdmin() {
  const [profile, setProfile] = useState(() => readLocalJson(ADMIN_PAYROLL_PROFILE_KEY, defaultAdminPayrollProfile()));
  const [directory, setDirectory] = useState(() => readLocalJson(ADMIN_PAYROLL_EMPLOYEE_DIRECTORY_KEY, defaultEmployeeDirectory()));
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let active = true;

    async function hydrate() {
      try {
        const [profilePayload, directoryPayload] = await Promise.all([
          fetchAdminPayrollProfile(),
          fetchAdminPayrollDirectory(),
        ]);
        if (!active) return;
        if (profilePayload?.item) setProfile(profilePayload.item);
        if (Array.isArray(directoryPayload?.items)) setDirectory(directoryPayload.items);
      } catch {
        if (!active) return;
        setNotice("Central payroll profile not reachable. Using local workspace cache.");
      }
    }

    hydrate();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    writeLocalJson(ADMIN_PAYROLL_PROFILE_KEY, profile);
  }, [profile]);

  useEffect(() => {
    writeLocalJson(ADMIN_PAYROLL_EMPLOYEE_DIRECTORY_KEY, directory);
  }, [directory]);

  const profileHealth = useMemo(() => statusFromProfile(profile), [profile]);
  const employeeHealth = useMemo(() => directoryHealth(directory), [directory]);
  const keyRows = useMemo(() => mapToReadinessKeyRows(profile, directory), [profile, directory]);

  function updateField(field, value) {
    setProfile((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function saveProfile(event) {
    event.preventDefault();
    const next = {
      ...profile,
      updatedAt: new Date().toISOString(),
    };
    setProfile(next);
    try {
      const payload = await saveAdminPayrollProfile(next);
      if (payload?.item) setProfile(payload.item);
      setNotice("Company payroll and banking profile saved in FCA admin workspace.");
    } catch {
      setNotice("Saved locally. Central payroll profile save failed.");
    }
  }

  function updateEmployeeRow(id, field, value) {
    setDirectory((current) =>
      current.map((row) => {
        if (row.id !== id) return row;
        const payrollEmployeeId = field === "payrollEmployeeId" ? value : row.payrollEmployeeId;
        return {
          ...row,
          [field]: value,
          status: normalizeText(payrollEmployeeId) ? "Configured" : "Missing payroll ID",
          updatedAt: new Date().toISOString(),
        };
      }),
    );
  }

  async function saveDirectory() {
    const next = directory.map((row) => ({
      ...row,
      status: normalizeText(row.payrollEmployeeId) ? "Configured" : "Missing payroll ID",
      updatedAt: new Date().toISOString(),
    }));
    setDirectory(next);
    try {
      const payload = await saveAdminPayrollDirectory(next);
      if (Array.isArray(payload?.items)) setDirectory(payload.items);
      setNotice("Employee payroll directory saved in FCA admin workspace.");
    } catch {
      setNotice("Saved locally. Central payroll directory save failed.");
    }
  }

  return (
    <PortalShell
      title="Payroll Admin"
      subtitle="Admin-gated company bank, payroll, and tax configuration for FCA."
      activeHref="/portal/admin/payroll"
      currentJourney="finance"
      routeOverlay={routeStateOverlays.admin}
      primaryHref="/portal/admin"
      primaryLabel="Open Admin"
    >
      <PortalSliceAuricrux
        title="Auricrux Payroll Governance"
        targetObjectType="PayrollAdmin"
        targetObjectId="FCA-PAYROLL-ADMIN"
        sourceRoute="/portal/admin/payroll"
        rationale="Payroll controls must stay tied to finance compliance, security posture, and operator continuity."
        nextAction="Validate payroll keys and employee mappings before each live campaign cycle."
        actionHref="/portal/auricrux"
        actionLabel="Open Auricrux hub"
      />
      {notice ? (
        <PortalAlert tone="success" title="Saved" onDismiss={() => setNotice("")}>
          {notice}
        </PortalAlert>
      ) : null}

      <PortalPageIntro
        eyebrow="Admin only"
        title="Company payroll and banking control plane"
        detail="Use this route for FCA-only company settings. Employee personal banking and W-4 inputs are intentionally separated into the employee-gated route."
        actions={[
          <a key="employee-payroll" href="/portal/employee/payroll" style={portalButtonPrimary}>Open Employee Payroll Route</a>,
          <a key="internal-company" href="/portal/admin/internal" style={portalButtonPrimary}>Open Internal Company Records</a>,
        ]}
      />

      <PortalQuickStats
        items={[
          {
            label: "Company profile",
            value: `${profileHealth.completeCount}/${profileHealth.total}`,
            hint: profileHealth.ready ? "Ready for readiness keys" : "Missing required settings",
          },
          {
            label: "Employee IDs",
            value: `${employeeHealth.complete}/${employeeHealth.total}`,
            hint: employeeHealth.ready ? "Employee IDs configured" : "Add payroll IDs",
          },
          {
            label: "Last update",
            value: profile.updatedAt ? new Date(profile.updatedAt).toLocaleDateString() : "Pending",
            hint: profile.updatedAt ? new Date(profile.updatedAt).toLocaleTimeString() : "No save yet",
          },
        ]}
      />

      <form onSubmit={saveProfile} style={{ ...portalCardStyle, marginBottom: 16 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 12 }}>
          <label>
            <div style={{ fontWeight: 700, marginBottom: 6 }}>Bank name</div>
            <input value={profile.bankName} onChange={(event) => updateField("bankName", event.target.value)} style={INPUT} placeholder="Wells Fargo" />
          </label>
          <label>
            <div style={{ fontWeight: 700, marginBottom: 6 }}>Routing fingerprint</div>
            <input value={profile.bankRoutingFingerprint} onChange={(event) => updateField("bankRoutingFingerprint", event.target.value)} style={INPUT} placeholder="wf-routing-fpr-..." />
          </label>
          <label>
            <div style={{ fontWeight: 700, marginBottom: 6 }}>Account fingerprint</div>
            <input value={profile.bankAccountFingerprint} onChange={(event) => updateField("bankAccountFingerprint", event.target.value)} style={INPUT} placeholder="wf-account-fpr-..." />
          </label>
          <label>
            <div style={{ fontWeight: 700, marginBottom: 6 }}>Payout destination ID</div>
            <input value={profile.payoutDestinationId} onChange={(event) => updateField("payoutDestinationId", event.target.value)} style={INPUT} placeholder="fca-payout-main" />
          </label>
          <label>
            <div style={{ fontWeight: 700, marginBottom: 6 }}>Payroll provider</div>
            <input value={profile.payrollProvider} onChange={(event) => updateField("payrollProvider", event.target.value)} style={INPUT} placeholder="FCA" />
          </label>
          <label>
            <div style={{ fontWeight: 700, marginBottom: 6 }}>Payroll company ID</div>
            <input value={profile.payrollCompanyId} onChange={(event) => updateField("payrollCompanyId", event.target.value)} style={INPUT} placeholder="FCA-PRIMARY" />
          </label>
          <label>
            <div style={{ fontWeight: 700, marginBottom: 6 }}>Tax provider</div>
            <input value={profile.taxProvider} onChange={(event) => updateField("taxProvider", event.target.value)} style={INPUT} placeholder="FCA Tax" />
          </label>
          <label>
            <div style={{ fontWeight: 700, marginBottom: 6 }}>Tax account ID</div>
            <input value={profile.taxAccountId} onChange={(event) => updateField("taxAccountId", event.target.value)} style={INPUT} placeholder="FCA-TAX-PRIMARY" />
          </label>
        </div>

        <div style={{ marginTop: 14, display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <button type="submit" style={portalButtonPrimary}>Save Admin Payroll Profile</button>
          <PortalStatusBadge status={profileHealth.ready ? "Profile ready" : "Profile incomplete"} active={profileHealth.ready} />
        </div>
      </form>

      <div style={{ ...portalCardStyle, marginBottom: 16 }}>
        <div style={{ fontWeight: 800, marginBottom: 12 }}>Employee payroll IDs</div>
        <div style={{ display: "grid", gap: 10 }}>
          {directory.map((row) => (
            <div key={row.id} style={{ border: `1px solid ${portalTokens.border}`, borderRadius: 12, padding: 12, background: portalTokens.surface }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 10 }}>
                <label>
                  <div style={{ fontWeight: 700, marginBottom: 6 }}>Employee name</div>
                  <input value={row.employeeName} onChange={(event) => updateEmployeeRow(row.id, "employeeName", event.target.value)} style={INPUT} />
                </label>
                <label>
                  <div style={{ fontWeight: 700, marginBottom: 6 }}>Employee email</div>
                  <input value={row.employeeEmail} onChange={(event) => updateEmployeeRow(row.id, "employeeEmail", event.target.value)} style={INPUT} />
                </label>
                <label>
                  <div style={{ fontWeight: 700, marginBottom: 6 }}>Payroll employee ID</div>
                  <input value={row.payrollEmployeeId} onChange={(event) => updateEmployeeRow(row.id, "payrollEmployeeId", event.target.value)} style={INPUT} placeholder="fca-payroll-emp-..." />
                </label>
              </div>
              <div style={{ marginTop: 10, display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                <PortalStatusBadge status={row.status} active={row.status === "Configured"} />
                <div style={{ color: portalTokens.muted, fontSize: 12 }}>
                  Updated: {row.updatedAt ? new Date(row.updatedAt).toLocaleString() : "Pending"}
                </div>
              </div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 12 }}>
          <button type="button" style={portalButtonPrimary} onClick={saveDirectory}>Save Employee Payroll Directory</button>
        </div>
      </div>

      <PortalEntityTable
        columns={[
          { key: "key", label: "Readiness key" },
          {
            key: "value",
            label: "Current value",
            render: (row) => (row.value ? row.value : <span style={{ color: portalTokens.muted }}>Missing</span>),
          },
          {
            key: "status",
            label: "Status",
            render: (row) => <PortalStatusBadge status={row.value ? "Configured" : "Missing"} active={Boolean(row.value)} />,
          },
        ]}
        rows={keyRows}
        emptyTitle="No readiness key mappings"
        emptyDetail="Add payroll admin inputs to produce readiness values."
        emptyPrimaryHref="/portal/admin/payroll"
        emptyPrimaryLabel="Configure now"
      />
    </PortalShell>
  );
}
