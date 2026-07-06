import { useEffect, useMemo, useState } from "react";
import PortalShell from "../../components/PortalShell";
import PortalSliceAuricrux from "../../components/portal/PortalSliceAuricrux";
import { PortalAlert, PortalEntityTable, PortalPageIntro, PortalQuickStats, PortalStatusBadge } from "../../components/portal/PortalPrimitives";
import { portalButtonPrimary, portalCardStyle, portalInputStyle, portalTokens } from "../../portalDesignTokens";
import { routeStateOverlays } from "../../systemState";
import {
  fetchInternalCompanyProfile,
  fetchInternalEmployeeDirectory,
  saveInternalCompanyProfile,
  saveInternalEmployeeDirectory,
} from "../../api/internalOperationsClient";

const INTERNAL_COMPANY_PROFILE_KEY = "fca_internal_company_profile_v1";
const INTERNAL_EMPLOYEE_DIRECTORY_KEY = "fca_internal_employee_directory_v1";

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
    // best effort only
  }
}

function defaultCompanyProfile() {
  return {
    legalName: "Future Contractors of America LLC",
    dbaName: "FCA",
    einMasked: "",
    headquartersAddress: "",
    hrSupportEmail: "",
    payrollSupportEmail: "",
    benefitsSupportEmail: "",
    updatedAt: null,
  };
}

function defaultEmployeeDirectory() {
  return [
    {
      id: "emp-michael",
      fullName: "Michael",
      workEmail: "michael@futurecontractorsofamerica.com",
      department: "Leadership",
      employmentType: "Full-time",
      manager: "Board",
      status: "Active",
      updatedAt: null,
    },
    {
      id: "emp-amanda",
      fullName: "Amanda",
      workEmail: "amanda@futurecontractorsofamerica.com",
      department: "Operations",
      employmentType: "Full-time",
      manager: "Michael",
      status: "Active",
      updatedAt: null,
    },
  ];
}

function normalizeText(value) {
  return String(value || "").trim();
}

function profileCompletion(profile) {
  const required = [
    profile.legalName,
    profile.dbaName,
    profile.einMasked,
    profile.headquartersAddress,
    profile.hrSupportEmail,
    profile.payrollSupportEmail,
  ];
  const filled = required.filter((item) => normalizeText(item)).length;
  return {
    filled,
    total: required.length,
    ready: filled === required.length,
  };
}

export default function PortalInternalCompany() {
  const [companyProfile, setCompanyProfile] = useState(() => readLocalJson(INTERNAL_COMPANY_PROFILE_KEY, defaultCompanyProfile()));
  const [employeeDirectory, setEmployeeDirectory] = useState(() => readLocalJson(INTERNAL_EMPLOYEE_DIRECTORY_KEY, defaultEmployeeDirectory()));
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let active = true;

    async function hydrate() {
      try {
        const [companyPayload, employeePayload] = await Promise.all([
          fetchInternalCompanyProfile(),
          fetchInternalEmployeeDirectory(),
        ]);
        if (!active) return;
        if (companyPayload?.item) setCompanyProfile(companyPayload.item);
        if (Array.isArray(employeePayload?.items)) setEmployeeDirectory(employeePayload.items);
      } catch {
        if (!active) return;
        setNotice("Central internal records not reachable. Using local workspace cache.");
      }
    }

    hydrate();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    writeLocalJson(INTERNAL_COMPANY_PROFILE_KEY, companyProfile);
  }, [companyProfile]);

  useEffect(() => {
    writeLocalJson(INTERNAL_EMPLOYEE_DIRECTORY_KEY, employeeDirectory);
  }, [employeeDirectory]);

  const companyHealth = useMemo(() => profileCompletion(companyProfile), [companyProfile]);

  function updateCompanyField(field, value) {
    setCompanyProfile((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function saveCompanyProfile(event) {
    event.preventDefault();
    const next = {
      ...companyProfile,
      updatedAt: new Date().toISOString(),
    };
    setCompanyProfile(next);
    try {
      const payload = await saveInternalCompanyProfile(next);
      if (payload?.item) setCompanyProfile(payload.item);
      setNotice("Internal FCA company profile saved.");
    } catch {
      setNotice("Saved locally. Central internal company profile save failed.");
    }
  }

  function updateEmployeeField(id, field, value) {
    setEmployeeDirectory((current) =>
      current.map((row) => {
        if (row.id !== id) return row;
        return {
          ...row,
          [field]: value,
          updatedAt: new Date().toISOString(),
        };
      }),
    );
  }

  async function saveEmployeeDirectory() {
    const next = employeeDirectory.map((employee) => ({
      ...employee,
      updatedAt: new Date().toISOString(),
    }));
    setEmployeeDirectory(next);
    try {
      const payload = await saveInternalEmployeeDirectory(next);
      if (Array.isArray(payload?.items)) setEmployeeDirectory(payload.items);
      setNotice("Internal employee directory saved.");
    } catch {
      setNotice("Saved locally. Central internal employee directory save failed.");
    }
  }

  return (
    <PortalShell
      title="Internal Company Records"
      subtitle="Admin-gated internal FCA company and employee information."
      activeHref="/portal/admin/internal"
      currentJourney="finance"
      routeOverlay={routeStateOverlays.admin}
      primaryHref="/portal/admin/payroll"
      primaryLabel="Open Payroll Admin"
    >
      <PortalSliceAuricrux
        title="Auricrux Internal Records Governance"
        targetObjectType="InternalCompanyProfile"
        targetObjectId="FCA-INTERNAL-COMPANY"
        sourceRoute="/portal/admin/internal"
        rationale="Internal records must stay synchronized with payroll, legal, and operational governance continuity."
        nextAction="Maintain complete company and employee records before financial and workforce actions."
        actionHref="/portal/auricrux"
        actionLabel="Open Auricrux hub"
      />
      {notice ? (
        <PortalAlert tone="success" title="Saved" onDismiss={() => setNotice("")}>
          {notice}
        </PortalAlert>
      ) : null}

      <PortalPageIntro
        eyebrow="Internal admin"
        title="FCA internal company and employee records"
        detail="This route is for internal operations only. Keep this data in admin-gated workflows and do not expose it to customer-facing views."
        actions={<a href="/portal/admin/payroll" style={portalButtonPrimary}>Open Payroll Control Plane</a>}
      />

      <PortalQuickStats
        items={[
          {
            label: "Company record",
            value: `${companyHealth.filled}/${companyHealth.total}`,
            hint: companyHealth.ready ? "Profile complete" : "Missing required details",
          },
          {
            label: "Employees",
            value: String(employeeDirectory.length),
            hint: "Internal roster entries",
          },
          {
            label: "Last profile save",
            value: companyProfile.updatedAt ? new Date(companyProfile.updatedAt).toLocaleDateString() : "Pending",
            hint: companyProfile.updatedAt ? new Date(companyProfile.updatedAt).toLocaleTimeString() : "No save yet",
          },
        ]}
      />

      <form onSubmit={saveCompanyProfile} style={{ ...portalCardStyle, marginBottom: 16 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 12 }}>
          <label>
            <div style={{ fontWeight: 700, marginBottom: 6 }}>Legal company name</div>
            <input value={companyProfile.legalName} onChange={(event) => updateCompanyField("legalName", event.target.value)} style={INPUT} />
          </label>
          <label>
            <div style={{ fontWeight: 700, marginBottom: 6 }}>DBA</div>
            <input value={companyProfile.dbaName} onChange={(event) => updateCompanyField("dbaName", event.target.value)} style={INPUT} placeholder="FCA" />
          </label>
          <label>
            <div style={{ fontWeight: 700, marginBottom: 6 }}>EIN (masked)</div>
            <input value={companyProfile.einMasked} onChange={(event) => updateCompanyField("einMasked", event.target.value)} style={INPUT} placeholder="XX-XXXXXXX" />
          </label>
          <label>
            <div style={{ fontWeight: 700, marginBottom: 6 }}>Headquarters address</div>
            <input value={companyProfile.headquartersAddress} onChange={(event) => updateCompanyField("headquartersAddress", event.target.value)} style={INPUT} placeholder="City, State" />
          </label>
          <label>
            <div style={{ fontWeight: 700, marginBottom: 6 }}>HR support email</div>
            <input value={companyProfile.hrSupportEmail} onChange={(event) => updateCompanyField("hrSupportEmail", event.target.value)} style={INPUT} placeholder="hr@futurecontractorsofamerica.com" />
          </label>
          <label>
            <div style={{ fontWeight: 700, marginBottom: 6 }}>Payroll support email</div>
            <input value={companyProfile.payrollSupportEmail} onChange={(event) => updateCompanyField("payrollSupportEmail", event.target.value)} style={INPUT} placeholder="payroll@futurecontractorsofamerica.com" />
          </label>
          <label>
            <div style={{ fontWeight: 700, marginBottom: 6 }}>Benefits support email</div>
            <input value={companyProfile.benefitsSupportEmail} onChange={(event) => updateCompanyField("benefitsSupportEmail", event.target.value)} style={INPUT} placeholder="benefits@futurecontractorsofamerica.com" />
          </label>
        </div>

        <div style={{ marginTop: 14, display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <button type="submit" style={portalButtonPrimary}>Save Internal Company Record</button>
          <PortalStatusBadge status={companyHealth.ready ? "Complete" : "Incomplete"} active={companyHealth.ready} />
        </div>
      </form>

      <div style={{ ...portalCardStyle, marginBottom: 16 }}>
        <div style={{ fontWeight: 800, marginBottom: 12 }}>Internal employee directory</div>
        <div style={{ display: "grid", gap: 10 }}>
          {employeeDirectory.map((employee) => (
            <div key={employee.id} style={{ border: `1px solid ${portalTokens.border}`, borderRadius: 12, padding: 12, background: portalTokens.surface }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 10 }}>
                <label>
                  <div style={{ fontWeight: 700, marginBottom: 6 }}>Full name</div>
                  <input value={employee.fullName} onChange={(event) => updateEmployeeField(employee.id, "fullName", event.target.value)} style={INPUT} />
                </label>
                <label>
                  <div style={{ fontWeight: 700, marginBottom: 6 }}>Work email</div>
                  <input value={employee.workEmail} onChange={(event) => updateEmployeeField(employee.id, "workEmail", event.target.value)} style={INPUT} />
                </label>
                <label>
                  <div style={{ fontWeight: 700, marginBottom: 6 }}>Department</div>
                  <input value={employee.department} onChange={(event) => updateEmployeeField(employee.id, "department", event.target.value)} style={INPUT} />
                </label>
                <label>
                  <div style={{ fontWeight: 700, marginBottom: 6 }}>Employment type</div>
                  <input value={employee.employmentType} onChange={(event) => updateEmployeeField(employee.id, "employmentType", event.target.value)} style={INPUT} />
                </label>
                <label>
                  <div style={{ fontWeight: 700, marginBottom: 6 }}>Manager</div>
                  <input value={employee.manager} onChange={(event) => updateEmployeeField(employee.id, "manager", event.target.value)} style={INPUT} />
                </label>
                <label>
                  <div style={{ fontWeight: 700, marginBottom: 6 }}>Status</div>
                  <select value={employee.status} onChange={(event) => updateEmployeeField(employee.id, "status", event.target.value)} style={INPUT}>
                    <option value="Active">Active</option>
                    <option value="Leave">Leave</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </label>
              </div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 12 }}>
          <button type="button" style={portalButtonPrimary} onClick={saveEmployeeDirectory}>Save Internal Employee Directory</button>
        </div>
      </div>

      <PortalEntityTable
        columns={[
          { key: "fullName", label: "Employee" },
          { key: "workEmail", label: "Email" },
          { key: "department", label: "Department" },
          {
            key: "status",
            label: "Status",
            render: (row) => <PortalStatusBadge status={row.status} active={row.status === "Active"} />,
          },
        ]}
        rows={employeeDirectory}
        emptyTitle="No employees recorded"
        emptyDetail="Add at least one internal employee record."
        emptyPrimaryHref="/portal/admin/internal"
        emptyPrimaryLabel="Add employee"
      />
    </PortalShell>
  );
}
