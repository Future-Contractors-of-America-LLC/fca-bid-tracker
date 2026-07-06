export const MICHAEL_FOUNDER_ACCOUNT = {
  email: "local.founder@localhost.invalid",
  password: "local-dev-only",
  company: "Local Founder Workspace",
  role: "Owner / Admin",
  customerId: "CUST-LOCAL-FOUNDER-001",
  workspaceLabel: "Local Founder Workspace",
  selectedPlan: "enterprise",
  enabledProducts: {
    saas: true,
    lms: true,
    auricrux: true,
  },
  enabledComms: {
    chat: true,
    sms: true,
    phone: true,
    email: true,
    teams: true,
    conference: true,
    lecture: true,
  },
};

export const PRIMARY_TEST_ACCOUNT = {
  email: "local.test@localhost.invalid",
  password: "local-dev-only",
  company: "Local Test Workspace",
  role: "Owner / Admin",
  customerId: "CUST-LOCAL-TEST-001",
  workspaceLabel: "Local Test Workspace",
  selectedPlan: "enterprise",
  enabledProducts: {
    saas: true,
    lms: true,
    auricrux: true,
  },
  enabledComms: {
    chat: true,
    sms: true,
    phone: true,
    email: true,
    teams: true,
    conference: true,
    lecture: true,
  },
};

export const ADMIN_BACKEND_ACCOUNT = {
  email: "local.admin@localhost.invalid",
  password: "local-dev-only",
  company: "Local Admin Workspace",
  role: "System Admin",
  customerId: "CUST-LOCAL-ADMIN-001",
  workspaceLabel: "Local Admin Workspace",
  selectedPlan: "enterprise",
  enabledProducts: {
    saas: true,
    lms: true,
    auricrux: true,
  },
  enabledComms: {
    chat: true,
    sms: true,
    phone: true,
    email: true,
    teams: true,
    conference: true,
    lecture: true,
  },
};

export const LAUNCH_SINGLE_USER_ACCOUNT = {
  email: "local.launch@localhost.invalid",
  password: "local-dev-only",
  company: "Local Launch Workspace",
  role: "Owner / Admin",
  customerId: "CUST-LOCAL-LAUNCH-001",
  workspaceLabel: "Local Launch Workspace",
  selectedPlan: "enterprise",
  enabledProducts: {
    saas: true,
    lms: true,
    auricrux: true,
  },
  enabledComms: {
    chat: true,
    sms: true,
    phone: true,
    email: true,
    teams: true,
    conference: true,
    lecture: true,
  },
};

export const MICHAEL_EMPLOYEE_ACCOUNT = {
  email: "local.michael.employee@localhost.invalid",
  password: "local-dev-only",
  company: "FCA Employee Workspace",
  role: "Employee",
  customerId: "CUST-LOCAL-EMPLOYEE-001",
  workspaceLabel: "FCA Employee Workspace",
  selectedPlan: "enterprise",
  enabledProducts: {
    saas: true,
    lms: true,
    auricrux: true,
  },
  enabledComms: {
    chat: true,
    sms: true,
    phone: true,
    email: true,
    teams: true,
    conference: true,
    lecture: true,
  },
};

export const AMANDA_EMPLOYEE_ACCOUNT = {
  email: "local.amanda.employee@localhost.invalid",
  password: "local-dev-only",
  company: "FCA Employee Workspace",
  role: "Employee",
  customerId: "CUST-LOCAL-EMPLOYEE-002",
  workspaceLabel: "FCA Employee Workspace",
  selectedPlan: "enterprise",
  enabledProducts: {
    saas: true,
    lms: true,
    auricrux: true,
  },
  enabledComms: {
    chat: true,
    sms: true,
    phone: true,
    email: true,
    teams: true,
    conference: true,
    lecture: true,
  },
};

export const SEEDED_ACCOUNT_KEYS = {
  test: PRIMARY_TEST_ACCOUNT,
  founder: MICHAEL_FOUNDER_ACCOUNT,
  michael: MICHAEL_FOUNDER_ACCOUNT,
  admin: ADMIN_BACKEND_ACCOUNT,
  launch: LAUNCH_SINGLE_USER_ACCOUNT,
  michaelemployee: MICHAEL_EMPLOYEE_ACCOUNT,
  amandaemployee: AMANDA_EMPLOYEE_ACCOUNT,
  employee: MICHAEL_EMPLOYEE_ACCOUNT,
  amanda: AMANDA_EMPLOYEE_ACCOUNT,
};

export const TEST_CUSTOMER_ACCOUNTS = [
  PRIMARY_TEST_ACCOUNT,
  MICHAEL_FOUNDER_ACCOUNT,
  LAUNCH_SINGLE_USER_ACCOUNT,
  ADMIN_BACKEND_ACCOUNT,
  MICHAEL_EMPLOYEE_ACCOUNT,
  AMANDA_EMPLOYEE_ACCOUNT,
];

export function resolveSeededAccountByKey(key = "test") {
  const normalizedKey = (key || "test").trim().toLowerCase();
  return SEEDED_ACCOUNT_KEYS[normalizedKey] || PRIMARY_TEST_ACCOUNT;
}

export function sanitizeSeededCustomerAccount(account) {
  if (!account) return null;

  return {
    email: account.email,
    company: account.company,
    role: account.role,
    customerId: account.customerId,
    workspaceLabel: account.workspaceLabel,
    selectedPlan: account.selectedPlan,
    enabledProducts: account.enabledProducts,
    enabledComms: account.enabledComms,
  };
}

export function resolveSeededCustomerAccount(email = "", password = "") {
  const normalizedEmail = (email || "").trim().toLowerCase();
  const normalizedPassword = (password || "").trim();

  const match = TEST_CUSTOMER_ACCOUNTS.find(
    (account) =>
      account.email.toLowerCase() === normalizedEmail && account.password === normalizedPassword
  );

  return sanitizeSeededCustomerAccount(match);
}
