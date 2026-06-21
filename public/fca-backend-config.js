window.FCA_BACKEND = {
  baseUrl: "https://api.futurecontractorsofamerica.com",
  bidsApi: "https://api.futurecontractorsofamerica.com/api/bids",
  leadsApi: "https://api.futurecontractorsofamerica.com/api/leads",
  commercialPipelineApi: "https://api.futurecontractorsofamerica.com/api/commercial-pipeline",
  onboardingApi: "https://api.futurecontractorsofamerica.com/api/onboarding",
  healthApi: "https://api.futurecontractorsofamerica.com/api/health",
  statusApi: "https://api.futurecontractorsofamerica.com/api/status",
  executeApi: "https://api.futurecontractorsofamerica.com/api/execute",
  projectsApi: "https://api.futurecontractorsofamerica.com/api/projects",
  filesApi: "https://api.futurecontractorsofamerica.com/api/files",
  academyLmsApi: "https://api.futurecontractorsofamerica.com/api/academy-lms",
  academyRemediationApi: "https://api.futurecontractorsofamerica.com/api/academy-remediation-summary",
  customerLoginApi: "https://api.futurecontractorsofamerica.com/api/customer-login",
  customerSessionApi: "https://api.futurecontractorsofamerica.com/api/customer-session",
  customerLogoutApi: "https://api.futurecontractorsofamerica.com/api/customer-logout",
  customerAuthStateApi: "https://api.futurecontractorsofamerica.com/api/customer-auth-state",
  workflowAuditApi: "https://api.futurecontractorsofamerica.com/api/workflow-audit",
  stripeWebhookApi: "https://api.futurecontractorsofamerica.com/api/stripe/webhook",
  stripeCheckoutApi: "https://api.futurecontractorsofamerica.com/api/stripe-checkout",
  stripeWebhookSwaApi: "https://futurecontractorsofamerica.com/api/stripe-webhook",
  mobileRegisterApi: "https://api.futurecontractorsofamerica.com/api/mobile/register",
  portalMessagesApi: "https://api.futurecontractorsofamerica.com/api/portal-messages",
  portalInvoicesApi: "https://api.futurecontractorsofamerica.com/api/portal-invoices",
  supportTicketsApi: "https://api.futurecontractorsofamerica.com/api/support-tickets",
  billingSummaryApi: "https://api.futurecontractorsofamerica.com/api/billing-summary",
  fieldTasksApi: "https://api.futurecontractorsofamerica.com/api/field-tasks",
  fieldScheduleApi: "https://api.futurecontractorsofamerica.com/api/field-schedule",
  auricruxApi: "https://api.futurecontractorsofamerica.com/api/auricrux",
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
