export const MICHAEL_FOUNDER_ACCOUNT = {
  email: "michael@futurecontractorsofamerica.com",
  password: "MyGodiswithme01!",
  company: "Future Contractors of America",
  role: "Founder / Owner",
  customerId: "CUST-FCA-FOUNDER-MICHAEL-001",
  workspaceLabel: "Michael — FCA Founder Workspace",
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
  email: "founder.test@futurecontractorsofamerica.com",
  password: "FCA-HandsOff-2026!",
  company: "Future Contractors of America Test Workspace",
  role: "Owner / Admin",
  customerId: "CUST-FCA-TEST-001",
  workspaceLabel: "FCA Founder Test Workspace",
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
  email: "admin@futurecontractorsofamerica.com",
  password: "FCA-Admin-2026!",
  company: "FCA System Administration",
  role: "FCA System Admin",
  customerId: "CUST-FCA-ADMIN-001",
  workspaceLabel: "FCA Backend Administration",
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
  email: "launch.customer@futurecontractorsofamerica.com",
  password: "FCA-Launch-2026!",
  company: "Future Contractors of America Launch Customer",
  role: "Owner / Admin",
  customerId: "CUST-FCA-LAUNCH-001",
  workspaceLabel: "FCA Launch Customer Workspace",
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
};

export const TEST_CUSTOMER_ACCOUNTS = [
  PRIMARY_TEST_ACCOUNT,
  MICHAEL_FOUNDER_ACCOUNT,
  LAUNCH_SINGLE_USER_ACCOUNT,
  ADMIN_BACKEND_ACCOUNT,
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
