window.FCA_BACKEND = {
  baseUrl: "https://auricrux-central.azurewebsites.net",
  bidsApi: "https://auricrux-central.azurewebsites.net/api/bids",
  healthApi: "https://auricrux-central.azurewebsites.net/api/health",
  statusApi: "https://auricrux-central.azurewebsites.net/api/status",
  executeApi: "https://auricrux-central.azurewebsites.net/api/execute",
  projectsApi: "https://auricrux-central.azurewebsites.net/api/projects",
  filesApi: "https://auricrux-central.azurewebsites.net/api/files",
  academyLmsApi: "https://auricrux-central.azurewebsites.net/api/academy-lms",
  academyRemediationApi: "https://auricrux-central.azurewebsites.net/api/academy-remediation-summary",
  customerLoginApi: "https://auricrux-central.azurewebsites.net/api/customer-login",
  customerSessionApi: "https://auricrux-central.azurewebsites.net/api/customer-session",
  customerLogoutApi: "https://auricrux-central.azurewebsites.net/api/customer-logout",
  customerAuthStateApi: "https://auricrux-central.azurewebsites.net/api/customer-auth-state",
  workflowAuditApi: "https://auricrux-central.azurewebsites.net/api/workflow-audit",
  stripeWebhookApi: "https://auricrux-central.azurewebsites.net/api/stripe/webhook",
  stripeCheckoutApi: "https://auricrux-central.azurewebsites.net/api/stripe-checkout",
  stripeWebhookSwaApi: "https://futurecontractorsofamerica.com/api/stripe-webhook",
  mobileRegisterApi: "https://auricrux-central.azurewebsites.net/api/mobile/register",
  portalMessagesApi: "https://auricrux-central.azurewebsites.net/api/portal-messages",
  portalInvoicesApi: "https://auricrux-central.azurewebsites.net/api/portal-invoices",
  supportTicketsApi: "https://auricrux-central.azurewebsites.net/api/support-tickets",
  billingSummaryApi: "https://auricrux-central.azurewebsites.net/api/billing-summary",
  fieldTasksApi: "https://auricrux-central.azurewebsites.net/api/field-tasks",
  fieldScheduleApi: "https://auricrux-central.azurewebsites.net/api/field-schedule",
  auricruxApi: "https://auricrux-central.azurewebsites.net/api/auricrux",
  pilotCheckout: "https://buy.stripe.com/bJe14o0fQ5Pn8Tt7Bw5gc01",
  startupCheckout: "",
  projectRfisApi: function (projectId) {
    return this.baseUrl + "/api/projects/" + encodeURIComponent(projectId) + "/rfis";
  },
  projectTakeoffsApi: function (projectId) {
    return this.baseUrl + "/api/projects/" + encodeURIComponent(projectId) + "/takeoffs";
  },
  projectWorkspaceApi: function (projectId) {
    return this.baseUrl + "/api/projects/" + encodeURIComponent(projectId) + "/workspace";
  }
};
