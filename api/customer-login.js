const TEST_ACCOUNTS = [
  {
    email: "founder.test@futurecontractorsofamerica.com",
    password: "FCA-HandsOff-2026!",
    company: "Future Contractors of America Test Workspace",
    role: "Owner / Admin",
    customerId: "CUST-FCA-TEST-001",
    workspaceLabel: "FCA Founder Test Workspace",
    selectedPlan: "enterprise",
    enabledProducts: { saas: true, lms: true, auricrux: true },
    enabledComms: { chat: true, sms: true, phone: true, email: true, teams: true, conference: true, lecture: true },
    accountMode: "seeded",
    authenticationMode: "seeded-server-session"
  },
  {
    email: "launch.customer@futurecontractorsofamerica.com",
    password: "FCA-Launch-2026!",
    company: "Future Contractors of America Launch Customer",
    role: "Owner / Admin",
    customerId: "CUST-FCA-LAUNCH-001",
    workspaceLabel: "FCA Launch Customer Workspace",
    selectedPlan: "enterprise",
    enabledProducts: { saas: true, lms: false, auricrux: true },
    enabledComms: { chat: true, sms: true, phone: true, email: true, teams: true, conference: true, lecture: false },
    accountMode: "seeded",
    authenticationMode: "seeded-server-session"
  }
];

function sanitizeAccount(account) {
  if (!account) return null;
  const { password, ...safe } = account;
  return safe;
}

function createSessionToken(account) {
  return Buffer.from(JSON.stringify({
    email: account.email,
    customerId: account.customerId,
    company: account.company,
    role: account.role,
    workspaceLabel: account.workspaceLabel,
    selectedPlan: account.selectedPlan,
    enabledProducts: account.enabledProducts,
    enabledComms: account.enabledComms,
    accountMode: account.accountMode,
    authenticationMode: account.authenticationMode,
    exp: Date.now() + (8 * 60 * 60 * 1000)
  })).toString("base64");
}

module.exports = async function (context, req) {
  if ((req.method || "GET").toUpperCase() !== "POST") {
    context.res = {
      status: 200,
      headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
      body: {
        ok: true,
        route: "customer-login",
        activeMode: "seeded-server-session",
        message: "POST credentials to authenticate against the seeded FCA validation accounts."
      }
    };
    return;
  }

  const body = req.body || {};
  const email = String(body.email || "").trim().toLowerCase();
  const password = String(body.password || "").trim();

  const account = TEST_ACCOUNTS.find((item) => item.email.toLowerCase() === email && item.password === password);

  if (!account) {
    context.res = {
      status: 401,
      headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
      body: {
        ok: false,
        error: "Invalid FCA customer credentials.",
        route: "customer-login",
        activeMode: "seeded-server-session"
      }
    };
    return;
  }

  const safeAccount = sanitizeAccount(account);
  const token = createSessionToken(account);

  context.res = {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
      "Set-Cookie": `fca_customer_session=${token}; Path=/; Max-Age=28800; SameSite=Lax; Secure`
    },
    body: {
      ok: true,
      route: "customer-login",
      activeMode: "seeded-server-session",
      account: safeAccount,
      authBoundary: {
        productionAuthReady: false,
        identityProvider: "fca-native-auth",
        sessionValidation: "seeded-session-cookie",
        nextBuildStep: "Promote from seeded validation login to managed customer authentication without regressing public access."
      }
    }
  };
};
