import { readCustomerSession } from "./customerSession";

export function resolveLiveTenantIdentity(tenant) {
  const session = readCustomerSession();
  if (!session?.authenticated || !tenant) return tenant;

  return {
    ...tenant,
    name: session.company,
    roleSummary: `${session.workspaceLabel} is authenticated and operating through the live FCA customer continuity shell.`,
    authenticatedEmail: session.email,
    workspaceLabel: session.workspaceLabel,
    customerId: session.customerId,
    workspaceRole: session.role,
    enabledProducts: session.enabledProducts,
  };
}

export function resolveLiveProjectIdentity(project) {
  const session = readCustomerSession();
  if (!session?.authenticated || !project) return project;

  return {
    ...project,
    customer: session.company,
    auricruxSummary: `Auricrux is reading the live customer session for ${session.company} while preserving ${project.id} as the shared project spine.`,
  };
}
