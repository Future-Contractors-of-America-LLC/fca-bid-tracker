import fs from "fs/promises";
import path from "path";

const root = process.cwd();
const outputDir = path.join(root, "generated");
await fs.mkdir(outputDir, { recursive: true });

async function read(relativePath) {
  return fs.readFile(path.join(root, relativePath), "utf8");
}

function has(source, marker) {
  return source.includes(marker);
}

function countPlanKeys(source) {
  return [...source.matchAll(/^[ ]{2}([a-z]+): \{/gm)].map((match) => match[1]);
}

const timestamp = new Date().toISOString();
const authBoundarySource = await read("api/auth-boundary.js");
const authStateSource = await read("api/customer-auth-state.js");
const customerSessionSource = await read("api/customer-session.js");
const customerLoginSource = await read("api/customer-login.js");
const academyLmsSource = await read("api/academy-lms.js");
const loginPageSource = await read("src/pages/website/Login.jsx");
const pricingPlansSource = await read("src/pricingPlans.js");

const planKeys = countPlanKeys(pricingPlansSource);

const report = {
  generatedAt: timestamp,
  managedAuth: {
    boundarySurfacePresent: has(authBoundarySource, "productionAuthReady"),
    authStateRoutePresent: has(authStateSource, 'route: "customer-auth-state"'),
    loginRoutePresent: has(customerLoginSource, "route: 'customer-login'"),
    sessionRoutePresent: has(customerSessionSource, 'route: "customer-session"'),
    signedCookieSessionPresent: has(authBoundarySource, "signed-http-only-cookie"),
    academyTenantResolutionPresent: has(academyLmsSource, "customerId"),
  },
  commercialRuntime: {
    pricingCatalogPresent: has(pricingPlansSource, "pricingPlanCatalog"),
    planCount: planKeys.length,
    planKeys,
    loginPlanSelectionPresent: has(loginPageSource, "selectedPlan"),
    enabledProductsPresent: has(loginPageSource, "enabledProducts"),
    enabledCommsPresent: has(loginPageSource, "enabledComms"),
    productLaunchpadPresent: has(loginPageSource, "CustomerProductLaunchpad"),
    commsLaunchpadPresent: has(loginPageSource, "CustomerCommsLaunchpad"),
  },
};

const allChecks = [
  report.managedAuth.boundarySurfacePresent,
  report.managedAuth.authStateRoutePresent,
  report.managedAuth.loginRoutePresent,
  report.managedAuth.sessionRoutePresent,
  report.managedAuth.signedCookieSessionPresent,
  report.managedAuth.academyTenantResolutionPresent,
  report.commercialRuntime.pricingCatalogPresent,
  report.commercialRuntime.loginPlanSelectionPresent,
  report.commercialRuntime.enabledProductsPresent,
  report.commercialRuntime.enabledCommsPresent,
  report.commercialRuntime.productLaunchpadPresent,
  report.commercialRuntime.commsLaunchpadPresent,
];

report.status = allChecks.every(Boolean) ? "pass" : "fail";

const markdown = `# FCA Managed Auth and Commercial Runtime Report\n\n- Generated at: ${timestamp}\n- Status: ${report.status.toUpperCase()}\n- Plan count: ${report.commercialRuntime.planCount}\n\n## Managed Auth Proof\n- Boundary surface present: ${report.managedAuth.boundarySurfacePresent ? "yes" : "no"}\n- Auth-state route present: ${report.managedAuth.authStateRoutePresent ? "yes" : "no"}\n- Login route present: ${report.managedAuth.loginRoutePresent ? "yes" : "no"}\n- Session route present: ${report.managedAuth.sessionRoutePresent ? "yes" : "no"}\n- Signed cookie session present: ${report.managedAuth.signedCookieSessionPresent ? "yes" : "no"}\n- Academy tenant resolution present: ${report.managedAuth.academyTenantResolutionPresent ? "yes" : "no"}\n\n## Commercial Runtime Proof\n- Pricing catalog present: ${report.commercialRuntime.pricingCatalogPresent ? "yes" : "no"}\n- Plan keys: ${report.commercialRuntime.planKeys.join(", ")}\n- Login plan selection present: ${report.commercialRuntime.loginPlanSelectionPresent ? "yes" : "no"}\n- Enabled products present: ${report.commercialRuntime.enabledProductsPresent ? "yes" : "no"}\n- Enabled comms present: ${report.commercialRuntime.enabledCommsPresent ? "yes" : "no"}\n- Product launchpad present: ${report.commercialRuntime.productLaunchpadPresent ? "yes" : "no"}\n- Communications launchpad present: ${report.commercialRuntime.commsLaunchpadPresent ? "yes" : "no"}\n`;

await fs.writeFile(path.join(outputDir, "managed-auth-commercial-runtime-report.json"), JSON.stringify(report, null, 2));
await fs.writeFile(path.join(outputDir, "managed-auth-commercial-runtime-report.md"), markdown);

console.log(`Generated managed auth and commercial runtime report with status ${report.status.toUpperCase()} across ${report.commercialRuntime.planCount} plan definitions.`);
