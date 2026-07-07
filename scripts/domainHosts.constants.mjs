/** Node-side mirror of src/config/domainHosts.js (no import.meta). */
export const FCA_PRIMARY_DOMAIN = "futurecontractorsofamerica.com";
export const FCA_MARKETING_HOST = FCA_PRIMARY_DOMAIN;
export const FCA_WWW_HOST = `www.${FCA_PRIMARY_DOMAIN}`;
export const FCA_APP_HOST = `app.${FCA_PRIMARY_DOMAIN}`;
export const FCA_API_HOST = `api.${FCA_PRIMARY_DOMAIN}`;

export const FCA_API_ORIGIN = `https://${FCA_API_HOST}`;
export const FCA_APP_ORIGIN = `https://${FCA_APP_HOST}`;
export const FCA_MARKETING_ORIGIN = `https://${FCA_MARKETING_HOST}`;

export const FCA_SWA_DEFAULT_HOST =
  process.env.AURICRUX_DEPLOY_DEFAULT_HOST ||
  process.env.AURICRUX_SWA_DEFAULT_HOST ||
  "delightful-mushroom-0de67860f.7.azurestaticapps.net";

export const FCA_PROVIDER_API_FALLBACK_HOST = process.env.AURICRUX_API_FALLBACK_HOST || "auricrux-central.azurewebsites.net";
export const FCA_PROVIDER_API_FALLBACK_ORIGIN = `https://${FCA_PROVIDER_API_FALLBACK_HOST}`;
export const FCA_AZURE_API_FALLBACK_HOST = FCA_PROVIDER_API_FALLBACK_HOST;
export const FCA_AZURE_API_FALLBACK_ORIGIN = FCA_PROVIDER_API_FALLBACK_ORIGIN;
export const FCA_CENTRAL_API =
  process.env.AURICRUX_CENTRAL_API ||
  process.env.FCA_API_BASE?.replace(/\/$/, "") ||
  `${FCA_API_ORIGIN}/api`;

export const FCA_API_BASE = FCA_CENTRAL_API.replace(/\/api\/?$/, "");

export const FCA_EXPECTED_SWA_HOSTS_CSV =
  process.env.AURICRUX_LIVE_VERIFY_HOSTS ||
  process.env.AURICRUX_EXPECTED_HOSTS ||
  [
    FCA_MARKETING_HOST,
    FCA_WWW_HOST,
    FCA_APP_HOST,
    FCA_SWA_DEFAULT_HOST,
  ].join(",");
