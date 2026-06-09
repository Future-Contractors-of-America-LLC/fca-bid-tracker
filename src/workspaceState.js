import { portalMessages as seededPortalMessages, routeStateOverlays } from "./systemState";
import { readWorkspaceState } from "./workspaceStateStore";
import { readProjectFileWorkspace } from "./projectFileWorkspaceStore";

function buildLiveObjectProxy(selector) {
  return new Proxy(
    {},
    {
      get(_target, prop) {
        const value = selector();
        return value?.[prop];
      },
      ownKeys() {
        return Reflect.ownKeys(selector() || {});
      },
      getOwnPropertyDescriptor() {
        return {
          enumerable: true,
          configurable: true,
        };
      },
    }
  );
}

function buildLiveArrayProxy(selector) {
  return new Proxy(
    [],
    {
      get(_target, prop) {
        const value = selector() || [];
        const resolved = value[prop];
        return typeof resolved === "function" ? resolved.bind(value) : resolved;
      },
      ownKeys() {
        return Reflect.ownKeys(selector() || []);
      },
      getOwnPropertyDescriptor() {
        return {
          enumerable: true,
          configurable: true,
        };
      },
    }
  );
}

export const portalTenant = buildLiveObjectProxy(() => readWorkspaceState().tenant);
export const currentProject = buildLiveObjectProxy(() => readWorkspaceState().project);
export const workspaceContext = buildLiveObjectProxy(() => readWorkspaceState().workspace);
export const auricruxRail = buildLiveObjectProxy(() => readWorkspaceState().auricrux);
export const projectAuditEvents = buildLiveArrayProxy(() => readProjectFileWorkspace().auditEvents);
export const portalMessages = buildLiveArrayProxy(() => seededPortalMessages);

export { routeStateOverlays };
