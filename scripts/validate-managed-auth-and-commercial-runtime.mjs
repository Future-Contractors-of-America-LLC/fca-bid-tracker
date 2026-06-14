import fs from "fs/promises";
import path from "path";

const root = process.cwd();
const failures = [];

async function read(relativePath) {
  return fs.readFile(path.join(root, relativePath), "utf8");
}

function expectIncludes(source, marker, file) {
  if (!source.includes(marker)) {
    failures.push(`${file} is missing required marker: ${marker}`);
  }
}

const authBoundarySource = await read("api/auth-boundary.js");
const authStateSource = await read("api/customer-auth-state.js");
const customerSessionSource = await read("api/customer-session.js");
const customerLoginSource = await read("api/customer-login.js");
const loginPageSource = await read("src/pages/website/Login.jsx");
const pricingPlansSource = await read("src/pricingPlans.js");
const academyLmsSource = await read("api/academy-lms.js");
const academyRemediationSummarySource = await read("api/academy-remediation-summary.js");

expectIncludes(authBoundarySource, "productionAuthReady", "api/auth-boundary.js");
expectIncludes(authBoundarySource, "managed-server-session", "api/auth-boundary.js");
expectIncludes(authBoundarySource, "selectedPlan", "api/auth-boundary.js");
expectIncludes(authBoundarySource, "enabledProducts", "api/auth-boundary.js");
expectIncludes(authBoundarySource, "enabledComms", "api/auth-boundary.js");

expectIncludes(authStateSource, 'route: "customer-auth-state"', "api/customer-auth-state.js");
expectIncludes(authStateSource, "authBoundary", "api/customer-auth-state.js");

expectIncludes(customerSessionSource, 'route: "customer-session"', "api/customer-session.js");
expectIncludes(customerSessionSource, "selectedPlan", "api/customer-session.js");
expectIncludes(customerSessionSource, "enabledProducts", "api/customer-session.js");
expectIncludes(customerSessionSource, "enabledComms", "api/customer-session.js");

expectIncludes(customerLoginSource, "route: 'customer-login'", "api/customer-login.js");
expectIncludes(customerLoginSource, "validateCustomerCredentials", "api/customer-login.js");
expectIncludes(customerLoginSource, "Set-Cookie", "api/customer-login.js");

expectIncludes(loginPageSource, "authenticateWorkspaceAccount", "src/pages/website/Login.jsx");
expectIncludes(loginPageSource, 'fetch("/api/customer-login"', "src/pages/website/Login.jsx");
expectIncludes(loginPageSource, "selectedPlan", "src/pages/website/Login.jsx");
expectIncludes(loginPageSource, "enabledProducts", "src/pages/website/Login.jsx");
expectIncludes(loginPageSource, "enabledComms", "src/pages/website/Login.jsx");

expectIncludes(pricingPlansSource, "pricingPlanCatalog", "src/pricingPlans.js");
expectIncludes(pricingPlansSource, "billingModel", "src/pricingPlans.js");
expectIncludes(pricingPlansSource, "enabledProducts", "src/pricingPlans.js");
expectIncludes(pricingPlansSource, "enabledComms", "src/pricingPlans.js");
expectIncludes(pricingPlansSource, "enterprise", "src/pricingPlans.js");

expectIncludes(academyLmsSource, 'route: "academy-lms"', "api/academy-lms.js");
expectIncludes(academyLmsSource, "validateSessionToken", "api/academy-lms.js");
expectIncludes(academyLmsSource, "selectedPlan", "api/academy-lms.js");

expectIncludes(academyRemediationSummarySource, 'route: "academy/remediation-summary"', "api/academy-remediation-summary.js");

if (failures.length > 0) {
  console.error("Managed auth and commercial runtime validation failed:");
  for (const failure of failures) {
    console.error(` - ${failure}`);
  }
  process.exit(1);
}

console.log("Managed auth and commercial runtime validation passed.");
