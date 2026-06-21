/** Single source of truth for FCA public hostnames and API origins. */
export const FCA_PRIMARY_DOMAIN = "futurecontractorsofamerica.com";
export const FCA_MARKETING_HOST = FCA_PRIMARY_DOMAIN;
export const FCA_WWW_HOST = `www.${FCA_PRIMARY_DOMAIN}`;
export const FCA_APP_HOST = `app.${FCA_PRIMARY_DOMAIN}`;
export const FCA_API_HOST = `api.${FCA_PRIMARY_DOMAIN}`;

export const FCA_MARKETING_ORIGIN = `https://${FCA_MARKETING_HOST}`;
export const FCA_WWW_ORIGIN = `https://${FCA_WWW_HOST}`;
export const FCA_APP_ORIGIN = `https://${FCA_APP_HOST}`;
export const FCA_API_ORIGIN = `https://${FCA_API_HOST}`;

export const FCA_SWA_DEFAULT_HOST =
  import.meta.env.VITE_FCA_SWA_DEFAULT_HOST ||
  "delightful-mushroom-0de67860f.7.azurestaticapps.net";

/** Azure Function App default host — fallback until api.* DNS is live. */
export const FCA_AZURE_API_FALLBACK_HOST = "auricrux-central.azurewebsites.net";
export const FCA_AZURE_API_FALLBACK_ORIGIN = `https://${FCA_AZURE_API_FALLBACK_HOST}`;
export const FCA_AZURE_API_FALLBACK = `${FCA_AZURE_API_FALLBACK_ORIGIN}/api`;

export const FCA_API_BASE =
  import.meta.env.VITE_AURICRUX_CENTRAL_API?.replace(/\/api\/?$/, "") ||
  FCA_API_ORIGIN;

export const FCA_CENTRAL_API = `${FCA_API_BASE.replace(/\/$/, "")}/api`;

export const FCA_EXPECTED_SWA_HOSTS = [
  FCA_MARKETING_HOST,
  FCA_WWW_HOST,
  FCA_APP_HOST,
  FCA_SWA_DEFAULT_HOST,
];

export const FCA_EXPECTED_SWA_HOSTS_CSV = FCA_EXPECTED_SWA_HOSTS.join(",");
