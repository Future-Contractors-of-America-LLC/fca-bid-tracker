import { app } from "@azure/functions";
import { readSessionTokenFromCookieHeader, validateSessionToken } from "./auth-boundary.js";
import { listFiles, mutateFile, getWorkflowSummary, listAuditEvents } from "./workflow-store.js";

function resolveTenantId(request) {
  const cookieHeader = request.headers.get("cookie") || "";
  const token = readSessionTokenFromCookieHeader(cookieHeader);
  const session = validateSessionToken(token);
  return session?.customerId || "TEN-FCA-001";
}

function resolveLatestAuditEventId(tenantId, projectId, eventType) {
  const items = listAuditEvents(tenantId, { projectId, eventType, actorType: null, q: null });
  return items?.[0]?.id || null;
}

app.http("files", {
  methods: ["GET", "POST", "PATCH"],
  authLevel: "anonymous",
  route: "files",
  handler: async (request) => {
    const tenantId = resolveTenantId(request);
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
          backingSource: "api-workflow-store",
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
            backingSource: "api-workflow-store",
          },
        };
      } catch (error) {
        return {
          status: 400,
          jsonBody: {
            ok: false,
            error: error?.message || "File registration failed.",
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
          backingSource: "api-workflow-store",
        },
      };
    } catch (error) {
      return {
        status: 400,
        jsonBody: {
          ok: false,
          error: error?.message || "File mutation failed.",
        },
      };
    }
  },
});
