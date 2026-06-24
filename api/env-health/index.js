const { TableClient } = require("@azure/data-tables");

module.exports = async function (context, req) {
  const secretKey = process.env.STRIPE_SECRET_KEY || "";
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "";
  const auricruxKey = process.env.AURICRUX_API_KEY || "";
  const githubPat = process.env.GITHUB_PAT || "";
  const graphSecret = process.env.MICROSOFT_GRAPH_CLIENT_SECRET || "";
  const sessionSecret = process.env.FCA_SESSION_SECRET || "";
  const publishableKey = process.env.STRIPE_PUBLISHABLE_KEY || "";
  const azureStorage = process.env.FCA_TABLE_STORAGE_CONNECTION || "";
  const azureWebJobs = process.env.AzureWebJobsStorage || "";

  // Build status report
  const report = {
    ok: true,
    service: "env-health",
    timestamp: new Date().toISOString(),
    authMode: process.env.FCA_CUSTOMER_ACCOUNTS_JSON ? "managed" : "seeded",
    envKeys: {
      STRIPE_SECRET_KEY: secretKey ? `${secretKey.substring(0, 7)}...${secretKey.slice(-4)}` : "NOT_SET",
      STRIPE_WEBHOOK_SECRET: webhookSecret ? `${webhookSecret.substring(0, 5)}...` : "NOT_SET",
      STRIPE_PUBLISHABLE_KEY: publishableKey || "NOT_SET",
      AURICRUX_API_KEY: auricruxKey ? `${auricruxKey.substring(0, 8)}...${auricruxKey.slice(-4)}` : "NOT_SET",
      GITHUB_PAT: githubPat ? `${githubPat.substring(0, 5)}...${githubPat.slice(-4)}` : "NOT_SET",
      MICROSOFT_GRAPH_CLIENT_SECRET: graphSecret ? `${graphSecret.substring(0, 5)}...${graphSecret.slice(-4)}` : "NOT_SET",
      FCA_SESSION_SECRET: sessionSecret ? `${sessionSecret.substring(0, 5)}...${sessionSecret.slice(-4)}` : "NOT_SET",
      FCA_TABLE_STORAGE_CONNECTION: azureStorage ? "PRESENT" : "NOT_SET",
      AzureWebJobsStorage: azureWebJobs ? "PRESENT" : "NOT_SET",
    },
  };

  context.res = {
    status: 200,
    headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    body: report,
  };
};
