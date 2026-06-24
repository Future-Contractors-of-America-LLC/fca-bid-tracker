import fs from "node:fs";

/**
 * Resolve workflow simulation login credentials from env or optional accounts file.
 * Never hardcode passwords in source — use GitHub secrets or local env vars.
 */
export function resolveSimCredentials() {
  const email = process.env.FCA_SIM_LOGIN_EMAIL?.trim().toLowerCase();
  const password = process.env.FCA_SIM_LOGIN_PASSWORD;
  if (email && password) {
    return { email, password };
  }

  const accountsPath = process.env.FCA_SIM_ACCOUNTS_FILE;
  if (!accountsPath || !fs.existsSync(accountsPath)) {
    return null;
  }

  const accounts = JSON.parse(fs.readFileSync(accountsPath, "utf8"));
  const account = Array.isArray(accounts) ? accounts[0] : null;
  if (!account?.email || !account?.password) {
    return null;
  }
  return { email: String(account.email).trim().toLowerCase(), password: String(account.password) };
}
