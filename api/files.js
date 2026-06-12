import { app } from "@azure/functions";
import { resolveTenantContextFromRequest } from "./auth-boundary.js";
import { listFiles, mutateFile, getWorkflowSummary, listAuditEvents } from "./workflow-store.js";

function resolveLatestAuditEventId(tenantId, projectId, eventType) {
  const items = listAuditEvents(tenantId, { projectId, eventType, actorType: null, q: null });
  return items?.[0]?.id || null;
}

app.http("files", {
  methods: ["GET", "POST", "PATCH"],
  authLevel: "anonymous",
  route: "files",
  handler: async (request) => {
    const tenantContext = resolveTenantContextFromRequest(request, {
      allowSeededFallback: request.method === "GET",
    });
    const tenantId = tenantContext.tenantId;
    const projectId = request.query.get("projectId") || null;
    const category = request.query.get("category") || null;
    const status = request.query.get("status") || null;
    const q = request.query.get("q") || null;

    if (request.method === "GET") {
      const items = listFiles(tenantId, { projectId, category, status, q });

      return {
        status: 200,
        jsonBody: {
          ok: true,
          items,
          count: items.length,
          projectId,
          filters: { category, status, q },
          summary: getWorkflowSummary(tenantId),
          authContext: {
            authenticated: tenantContext.authenticated,
            source: tenantContext.source,
            usedFallback: tenantContext.usedFallback,
          },
          backingSource: "api-workflow-store",
        },
      };
    }

    if (!tenantContext.authenticated || !tenantContext.tenantId) {
      return {
        status: 401,
        jsonBody: {
          ok: false,
          error: "Authenticated tenant session required for file mutations.",
          authContext: {
            authenticated: tenantContext.authenticated,
            source: tenantContext.source,
            usedFallback: tenantContext.usedFallback,
          },
        },
      };
    }

    const body = await request.json().catch(() => ({}));

    if (request.method === "POST") {
      try {
        const ownerObjectType = body?.ownerObjectType || "Project";
        const ownerObjectId = body?.ownerObjectId || projectId || body?.projectId;
        const uploadedBy = body?.uploadedBy || "system";
        const files = Array.isArray(body?.files) ? body.files : [];

        if (!ownerObjectId) {
          throw new Error("ownerObjectId or projectId is required for file registration.");
        }

        if (!files.length) {
          throw new Error("At least one file is required for file registration.");
        }

        const created = files.map((file) => {
          const detail = `${file.fileName || file.name || "Uploaded file"} registered under governed file spine for ${ownerObjectId}.`;
          const result = mutateFile(tenantId, "create-file-record", {
            projectId: ownerObjectId,
            ownerObjectType,
            ownerObjectId,
            name: file.fileName || file.name,
            category: file.classification?.documentType || file.category || "Document",
            discipline: file.classification?.discipline || file.discipline || "Document Control",
            owner: uploadedBy,
            linkedEvidenceTarget: body?.linkedEvidenceTarget || `${ownerObjectId} governed evidence chain`,
            detail,
            status: "uploaded",
            evidenceStatus: "pending-review",
            actionLabel: "Review",
            versionLabel: file.versionLabel || "Rev 1",
          });

          return {
            fileId: result.file.fileId,
            ownerObjectType,
            ownerObjectId,
            status: result.file.status,
          };
        });

        return {
          status: 200,
          jsonBody: {
            ok: true,
            items: created,
            auditEventId: resolveLatestAuditEventId(tenantId, ownerObjectId, "file-created"),
            authContext: {
              authenticated: tenantContext.authenticated,
              source: tenantContext.source,
              usedFallback: tenantContext.usedFallback,
            },
            backingSource: "api-workflow-store",
          },
        };
      } catch (error) {
        return {
          status: 400,
          jsonBody: {
            ok: false,
            error: error?.message || "File registration failed.",
            authContext: {
              authenticated: tenantContext.authenticated,
              source: tenantContext.source,
              usedFallback: tenantContext.usedFallback,
            },
          },
        };
      }
    }

    try {
      const result = mutateFile(tenantId, body?.action, body);
      return {
        status: 200,
        jsonBody: {
          ok: true,
          ...result,
          authContext: {
            authenticated: tenantContext.authenticated,
            source: tenantContext.source,
            usedFallback: tenantContext.usedFallback,
          },
          backingSource: "api-workflow-store",
        },
      };
    } catch (error) {
      return {
        status: 400,
        jsonBody: {
          ok: false,
          error: error?.message || "File mutation failed.",
          authContext: {
            authenticated: tenantContext.authenticated,
            source: tenantContext.source,
            usedFallback: tenantContext.usedFallback,
          },
        },
      };
    }
  },
});
