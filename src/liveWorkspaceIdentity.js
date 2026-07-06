import { readCustomerSession } from "./customerSession";

function isCteShadowSession(session = null) {
  const role = String(session?.role || "").toLowerCase().replace(/_/g, "-");
  return session?.cteProgramEnabled === true || session?.accountMode === "cte-shadow" || role === "student" || role === "cte-student" || (role.includes("cte") && role.includes("student"));
}

export function resolveLiveTenantIdentity(tenant) {
  const session = readCustomerSession();
  if (!session?.authenticated || !tenant) return tenant;
  const shadow = isCteShadowSession(session);

  return {
    ...tenant,
    name: session.company,
    roleSummary: shadow
      ? `${session.workspaceLabel} is authenticated in the CTE Shadow SaaS environment; production data, live outreach, and payment APIs are bypassed.`
      : `${session.workspaceLabel} is authenticated and operating through the live FCA customer continuity shell.`,
    authenticatedEmail: shadow ? null : session.email,
    workspaceLabel: session.workspaceLabel,
    customerId: session.customerId,
    workspaceRole: session.role,
    enabledProducts: session.enabledProducts,
    shadowEnvironment: shadow ? "cte-shadow-sandbox" : null,
  };
}

export function resolveLiveProjectIdentity(project) {
  const session = readCustomerSession();
  if (!session?.authenticated || !project) return project;
  const shadow = isCteShadowSession(session);

  return {
    ...project,
    customer: session.company,
    auricruxSummary: shadow
      ? `Auricrux is running in mock mode for ${session.company}; ${project.id} actions write only to the CTE shadow staging environment.`
      : `Auricrux is reading the live customer session for ${session.company} while preserving ${project.id} as the shared project spine.`,
  };
}
