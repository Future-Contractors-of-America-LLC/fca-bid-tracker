const STORE_KEY = "__FCA_INTERNAL_OPS_STORE__";
const DEFAULT_TENANT_ID = "TEN-FCA-001";

function nowIso() {
  return new Date().toISOString();
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function normalizeText(value) {
  return String(value || "").trim();
}

function normalizeRole(role = "") {
  return String(role || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function isAdminRole(role = "") {
  const normalized = normalizeRole(role);
  if (!normalized) return false;
  return ["owner", "admin", "founder", "system admin", "accounting", "payroll admin", "hr"].some((token) => normalized.includes(token));
}

export function isEmployeeRole(role = "") {
  const normalized = normalizeRole(role);
  if (!normalized) return false;
  return ["employee", "project coordinator", "superintendent", "field operations", "estimator"].some((token) => normalized.includes(token));
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

function defaultAdminPayrollDirectory() {
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

function defaultInternalCompanyProfile() {
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

function defaultInternalEmployeeDirectory() {
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

function defaultEmployeePayrollProfile(email = "") {
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

function defaultTenantStore() {
  return {
    adminPayrollProfile: defaultAdminPayrollProfile(),
    adminPayrollDirectory: defaultAdminPayrollDirectory(),
    internalCompanyProfile: defaultInternalCompanyProfile(),
    internalEmployeeDirectory: defaultInternalEmployeeDirectory(),
    employeePayrollProfiles: {},
    employeeInternalProfiles: {},
    audit: [],
  };
}

function getStore() {
  if (!globalThis[STORE_KEY]) {
    globalThis[STORE_KEY] = {
      tenants: {
        [DEFAULT_TENANT_ID]: defaultTenantStore(),
      },
    };
  }
  return globalThis[STORE_KEY];
}

function resolveTenantId(tenantId) {
  const normalized = normalizeText(tenantId);
  return normalized || DEFAULT_TENANT_ID;
}

export function getTenantInternalOpsStore(tenantId) {
  const store = getStore();
  const id = resolveTenantId(tenantId);
  if (!store.tenants[id]) {
    store.tenants[id] = defaultTenantStore();
  }
  return store.tenants[id];
}

function recordAudit(store, { actorEmail = "", actorRole = "", scope = "", action = "", target = "", detail = "" }) {
  const entry = {
    id: `INT-AUD-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    time: nowIso(),
    actorEmail: normalizeText(actorEmail),
    actorRole: normalizeText(actorRole),
    scope: normalizeText(scope),
    action: normalizeText(action),
    target: normalizeText(target),
    detail: normalizeText(detail),
  };
  store.audit = [entry, ...(store.audit || [])].slice(0, 300);
  return entry;
}

export function listInternalOpsAudit(tenantId) {
  return clone(getTenantInternalOpsStore(tenantId).audit || []);
}

export function getAdminPayrollProfile(tenantId) {
  return clone(getTenantInternalOpsStore(tenantId).adminPayrollProfile || defaultAdminPayrollProfile());
}

export function setAdminPayrollProfile(tenantId, payload, actor = {}) {
  const store = getTenantInternalOpsStore(tenantId);
  store.adminPayrollProfile = {
    ...store.adminPayrollProfile,
    ...payload,
    updatedAt: nowIso(),
  };
  recordAudit(store, {
    actorEmail: actor.email,
    actorRole: actor.role,
    scope: "admin-payroll",
    action: "upsert-profile",
    target: "company-payroll-profile",
    detail: "Admin payroll company profile updated.",
  });
  return clone(store.adminPayrollProfile);
}

export function getAdminPayrollDirectory(tenantId) {
  return clone(getTenantInternalOpsStore(tenantId).adminPayrollDirectory || defaultAdminPayrollDirectory());
}

export function setAdminPayrollDirectory(tenantId, rows, actor = {}) {
  const store = getTenantInternalOpsStore(tenantId);
  const normalizedRows = Array.isArray(rows)
    ? rows.map((row, index) => {
        const payrollEmployeeId = normalizeText(row?.payrollEmployeeId);
        return {
          id: normalizeText(row?.id) || `employee-${index + 1}`,
          employeeName: normalizeText(row?.employeeName),
          employeeEmail: normalizeText(row?.employeeEmail).toLowerCase(),
          payrollEmployeeId,
          status: payrollEmployeeId ? "Configured" : "Missing payroll ID",
          updatedAt: nowIso(),
        };
      })
    : [];
  store.adminPayrollDirectory = normalizedRows;
  recordAudit(store, {
    actorEmail: actor.email,
    actorRole: actor.role,
    scope: "admin-payroll",
    action: "replace-directory",
    target: "payroll-employee-directory",
    detail: `Admin payroll directory replaced with ${normalizedRows.length} rows.`,
  });
  return clone(store.adminPayrollDirectory);
}

export function getInternalCompanyProfile(tenantId) {
  return clone(getTenantInternalOpsStore(tenantId).internalCompanyProfile || defaultInternalCompanyProfile());
}

export function setInternalCompanyProfile(tenantId, payload, actor = {}) {
  const store = getTenantInternalOpsStore(tenantId);
  store.internalCompanyProfile = {
    ...store.internalCompanyProfile,
    ...payload,
    updatedAt: nowIso(),
  };
  recordAudit(store, {
    actorEmail: actor.email,
    actorRole: actor.role,
    scope: "internal-company",
    action: "upsert-profile",
    target: "internal-company-profile",
    detail: "Internal company profile updated.",
  });
  return clone(store.internalCompanyProfile);
}

export function getInternalEmployeeDirectory(tenantId) {
  return clone(getTenantInternalOpsStore(tenantId).internalEmployeeDirectory || defaultInternalEmployeeDirectory());
}

export function setInternalEmployeeDirectory(tenantId, rows, actor = {}) {
  const store = getTenantInternalOpsStore(tenantId);
  const normalizedRows = Array.isArray(rows)
    ? rows.map((row, index) => ({
        id: normalizeText(row?.id) || `emp-${index + 1}`,
        fullName: normalizeText(row?.fullName),
        workEmail: normalizeText(row?.workEmail).toLowerCase(),
        department: normalizeText(row?.department),
        employmentType: normalizeText(row?.employmentType),
        manager: normalizeText(row?.manager),
        status: normalizeText(row?.status) || "Active",
        updatedAt: nowIso(),
      }))
    : [];
  store.internalEmployeeDirectory = normalizedRows;
  recordAudit(store, {
    actorEmail: actor.email,
    actorRole: actor.role,
    scope: "internal-company",
    action: "replace-directory",
    target: "internal-employee-directory",
    detail: `Internal employee directory replaced with ${normalizedRows.length} rows.`,
  });
  return clone(store.internalEmployeeDirectory);
}

function normalizeProfileEmail(email, fallback = "") {
  const normalized = normalizeText(email).toLowerCase();
  return normalized || normalizeText(fallback).toLowerCase();
}

export function getEmployeePayrollProfile(tenantId, employeeEmail) {
  const store = getTenantInternalOpsStore(tenantId);
  const email = normalizeProfileEmail(employeeEmail);
  if (!email) return defaultEmployeePayrollProfile("");
  return clone(store.employeePayrollProfiles[email] || defaultEmployeePayrollProfile(email));
}

export function upsertEmployeePayrollProfile(tenantId, employeeEmail, payload, actor = {}) {
  const store = getTenantInternalOpsStore(tenantId);
  const email = normalizeProfileEmail(employeeEmail, payload?.employeeEmail);
  if (!email) {
    throw new Error("Employee email is required.");
  }
  const current = store.employeePayrollProfiles[email] || defaultEmployeePayrollProfile(email);
  const merged = {
    ...current,
    ...payload,
    employeeEmail: email,
    directDeposit: {
      ...current.directDeposit,
      ...(payload?.directDeposit || {}),
    },
    w4: {
      ...current.w4,
      ...(payload?.w4 || {}),
    },
    updatedAt: nowIso(),
    submittedAt: payload?.submittedAt ? nowIso() : current.submittedAt,
  };
  store.employeePayrollProfiles[email] = merged;
  recordAudit(store, {
    actorEmail: actor.email,
    actorRole: actor.role,
    scope: "employee-payroll",
    action: payload?.submittedAt ? "submit-profile" : "save-draft",
    target: email,
    detail: payload?.submittedAt ? "Employee payroll profile submitted." : "Employee payroll profile draft updated.",
  });
  return clone(merged);
}

export function getEmployeeInternalProfile(tenantId, employeeEmail) {
  const store = getTenantInternalOpsStore(tenantId);
  const email = normalizeProfileEmail(employeeEmail);
  if (!email) return defaultEmployeeInternalProfile("");
  return clone(store.employeeInternalProfiles[email] || defaultEmployeeInternalProfile(email));
}

export function upsertEmployeeInternalProfile(tenantId, employeeEmail, payload, actor = {}) {
  const store = getTenantInternalOpsStore(tenantId);
  const email = normalizeProfileEmail(employeeEmail, payload?.employeeEmail);
  if (!email) {
    throw new Error("Employee email is required.");
  }
  const current = store.employeeInternalProfiles[email] || defaultEmployeeInternalProfile(email);
  const merged = {
    ...current,
    ...payload,
    employeeEmail: email,
    updatedAt: nowIso(),
  };
  store.employeeInternalProfiles[email] = merged;
  recordAudit(store, {
    actorEmail: actor.email,
    actorRole: actor.role,
    scope: "employee-internal",
    action: "save-profile",
    target: email,
    detail: "Employee internal profile updated.",
  });
  return clone(merged);
}
