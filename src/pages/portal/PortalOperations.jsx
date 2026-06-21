import PortalWorkspaceRedirect from "./PortalWorkspaceRedirect";

/** Legacy marketing operations view — workspace hub is canonical. */
export default function PortalOperations() {
  return <PortalWorkspaceRedirect target="/portal/platform" />;
}
