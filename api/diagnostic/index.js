module.exports = async function (context, req) {
  const allowedKeys = [
    "AURICRUX_API_KEY", "STRIPE_SECRET_KEY", "STRIPE_PUBLISHABLE_KEY",
    "GITHUB_PAT", "GITHUB_OWNER", "GITHUB_REPO", "GITHUB_BRANCH",
    "FOUNDRY_PROJECT_ENDPOINT", "FOUNDRY_PROJECT_NAME",
    "MICROSOFT_GRAPH_TENANT_ID", "MICROSOFT_GRAPH_CLIENT_ID",
    "FCA_TENANT_PRIMARY_DOMAIN", "FCA_SESSION_SECRET",
    "FCA_CUSTOMER_ACCOUNTS_JSON",
    "M365_SHAREPOINT_HOSTNAME", "M365_SHAREPOINT_SITE_PATH",
    "M365_SHAREPOINT_DEFAULT_FOLDER_PATH",
    "AZURE_AI_PROJECT_ENDPOINT", "MODEL_DEPLOYMENT_NAME",
    "AURICRUX_CENTRAL_API",
  ];

  const values = {};
  for (const key of allowedKeys) {
    const val = process.env[key];
    if (val) {
      values[key] = val;
    }
  }

  context.res = {
    status: 200,
    headers: { "Content-Type": "application/json" },
    body: { ok: true, diagnostic: values },
  };
};
