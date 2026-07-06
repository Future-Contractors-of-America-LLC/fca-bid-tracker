import { useEffect, useMemo, useState } from "react";
import PortalShell from "../../components/PortalShell";
import PortalSliceAuricrux from "../../components/portal/PortalSliceAuricrux";
import useCustomerSession from "../../hooks/useCustomerSession";
import { PortalAlert, PortalPageIntro, PortalQuickStats, PortalStatusBadge } from "../../components/portal/PortalPrimitives";
import { portalButtonPrimary, portalCardStyle, portalInputStyle } from "../../portalDesignTokens";
import { routeStateOverlays } from "../../systemState";
import { fetchEmployeeInternalProfile, saveEmployeeInternalProfile } from "../../api/internalOperationsClient";

const EMPLOYEE_INTERNAL_PROFILE_KEY = "fca_employee_internal_profile_v1";

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

function defaultEmployeeInternalProfile(email = "") {
  return {
    employeeEmail: email,
    preferredName: "",
    phone: "",
    homeCityState: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
    tshirtSize: "",
    ppeSizingNotes: "",
    updatedAt: null,
  };
}

function completion(profile) {
  const required = [
    profile.employeeEmail,
    profile.preferredName,
    profile.phone,
    profile.homeCityState,
    profile.emergencyContactName,
    profile.emergencyContactPhone,
  ];
  const done = required.filter((item) => String(item || "").trim()).length;
  return {
    done,
    total: required.length,
    ready: done === required.length,
  };
}

export default function PortalEmployeeInternalProfile() {
  const { session } = useCustomerSession();
  const employeeEmail = (session?.email || "").trim().toLowerCase() || "employee@unknown.invalid";

  const [profile, setProfile] = useState(() => {
    const store = readLocalJson(EMPLOYEE_INTERNAL_PROFILE_KEY, {});
    return store[employeeEmail] || defaultEmployeeInternalProfile(employeeEmail);
  });
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let active = true;

    async function hydrate() {
      try {
        const payload = await fetchEmployeeInternalProfile(employeeEmail);
        if (!active) return;
        if (payload?.item) setProfile(payload.item);
      } catch {
        if (!active) return;
        setNotice("Central employee internal profile not reachable. Using local workspace cache.");
      }
    }

    hydrate();
    return () => {
      active = false;
    };
  }, [employeeEmail]);

  useEffect(() => {
    const store = readLocalJson(EMPLOYEE_INTERNAL_PROFILE_KEY, {});
    if (!store[employeeEmail]) {
      setProfile(defaultEmployeeInternalProfile(employeeEmail));
      return;
    }
    setProfile(store[employeeEmail]);
  }, [employeeEmail]);

  useEffect(() => {
    const store = readLocalJson(EMPLOYEE_INTERNAL_PROFILE_KEY, {});
    writeLocalJson(EMPLOYEE_INTERNAL_PROFILE_KEY, {
      ...store,
      [employeeEmail]: profile,
    });
  }, [employeeEmail, profile]);

  const health = useMemo(() => completion(profile), [profile]);

  function updateField(field, value) {
    setProfile((current) => ({
      ...current,
      [field]: value,
      updatedAt: new Date().toISOString(),
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
      const payload = await saveEmployeeInternalProfile(next);
      if (payload?.item) setProfile(payload.item);
      setNotice("Internal employee profile saved.");
    } catch {
      setNotice("Saved locally. Central employee internal profile save failed.");
    }
  }

  return (
    <PortalShell
      title="Employee Internal Profile"
      subtitle="Employee-gated internal contact and employment profile data."
      activeHref="/portal/employee/internal"
      currentJourney="coordination"
      routeOverlay={routeStateOverlays.profile}
      primaryHref="/portal/employee/payroll"
      primaryLabel="Open Employee Payroll"
    >
      <PortalSliceAuricrux
        title="Auricrux Internal Profile Continuity"
        targetObjectType="EmployeeInternalProfile"
        targetObjectId={employeeEmail}
        sourceRoute="/portal/employee/internal"
        rationale="Internal employee profile updates must remain tied to staffing continuity and secure operations."
        nextAction="Keep internal profile complete so routing and escalation remain reliable."
        actionHref="/portal/auricrux"
        actionLabel="Open Auricrux hub"
      />
      {notice ? (
        <PortalAlert tone="success" title="Saved" onDismiss={() => setNotice("")}>
          {notice}
        </PortalAlert>
      ) : null}

      <PortalPageIntro
        eyebrow="Internal employee lane"
        title="Employee internal information"
        detail="This route is employee-gated and stores internal personal profile details separate from company admin records."
        actions={<a href="/portal/employee/payroll" style={portalButtonPrimary}>Open Payroll Profile</a>}
      />

      <PortalQuickStats
        items={[
          {
            label: "Completion",
            value: `${health.done}/${health.total}`,
            hint: health.ready ? "Profile complete" : "Missing required fields",
          },
          {
            label: "Last update",
            value: profile.updatedAt ? new Date(profile.updatedAt).toLocaleDateString() : "Pending",
            hint: profile.updatedAt ? new Date(profile.updatedAt).toLocaleTimeString() : "No save yet",
          },
          {
            label: "Status",
            value: health.ready ? "Ready" : "In progress",
            hint: "Internal employee record",
          },
        ]}
      />

      <form onSubmit={saveProfile} style={portalCardStyle}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
          <label>
            <div style={{ fontWeight: 700, marginBottom: 6 }}>Employee email</div>
            <input value={profile.employeeEmail} onChange={(event) => updateField("employeeEmail", event.target.value)} style={INPUT} />
          </label>
          <label>
            <div style={{ fontWeight: 700, marginBottom: 6 }}>Preferred name</div>
            <input value={profile.preferredName} onChange={(event) => updateField("preferredName", event.target.value)} style={INPUT} />
          </label>
          <label>
            <div style={{ fontWeight: 700, marginBottom: 6 }}>Phone</div>
            <input value={profile.phone} onChange={(event) => updateField("phone", event.target.value)} style={INPUT} />
          </label>
          <label>
            <div style={{ fontWeight: 700, marginBottom: 6 }}>Home city/state</div>
            <input value={profile.homeCityState} onChange={(event) => updateField("homeCityState", event.target.value)} style={INPUT} />
          </label>
          <label>
            <div style={{ fontWeight: 700, marginBottom: 6 }}>Emergency contact name</div>
            <input value={profile.emergencyContactName} onChange={(event) => updateField("emergencyContactName", event.target.value)} style={INPUT} />
          </label>
          <label>
            <div style={{ fontWeight: 700, marginBottom: 6 }}>Emergency contact phone</div>
            <input value={profile.emergencyContactPhone} onChange={(event) => updateField("emergencyContactPhone", event.target.value)} style={INPUT} />
          </label>
          <label>
            <div style={{ fontWeight: 700, marginBottom: 6 }}>T-shirt size</div>
            <select value={profile.tshirtSize} onChange={(event) => updateField("tshirtSize", event.target.value)} style={INPUT}>
              <option value="">Select</option>
              <option value="XS">XS</option>
              <option value="S">S</option>
              <option value="M">M</option>
              <option value="L">L</option>
              <option value="XL">XL</option>
              <option value="2XL">2XL</option>
            </select>
          </label>
          <label>
            <div style={{ fontWeight: 700, marginBottom: 6 }}>PPE sizing notes</div>
            <input value={profile.ppeSizingNotes} onChange={(event) => updateField("ppeSizingNotes", event.target.value)} style={INPUT} placeholder="Boot size, vest size, hard-hat fit..." />
          </label>
        </div>

        <div style={{ marginTop: 14, display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <button type="submit" style={portalButtonPrimary}>Save Internal Employee Profile</button>
          <PortalStatusBadge status={health.ready ? "Complete" : "Incomplete"} active={health.ready} />
        </div>
      </form>
    </PortalShell>
  );
}
