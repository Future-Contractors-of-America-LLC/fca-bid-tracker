import { useEffect, useMemo, useState } from "react";
import PortalShell from "../../components/PortalShell";
import PortalSliceAuricrux from "../../components/portal/PortalSliceAuricrux";
import useCustomerSession from "../../hooks/useCustomerSession";
import { PortalAlert, PortalPageIntro, PortalQuickStats, PortalStatusBadge } from "../../components/portal/PortalPrimitives";
import { portalButtonPrimary, portalCardStyle, portalInputStyle, portalTokens } from "../../portalDesignTokens";
import { routeStateOverlays } from "../../systemState";
import { fetchEmployeePayrollProfile, saveEmployeePayrollProfile } from "../../api/internalOperationsClient";

const EMPLOYEE_PAYROLL_PROFILE_KEY = "fca_employee_payroll_profile_v1";

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

function defaultEmployeePayload(email = "") {
  return {
    employeeEmail: email,
    employeeId: "",
    legalFirstName: "",
    legalLastName: "",
    directDeposit: {
      bankName: "",
      accountType: "checking",
      routingFingerprint: "",
      accountFingerprint: "",
      splitMode: "full",
      splitPercent: "100",
    },
    w4: {
      filingStatus: "single",
      dependentCredits: "0",
      otherIncome: "0",
      deductions: "0",
      extraWithholding: "0",
      signatureName: "",
      consent: false,
    },
    updatedAt: null,
    submittedAt: null,
  };
}

function getEmployeeStore() {
  return readLocalJson(EMPLOYEE_PAYROLL_PROFILE_KEY, {});
}

function setEmployeeStore(store) {
  writeLocalJson(EMPLOYEE_PAYROLL_PROFILE_KEY, store);
}

function isFilled(value) {
  return String(value || "").trim().length > 0;
}

function completionState(payload) {
  const directDepositFields = [
    payload.directDeposit.bankName,
    payload.directDeposit.routingFingerprint,
    payload.directDeposit.accountFingerprint,
    payload.directDeposit.accountType,
  ];
  const w4Fields = [
    payload.w4.filingStatus,
    payload.w4.signatureName,
  ];
  const identityFields = [payload.legalFirstName, payload.legalLastName, payload.employeeId, payload.employeeEmail];

  const completed = [...identityFields, ...directDepositFields, ...w4Fields].filter(isFilled).length + (payload.w4.consent ? 1 : 0);
  const total = identityFields.length + directDepositFields.length + w4Fields.length + 1;

  return {
    completed,
    total,
    readyToSubmit: completed === total,
  };
}

export default function PortalEmployeePayroll() {
  const { session } = useCustomerSession();
  const employeeEmail = (session?.email || "").trim().toLowerCase() || "employee@unknown.invalid";

  const [payload, setPayload] = useState(() => {
    const store = getEmployeeStore();
    return store[employeeEmail] || defaultEmployeePayload(employeeEmail);
  });
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let active = true;

    async function hydrate() {
      try {
        const payloadFromApi = await fetchEmployeePayrollProfile(employeeEmail);
        if (!active) return;
        if (payloadFromApi?.item) setPayload(payloadFromApi.item);
      } catch {
        if (!active) return;
        setNotice("Central employee payroll profile not reachable. Using local workspace cache.");
      }
    }

    hydrate();
    return () => {
      active = false;
    };
  }, [employeeEmail]);

  useEffect(() => {
    setPayload((current) => {
      if (current.employeeEmail === employeeEmail) return current;
      const store = getEmployeeStore();
      return store[employeeEmail] || defaultEmployeePayload(employeeEmail);
    });
  }, [employeeEmail]);

  useEffect(() => {
    const store = getEmployeeStore();
    setEmployeeStore({
      ...store,
      [employeeEmail]: payload,
    });
  }, [employeeEmail, payload]);

  const health = useMemo(() => completionState(payload), [payload]);

  function updateRoot(field, value) {
    setPayload((current) => ({
      ...current,
      [field]: value,
      updatedAt: new Date().toISOString(),
    }));
  }

  function updateDirectDeposit(field, value) {
    setPayload((current) => ({
      ...current,
      directDeposit: {
        ...current.directDeposit,
        [field]: value,
      },
      updatedAt: new Date().toISOString(),
    }));
  }

  function updateW4(field, value) {
    setPayload((current) => ({
      ...current,
      w4: {
        ...current.w4,
        [field]: value,
      },
      updatedAt: new Date().toISOString(),
    }));
  }

  async function saveDraft(event) {
    event.preventDefault();
    const next = {
      ...payload,
      updatedAt: new Date().toISOString(),
    };
    setPayload(next);
    try {
      const result = await saveEmployeePayrollProfile(next, { submit: false });
      if (result?.item) setPayload(result.item);
      setNotice("Employee payroll profile draft saved.");
    } catch {
      setNotice("Saved locally. Central employee payroll save failed.");
    }
  }

  async function submitProfile() {
    if (!health.readyToSubmit) {
      setNotice("Complete all required direct deposit and W-4 fields before submitting.");
      return;
    }
    const next = {
      ...payload,
      submittedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setPayload(next);
    try {
      const result = await saveEmployeePayrollProfile(next, { submit: true });
      if (result?.item) setPayload(result.item);
      setNotice("Employee payroll profile submitted to FCA payroll queue.");
    } catch {
      setNotice("Saved locally. Central employee payroll submit failed.");
    }
  }

  return (
    <PortalShell
      title="Employee Payroll"
      subtitle="Employee-gated direct deposit and W-4 profile."
      activeHref="/portal/employee/payroll"
      currentJourney="finance"
      routeOverlay={routeStateOverlays.profile}
      primaryHref="/portal/profile"
      primaryLabel="Open Profile"
    >
      <PortalSliceAuricrux
        title="Auricrux Employee Payroll Guardrails"
        targetObjectType="EmployeePayroll"
        targetObjectId={employeeEmail}
        sourceRoute="/portal/employee/payroll"
        rationale="Employee payroll actions must preserve identity certainty and payroll compliance continuity."
        nextAction="Complete required payroll profile fields and submit through governed workflow."
        actionHref="/portal/auricrux"
        actionLabel="Open Auricrux hub"
      />
      {notice ? (
        <PortalAlert tone="info" title="Payroll profile status" onDismiss={() => setNotice("")}>
          {notice}
        </PortalAlert>
      ) : null}

      <PortalPageIntro
        eyebrow="Employee only"
        title="Direct deposit and W-4 self-service"
        detail="This route stores personal payroll preferences separately from admin company settings. Use bank fingerprints and withholding amounts only."
        actions={<a href="/portal/profile" style={portalButtonPrimary}>Back to Profile</a>}
      />

      <PortalQuickStats
        items={[
          {
            label: "Completion",
            value: `${health.completed}/${health.total}`,
            hint: health.readyToSubmit ? "Ready to submit" : "Missing required fields",
          },
          {
            label: "Last draft save",
            value: payload.updatedAt ? new Date(payload.updatedAt).toLocaleDateString() : "Pending",
            hint: payload.updatedAt ? new Date(payload.updatedAt).toLocaleTimeString() : "No draft yet",
          },
          {
            label: "Submission",
            value: payload.submittedAt ? "Submitted" : "Draft",
            hint: payload.submittedAt ? new Date(payload.submittedAt).toLocaleString() : "Not submitted",
          },
        ]}
      />

      <form onSubmit={saveDraft} style={{ ...portalCardStyle, marginBottom: 16 }}>
        <h3 style={{ marginTop: 0 }}>Identity</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
          <label>
            <div style={{ fontWeight: 700, marginBottom: 6 }}>Employee email</div>
            <input value={payload.employeeEmail} onChange={(event) => updateRoot("employeeEmail", event.target.value)} style={INPUT} />
          </label>
          <label>
            <div style={{ fontWeight: 700, marginBottom: 6 }}>Employee ID</div>
            <input value={payload.employeeId} onChange={(event) => updateRoot("employeeId", event.target.value)} style={INPUT} placeholder="fca-emp-..." />
          </label>
          <label>
            <div style={{ fontWeight: 700, marginBottom: 6 }}>Legal first name</div>
            <input value={payload.legalFirstName} onChange={(event) => updateRoot("legalFirstName", event.target.value)} style={INPUT} />
          </label>
          <label>
            <div style={{ fontWeight: 700, marginBottom: 6 }}>Legal last name</div>
            <input value={payload.legalLastName} onChange={(event) => updateRoot("legalLastName", event.target.value)} style={INPUT} />
          </label>
        </div>

        <h3>Direct deposit</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
          <label>
            <div style={{ fontWeight: 700, marginBottom: 6 }}>Bank name</div>
            <input value={payload.directDeposit.bankName} onChange={(event) => updateDirectDeposit("bankName", event.target.value)} style={INPUT} placeholder="Wells Fargo" />
          </label>
          <label>
            <div style={{ fontWeight: 700, marginBottom: 6 }}>Account type</div>
            <select value={payload.directDeposit.accountType} onChange={(event) => updateDirectDeposit("accountType", event.target.value)} style={INPUT}>
              <option value="checking">Checking</option>
              <option value="savings">Savings</option>
            </select>
          </label>
          <label>
            <div style={{ fontWeight: 700, marginBottom: 6 }}>Routing fingerprint</div>
            <input value={payload.directDeposit.routingFingerprint} onChange={(event) => updateDirectDeposit("routingFingerprint", event.target.value)} style={INPUT} placeholder="employee-routing-fpr-..." />
          </label>
          <label>
            <div style={{ fontWeight: 700, marginBottom: 6 }}>Account fingerprint</div>
            <input value={payload.directDeposit.accountFingerprint} onChange={(event) => updateDirectDeposit("accountFingerprint", event.target.value)} style={INPUT} placeholder="employee-account-fpr-..." />
          </label>
          <label>
            <div style={{ fontWeight: 700, marginBottom: 6 }}>Deposit mode</div>
            <select value={payload.directDeposit.splitMode} onChange={(event) => updateDirectDeposit("splitMode", event.target.value)} style={INPUT}>
              <option value="full">100% primary account</option>
              <option value="split">Split deposit</option>
            </select>
          </label>
          <label>
            <div style={{ fontWeight: 700, marginBottom: 6 }}>Primary split percent</div>
            <input value={payload.directDeposit.splitPercent} onChange={(event) => updateDirectDeposit("splitPercent", event.target.value)} style={INPUT} placeholder="100" />
          </label>
        </div>

        <h3>W-4 withholding</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
          <label>
            <div style={{ fontWeight: 700, marginBottom: 6 }}>Filing status</div>
            <select value={payload.w4.filingStatus} onChange={(event) => updateW4("filingStatus", event.target.value)} style={INPUT}>
              <option value="single">Single</option>
              <option value="married-joint">Married filing jointly</option>
              <option value="head-household">Head of household</option>
            </select>
          </label>
          <label>
            <div style={{ fontWeight: 700, marginBottom: 6 }}>Dependent credits ($)</div>
            <input value={payload.w4.dependentCredits} onChange={(event) => updateW4("dependentCredits", event.target.value)} style={INPUT} placeholder="0" />
          </label>
          <label>
            <div style={{ fontWeight: 700, marginBottom: 6 }}>Other income ($)</div>
            <input value={payload.w4.otherIncome} onChange={(event) => updateW4("otherIncome", event.target.value)} style={INPUT} placeholder="0" />
          </label>
          <label>
            <div style={{ fontWeight: 700, marginBottom: 6 }}>Deductions ($)</div>
            <input value={payload.w4.deductions} onChange={(event) => updateW4("deductions", event.target.value)} style={INPUT} placeholder="0" />
          </label>
          <label>
            <div style={{ fontWeight: 700, marginBottom: 6 }}>Extra withholding per pay period ($)</div>
            <input value={payload.w4.extraWithholding} onChange={(event) => updateW4("extraWithholding", event.target.value)} style={INPUT} placeholder="0" />
          </label>
          <label>
            <div style={{ fontWeight: 700, marginBottom: 6 }}>Electronic signature</div>
            <input value={payload.w4.signatureName} onChange={(event) => updateW4("signatureName", event.target.value)} style={INPUT} placeholder="Type full legal name" />
          </label>
        </div>

        <label style={{ display: "flex", gap: 8, marginTop: 14, alignItems: "center" }}>
          <input type="checkbox" checked={payload.w4.consent} onChange={(event) => updateW4("consent", event.target.checked)} />
          <span>I confirm this direct deposit and W-4 information is correct and authorized for payroll processing.</span>
        </label>

        <div style={{ marginTop: 14, display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <button type="submit" style={portalButtonPrimary}>Save Draft</button>
          <button type="button" style={portalButtonPrimary} onClick={submitProfile}>Submit Payroll Profile</button>
          <PortalStatusBadge status={health.readyToSubmit ? "Ready" : "Incomplete"} active={health.readyToSubmit} />
        </div>
      </form>

      <div style={{ ...portalCardStyle, color: portalTokens.muted }}>
        This employee route is intentionally separated from company-level admin settings and keeps profile data scoped to the authenticated employee session.
      </div>
    </PortalShell>
  );
}
