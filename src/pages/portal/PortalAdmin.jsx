import { useEffect, useMemo, useState } from "react";
import PortalShell from "../../components/PortalShell";
import AuricruxInsightPanel from "../../components/auricrux/AuricruxInsightPanel";
import PortalSliceAuricrux from "../../components/portal/PortalSliceAuricrux";
import {
  PortalAlert,
  PortalEntityTable,
  PortalPageIntro,
  PortalQuickStats,
  PortalStatusBadge,
} from "../../components/portal/PortalPrimitives";
import { portalButtonPrimary, portalButtonSecondary, portalCardStyle, portalEyebrowStyle, portalTokens } from "../../portalDesignTokens";
import useWorkspaceState from "../../hooks/useWorkspaceState";
import useCustomerSession from "../../hooks/useCustomerSession";
import usePortalApiLoad from "../../hooks/usePortalApiLoad";
import { fetchWorkflowAudit, fetchWorkflowFiles, fetchWorkflowProjects } from "../../api/workflowClient";
import { adminGovernance } from "../../adminGovernance";
import { routeStateOverlays } from "../../systemState";

const ADMIN_POLICY_RUNTIME_KEY = "fca_admin_policy_runtime_v1";
const ADMIN_RULE_CHANGE_LOG_KEY = "fca_admin_rule_change_log_v1";
const ADMIN_JIT_GRANTS_KEY = "fca_admin_jit_grants_v1";
const ADMIN_SUBCONTRACTOR_REGISTRY_KEY = "fca_subcontractor_registry_v1";
const ADMIN_USER_DIRECTORY_KEY = "fca_admin_user_directory_v1";
const ADMIN_APPROVAL_WORKFLOW_KEY = "fca_admin_approval_workflow_v1";
const ADMIN_RETENTION_POLICY_KEY = "fca_admin_retention_policy_v1";

function readLocalJson(key, fallback) {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function writeLocalJson(key, value) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // best effort only
  }
}

function normalize(text) {
  return String(text || "").toLowerCase().replace(/[^a-z0-9\s-]/g, " ").replace(/\s+/g, " ").trim();
}

function toNumber(value) {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  const parsed = Number(String(value || "").replace(/[^\d.-]/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

function parseDate(value) {
  const parsed = Date.parse(value || "");
  return Number.isFinite(parsed) ? parsed : 0;
}

function daysSince(dateString) {
  const parsed = parseDate(dateString);
  if (!parsed) return 9999;
  return Math.max(0, Math.floor((Date.now() - parsed) / 86400000));
}

function daysUntil(dateString) {
  const parsed = parseDate(dateString);
  if (!parsed) return -9999;
  return Math.ceil((parsed - Date.now()) / 86400000);
}

function defaultRuntimePolicy() {
  return {
    changeOrderPdfSignoffOverUsd: adminGovernance.policyAsCode?.changeOrder?.externalPdfSignoffRequiredOverUsd || 10000,
    fieldTaskCredentialWarningDays: adminGovernance.policyAsCode?.fieldTasks?.blockNewAssignmentForExpiringCredentialDays || 30,
    dormantAdminDays: adminGovernance.complianceSentinel?.dormantAdminDays || 90,
    jitTtlMinutes: adminGovernance.securityGovernance?.jitAccess?.defaultTtlMinutes || 45,
  };
}

function defaultRetentionPolicy() {
  return {
    projectRecordsYears: adminGovernance.dataRetention?.projectRecordsYears || 10,
    coldStorageAfterYears: adminGovernance.dataRetention?.moveToColdStorageAfterYears || 10,
    auditTrailYears: adminGovernance.dataRetention?.auditTrailYears || 10,
    piiYears: adminGovernance.dataRetention?.personallyIdentifiableInfoYears || 7,
  };
}

function defaultSubcontractorRegistry() {
  const in20 = new Date(Date.now() + 20 * 86400000).toISOString().slice(0, 10);
  const in45 = new Date(Date.now() + 45 * 86400000).toISOString().slice(0, 10);
  const old = new Date(Date.now() - 12 * 86400000).toISOString().slice(0, 10);
  return [
    {
      id: "sub-struct-001",
      name: "IronPeak Structural",
      trade: "Structural",
      status: "Active",
      insuranceExpiry: in20,
      licenseExpiry: in45,
      credentialStatus: "ExpiringSoon",
    },
    {
      id: "sub-mep-002",
      name: "BlueArc MEP",
      trade: "MEP",
      status: "Active",
      insuranceExpiry: old,
      licenseExpiry: in20,
      credentialStatus: "Expired",
    },
  ];
}

function defaultUserDirectory(projectIds = []) {
  const primary = projectIds[0] || "PRJ-001";
  const secondary = projectIds[1] || primary;
  const oldLogin = new Date(Date.now() - 124 * 86400000).toISOString();
  const currentLogin = new Date(Date.now() - 2 * 86400000).toISOString();
  return [
    {
      id: "user-owner-001",
      name: "Ava Owner",
      role: "Owner",
      assignedProjects: [primary, secondary],
      credentialStatus: "Active",
      mfaEnabled: true,
      lastLoginAt: currentLogin,
      accountStatus: "Active",
    },
    {
      id: "user-pm-002",
      name: "Mason PM",
      role: "PM",
      assignedProjects: [primary],
      credentialStatus: "Active",
      mfaEnabled: true,
      lastLoginAt: currentLogin,
      accountStatus: "Active",
    },
    {
      id: "user-super-003",
      name: "Riley Superintendent",
      role: "Superintendent",
      assignedProjects: [primary],
      credentialStatus: "Active",
      mfaEnabled: true,
      lastLoginAt: currentLogin,
      accountStatus: "Active",
    },
    {
      id: "user-admin-004",
      name: "Legacy Admin",
      role: "Owner",
      assignedProjects: [secondary],
      credentialStatus: "Active",
      mfaEnabled: false,
      lastLoginAt: oldLogin,
      accountStatus: "Active",
    },
  ];
}

function defaultApprovalWorkflow() {
  const rows = adminGovernance.changeOrderGovernance?.approvalHierarchy || [];
  return rows.map((row, index) => ({
    id: `wf-${index + 1}`,
    title: `Change Order Approval <= ${Number.isFinite(row.maxAmount) ? `$${row.maxAmount.toLocaleString()}` : "Unlimited"}`,
    maxAmount: row.maxAmount,
    approverRole: row.approverRole,
    riskLevel: index === rows.length - 1 ? "High" : index > 0 ? "Medium" : "Low",
  }));
}

function evaluateAbac(user, projectId) {
  const permissions = adminGovernance.securityGovernance?.rbacAbac?.rolePermissions || {};
  const roleTokens = permissions[user.role] || [];
  const assigned = (user.assignedProjects || []).includes(projectId);
  const activeCredential = normalize(user.credentialStatus) === "active";
  const mfaOk = user.mfaEnabled !== false;
  const allow = Boolean(roleTokens.length && assigned && activeCredential && mfaOk);
  return {
    allow,
    reason: allow
      ? "Allowed (role + assignment + active credential + MFA)"
      : "Denied by ABAC context",
    roleTokens,
  };
}

function formatDateTime(value) {
  const parsed = parseDate(value);
  if (!parsed) return "n/a";
  return new Date(parsed).toLocaleString();
}

export default function PortalAdmin() {
  const { session } = useCustomerSession();
  const { state, refreshSyncStamp } = useWorkspaceState();

  const projectsLoad = usePortalApiLoad(() => fetchWorkflowProjects(), []);
  const auditLoad = usePortalApiLoad(() => fetchWorkflowAudit({}), []);
  const filesLoad = usePortalApiLoad(() => fetchWorkflowFiles({}), []);

  const projects = projectsLoad.data?.items || [];
  const auditItems = auditLoad.data?.items || [];
  const files = filesLoad.data?.items || [];

  const [runtimePolicy, setRuntimePolicy] = useState(() => readLocalJson(ADMIN_POLICY_RUNTIME_KEY, defaultRuntimePolicy()));
  const [retentionPolicy, setRetentionPolicy] = useState(() => readLocalJson(ADMIN_RETENTION_POLICY_KEY, defaultRetentionPolicy()));
  const [ruleChangeLog, setRuleChangeLog] = useState(() => readLocalJson(ADMIN_RULE_CHANGE_LOG_KEY, []));
  const [jitGrants, setJitGrants] = useState(() => readLocalJson(ADMIN_JIT_GRANTS_KEY, []));
  const [workflowSteps, setWorkflowSteps] = useState(() => readLocalJson(ADMIN_APPROVAL_WORKFLOW_KEY, defaultApprovalWorkflow()));
  const [subcontractorRegistry, setSubcontractorRegistry] = useState(() => readLocalJson(ADMIN_SUBCONTRACTOR_REGISTRY_KEY, defaultSubcontractorRegistry()));
  const [userDirectory, setUserDirectory] = useState(() => {
    const seeded = readLocalJson(ADMIN_USER_DIRECTORY_KEY, null);
    return seeded || defaultUserDirectory(projects.map((item) => item.id));
  });

  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [jitUserId, setJitUserId] = useState("");
  const [jitPrivilege, setJitPrivilege] = useState(adminGovernance.securityGovernance?.jitAccess?.highRiskPrivileges?.[0] || "finance:final-payment-release");
  const [jitMinutes, setJitMinutes] = useState(runtimePolicy.jitTtlMinutes || 45);
  const [draggingStepId, setDraggingStepId] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    refreshSyncStamp("Automated governance engine active");
  }, [refreshSyncStamp]);

  useEffect(() => {
    writeLocalJson(ADMIN_POLICY_RUNTIME_KEY, runtimePolicy);
  }, [runtimePolicy]);

  useEffect(() => {
    writeLocalJson(ADMIN_RETENTION_POLICY_KEY, retentionPolicy);
  }, [retentionPolicy]);

  useEffect(() => {
    writeLocalJson(ADMIN_RULE_CHANGE_LOG_KEY, ruleChangeLog.slice(0, 200));
  }, [ruleChangeLog]);

  useEffect(() => {
    writeLocalJson(ADMIN_JIT_GRANTS_KEY, jitGrants.slice(0, 100));
  }, [jitGrants]);

  useEffect(() => {
    writeLocalJson(ADMIN_APPROVAL_WORKFLOW_KEY, workflowSteps);
  }, [workflowSteps]);

  useEffect(() => {
    writeLocalJson(ADMIN_SUBCONTRACTOR_REGISTRY_KEY, subcontractorRegistry);
  }, [subcontractorRegistry]);

  useEffect(() => {
    writeLocalJson(ADMIN_USER_DIRECTORY_KEY, userDirectory);
  }, [userDirectory]);

  useEffect(() => {
    if (!selectedUserId && userDirectory[0]) setSelectedUserId(userDirectory[0].id);
    if (!jitUserId && userDirectory[0]) setJitUserId(userDirectory[0].id);
  }, [selectedUserId, userDirectory, jitUserId]);

  useEffect(() => {
    if (!selectedProjectId) {
      const first = projects[0]?.id || userDirectory[0]?.assignedProjects?.[0] || "";
      if (first) setSelectedProjectId(first);
    }
  }, [projects, selectedProjectId, userDirectory]);

  const selectedUser = userDirectory.find((user) => user.id === selectedUserId) || null;
  const selectedProject = selectedProjectId || projects[0]?.id || "";
  const abacResult = selectedUser && selectedProject ? evaluateAbac(selectedUser, selectedProject) : null;

  const governanceDrifts = useMemo(() => {
    const drifts = [];

    for (const user of userDirectory) {
      const dormant = daysSince(user.lastLoginAt) >= toNumber(runtimePolicy.dormantAdminDays || 90);
      if (normalize(user.role) === "owner" && dormant) {
        drifts.push({
          id: `dormant-${user.id}`,
          severity: "High",
          category: "Dormant Admin",
          detail: `${user.name} has not logged in for ${daysSince(user.lastLoginAt)} days.`,
          actionHref: "/portal/admin",
          actionLabel: "Review access",
        });
      }

      if (!user.mfaEnabled && /owner|pm/.test(normalize(user.role))) {
        drifts.push({
          id: `mfa-${user.id}`,
          severity: "High",
          category: "MFA",
          detail: `${user.name} has elevated role without MFA enabled.`,
          actionHref: "/portal/admin",
          actionLabel: "Enforce MFA",
        });
      }

      if (!(user.assignedProjects || []).length) {
        drifts.push({
          id: `assignment-${user.id}`,
          severity: "Medium",
          category: "ABAC Assignment",
          detail: `${user.name} has no assigned project but remains active.`,
          actionHref: "/portal/projects",
          actionLabel: "Assign project",
        });
      }
    }

    for (const contractor of subcontractorRegistry) {
      const insuranceDays = daysUntil(contractor.insuranceExpiry);
      const licenseDays = daysUntil(contractor.licenseExpiry);
      if (insuranceDays <= toNumber(runtimePolicy.fieldTaskCredentialWarningDays || 30) || licenseDays <= toNumber(runtimePolicy.fieldTaskCredentialWarningDays || 30)) {
        drifts.push({
          id: `contractor-${contractor.id}`,
          severity: insuranceDays < 0 || licenseDays < 0 ? "Critical" : "High",
          category: "Credential Drift",
          detail: `${contractor.name}: insurance ${insuranceDays} day(s), license ${licenseDays} day(s).`,
          actionHref: "/portal/field-tasks",
          actionLabel: "Block assignment",
        });
      }
    }

    const patterns = adminGovernance.complianceSentinel?.flagShadowWorkflowPatterns || [];
    const shadowCount = auditItems.filter((item) => {
      const hay = normalize(`${item.summary || ""} ${item.detail || ""} ${item.reason || ""}`);
      return patterns.some((pattern) => hay.includes(normalize(pattern)));
    }).length;
    if (shadowCount > 0) {
      drifts.push({
        id: "shadow-workflows",
        severity: "High",
        category: "Shadow Workflow",
        detail: `${shadowCount} potential out-of-band or bypass workflow event(s) detected in audit stream.`,
        actionHref: "/portal/audit",
        actionLabel: "Open audit",
      });
    }

    return drifts;
  }, [userDirectory, subcontractorRegistry, auditItems, runtimePolicy]);

  const governanceHealth = useMemo(() => {
    const insuranceCompliant = subcontractorRegistry.filter((row) => daysUntil(row.insuranceExpiry) > 30 && daysUntil(row.licenseExpiry) > 30).length;
    const insurancePct = subcontractorRegistry.length ? Math.round((insuranceCompliant / subcontractorRegistry.length) * 100) : 100;

    const validPermissions = userDirectory.filter((user) => {
      const userProjects = user.assignedProjects || [];
      return userProjects.every((projectId) => evaluateAbac(user, projectId).allow);
    }).length;
    const permissionPct = userDirectory.length ? Math.round((validPermissions / userDirectory.length) * 100) : 100;

    const shadowBypass = governanceDrifts.filter((item) => item.category === "Shadow Workflow").length;

    return {
      insurancePct,
      permissionPct,
      shadowBypass,
      driftCount: governanceDrifts.length,
    };
  }, [subcontractorRegistry, userDirectory, governanceDrifts]);

  const complianceRecommendations = useMemo(() => {
    const items = [];
    if (governanceHealth.insurancePct < 100) {
      items.push({ summary: `Insurance / license compliance is ${governanceHealth.insurancePct}%.`, href: "/portal/field-tasks" });
    }
    if (governanceHealth.permissionPct < 100) {
      items.push({ summary: `Permission validity is ${governanceHealth.permissionPct}%. Review ABAC assignments.`, href: "/portal/admin" });
    }
    if (governanceHealth.shadowBypass > 0) {
      items.push({ summary: `${governanceHealth.shadowBypass} shadow-workflow cluster(s) detected.`, href: "/portal/audit" });
    }
    return items;
  }, [governanceHealth]);

  function logRuleChange(ruleKey, beforeValue, afterValue, reason) {
    const actor = session?.email || "system@fca";
    setRuleChangeLog((current) => [
      {
        id: `${Date.now()}-${Math.random().toString(16).slice(2, 7)}`,
        at: new Date().toISOString(),
        actor,
        ruleKey,
        beforeValue,
        afterValue,
        reason,
      },
      ...current,
    ]);
  }

  function updateRuntimePolicy(key, value, reason) {
    const before = runtimePolicy[key];
    const after = toNumber(value);
    if (before === after) return;
    setRuntimePolicy((current) => ({ ...current, [key]: after }));
    logRuleChange(`runtimePolicy.${key}`, before, after, reason);
    setNotice(`Policy updated: ${key}`);
  }

  function updateRetentionPolicy(key, value, reason) {
    const before = retentionPolicy[key];
    const after = toNumber(value);
    if (before === after) return;
    setRetentionPolicy((current) => ({ ...current, [key]: after }));
    logRuleChange(`retentionPolicy.${key}`, before, after, reason);
    setNotice(`Retention updated: ${key}`);
  }

  function reorderWorkflowStep(fromId, toId) {
    if (!fromId || !toId || fromId === toId) return;
    setWorkflowSteps((current) => {
      const fromIndex = current.findIndex((item) => item.id === fromId);
      const toIndex = current.findIndex((item) => item.id === toId);
      if (fromIndex < 0 || toIndex < 0) return current;
      const next = [...current];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      logRuleChange("approvalWorkflow.order", current.map((item) => item.id), next.map((item) => item.id), "Workflow order changed");
      return next;
    });
  }

  function issueJitGrant() {
    if (!jitUserId || !jitPrivilege) return;
    const ttl = Math.min(
      toNumber(adminGovernance.securityGovernance?.jitAccess?.maxTtlMinutes || 120),
      Math.max(5, toNumber(jitMinutes || runtimePolicy.jitTtlMinutes || 45)),
    );
    const now = Date.now();
    const expiresAt = new Date(now + ttl * 60000).toISOString();

    const grant = {
      id: `jit-${now}`,
      userId: jitUserId,
      privilege: jitPrivilege,
      issuedBy: session?.email || "system@fca",
      issuedAt: new Date(now).toISOString(),
      expiresAt,
      status: "Active",
    };

    setJitGrants((current) => [grant, ...current]);
    logRuleChange("jitAccess.issue", "none", `${jitUserId}:${jitPrivilege}:${ttl}m`, "Temporary elevation granted");
    setNotice("JIT privilege granted with automatic expiry.");
  }

  function revokeGrant(grantId) {
    setJitGrants((current) => current.map((grant) => (grant.id === grantId ? { ...grant, status: "Revoked" } : grant)));
    logRuleChange("jitAccess.revoke", grantId, "revoked", "Manual revoke executed");
    setNotice("JIT grant revoked.");
  }

  function updateSubcontractor(id, patch, reason) {
    setSubcontractorRegistry((current) => {
      const before = current.find((item) => item.id === id);
      const next = current.map((item) => (item.id === id ? { ...item, ...patch } : item));
      const after = next.find((item) => item.id === id);
      logRuleChange(`subcontractor.${id}`, before, after, reason);
      return next;
    });
  }

  return (
    <PortalShell
      title="Admin & Governance"
      subtitle="Automated governance engine for zero-trust access, policy-as-code enforcement, and audit-proof configuration."
      activeHref="/portal/admin"
      currentJourney="finance"
      routeOverlay={routeStateOverlays.admin}
      primaryHref="/portal/audit"
      primaryLabel="Open audit"
      showRouteOverlay={false}
    >
      {notice ? <PortalAlert tone="success">{notice}</PortalAlert> : null}

      <PortalSliceAuricrux
        title="Auricrux Admin Governance"
        targetObjectType="Tenant"
        targetObjectId={state?.tenant?.name || session?.email || "TENANT"}
        sourceRoute="/portal/admin"
        rationale="Administrative policy decisions must remain sovereign, traceable, and enforceable across all role and compliance paths."
        nextAction={governanceDrifts[0]?.detail || "Confirm policy runtime thresholds and zero-trust assignments for this tenant."}
        actionHref="/portal/audit"
        actionLabel="Open forensic audit"
        tone="green"
        liveRecommend
      />

      <AuricruxInsightPanel
        title="Auricrux Compliance Sentinel"
        targetObjectType="Tenant"
        targetObjectId={state?.tenant?.name || session?.email || "TENANT"}
        sourceRoute="/portal/admin"
        rationale="Continuously detect governance drift and enforce policy before risk becomes an audit finding."
        nextAction={governanceDrifts[0]?.detail || "No critical governance drift detected."}
        recommendations={complianceRecommendations}
        tone="green"
        liveRecommend
      />

      <PortalPageIntro
        eyebrow="Constitution Layer"
        title="Rule transparency, zero-trust controls, and preventive governance"
        detail="This surface controls who can do what, when they can do it, and logs every policy mutation with actor + timestamp for audit-proof configuration."
      />

      <PortalQuickStats
        items={[
          { label: "Insurance Compliance", value: `${governanceHealth.insurancePct}%`, hint: "Subcontractor credential posture" },
          { label: "Permission Validity", value: `${governanceHealth.permissionPct}%`, hint: "RBAC + ABAC context checks" },
          { label: "Governance Drifts", value: governanceHealth.driftCount, hint: "Active drift detections" },
          { label: "Rule Mutations", value: ruleChangeLog.length, hint: "Audit-proof rule-change trail" },
        ]}
      />

      <div style={{ ...portalCardStyle, marginBottom: 16 }}>
        <div style={portalEyebrowStyle}>Governance Dashboard</div>
        <PortalEntityTable
          columns={[
            { key: "severity", label: "Severity", render: (row) => <PortalStatusBadge status={row.severity} active={row.severity !== "Medium"} /> },
            { key: "category", label: "Category" },
            { key: "detail", label: "Detection" },
            { key: "action", label: "", render: (row) => <a href={row.actionHref} style={{ color: portalTokens.primary }}>{row.actionLabel}</a> },
          ]}
          rows={governanceDrifts}
          emptyTitle="No governance drift"
          emptyDetail="Auricrux currently detects no security/compliance drift in the active tenant."
          emptyPrimaryHref="/portal/admin"
          emptyPrimaryLabel="Stay in admin"
        />
      </div>

      <div style={{ ...portalCardStyle, marginBottom: 16 }}>
        <div style={portalEyebrowStyle}>RBAC + ABAC Hybrid</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 10, marginBottom: 10 }}>
          <label>
            User
            <select value={selectedUserId} onChange={(event) => setSelectedUserId(event.target.value)} style={{ width: "100%", marginTop: 6, border: "1px solid #cbd5e1", borderRadius: 8, padding: "8px 10px" }}>
              {userDirectory.map((user) => (
                <option key={user.id} value={user.id}>{user.name} ({user.role})</option>
              ))}
            </select>
          </label>
          <label>
            Project
            <select value={selectedProjectId} onChange={(event) => setSelectedProjectId(event.target.value)} style={{ width: "100%", marginTop: 6, border: "1px solid #cbd5e1", borderRadius: 8, padding: "8px 10px" }}>
              {(projects.map((item) => item.id).filter(Boolean).length ? projects.map((item) => item.id) : ["PRJ-001"]).map((projectId) => (
                <option key={projectId} value={projectId}>{projectId}</option>
              ))}
            </select>
          </label>
        </div>
        {abacResult ? (
          <div style={{ border: "1px solid #e2e8f0", borderRadius: 10, padding: 10, background: "#fff" }}>
            <div><strong>Access result:</strong> <PortalStatusBadge status={abacResult.allow ? "Allowed" : "Denied"} active={!abacResult.allow} /></div>
            <div style={{ color: portalTokens.body, marginTop: 6 }}>{abacResult.reason}</div>
            <div style={{ color: portalTokens.muted, fontSize: 12, marginTop: 4 }}>Role permissions: {(abacResult.roleTokens || []).join(", ") || "none"}</div>
          </div>
        ) : null}
      </div>

      <div style={{ ...portalCardStyle, marginBottom: 16 }}>
        <div style={portalEyebrowStyle}>Just-in-Time Access</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: 8, marginBottom: 10 }}>
          <select value={jitUserId} onChange={(event) => setJitUserId(event.target.value)} style={{ border: "1px solid #cbd5e1", borderRadius: 8, padding: "8px 10px" }}>
            {userDirectory.map((user) => <option key={user.id} value={user.id}>{user.name}</option>)}
          </select>
          <select value={jitPrivilege} onChange={(event) => setJitPrivilege(event.target.value)} style={{ border: "1px solid #cbd5e1", borderRadius: 8, padding: "8px 10px" }}>
            {(adminGovernance.securityGovernance?.jitAccess?.highRiskPrivileges || []).map((privilege) => <option key={privilege} value={privilege}>{privilege}</option>)}
          </select>
          <input value={jitMinutes} onChange={(event) => setJitMinutes(toNumber(event.target.value) || 0)} placeholder="TTL minutes" style={{ border: "1px solid #cbd5e1", borderRadius: 8, padding: "8px 10px" }} />
          <button type="button" style={portalButtonPrimary} onClick={issueJitGrant}>Issue JIT Grant</button>
        </div>
        <PortalEntityTable
          columns={[
            { key: "userId", label: "User" },
            { key: "privilege", label: "Privilege" },
            { key: "expiresAt", label: "Expires", render: (row) => formatDateTime(row.expiresAt) },
            {
              key: "status",
              label: "Status",
              render: (row) => {
                const expired = parseDate(row.expiresAt) <= Date.now();
                const status = row.status === "Revoked" ? "Revoked" : expired ? "Expired" : "Active";
                return <PortalStatusBadge status={status} active={status !== "Active"} />;
              },
            },
            { key: "action", label: "", render: (row) => row.status === "Active" ? <button type="button" style={portalButtonSecondary} onClick={() => revokeGrant(row.id)}>Revoke</button> : "" },
          ]}
          rows={jitGrants}
          emptyTitle="No JIT grants"
          emptyDetail="Temporary privilege grants will appear here with automatic expiration."
          emptyPrimaryHref="/portal/admin"
          emptyPrimaryLabel="Stay in admin"
        />
      </div>

      <div style={{ ...portalCardStyle, marginBottom: 16 }}>
        <div style={portalEyebrowStyle}>Policy-as-Code Workflow</div>
        <div style={{ color: portalTokens.body, fontSize: 13, marginBottom: 8 }}>
          Drag approval cards to reorder policy routing. Workflow order is stored and every change is logged.
        </div>
        <div style={{ display: "grid", gap: 8 }}>
          {workflowSteps.map((step) => (
            <div
              key={step.id}
              draggable
              onDragStart={() => setDraggingStepId(step.id)}
              onDragOver={(event) => event.preventDefault()}
              onDrop={() => {
                reorderWorkflowStep(draggingStepId, step.id);
                setDraggingStepId("");
              }}
              style={{ border: "1px solid #cbd5e1", borderRadius: 10, background: "#fff", padding: 10, cursor: "grab" }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center" }}>
                <strong>{step.title}</strong>
                <PortalStatusBadge status={step.riskLevel} active={step.riskLevel === "High"} />
              </div>
              <div style={{ color: portalTokens.muted, fontSize: 12, marginTop: 4 }}>Approver: {step.approverRole}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ ...portalCardStyle, marginBottom: 16 }}>
        <div style={portalEyebrowStyle}>Active Policy Controls</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 10 }}>
          <label>
            CO external PDF sign-off threshold (USD)
            <input value={runtimePolicy.changeOrderPdfSignoffOverUsd} onChange={(event) => updateRuntimePolicy("changeOrderPdfSignoffOverUsd", event.target.value, "Changed external sign-off threshold") } style={{ width: "100%", marginTop: 6, border: "1px solid #cbd5e1", borderRadius: 8, padding: "8px 10px" }} />
          </label>
          <label>
            Field-task credential warning days
            <input value={runtimePolicy.fieldTaskCredentialWarningDays} onChange={(event) => updateRuntimePolicy("fieldTaskCredentialWarningDays", event.target.value, "Changed credential warning window") } style={{ width: "100%", marginTop: 6, border: "1px solid #cbd5e1", borderRadius: 8, padding: "8px 10px" }} />
          </label>
          <label>
            Dormant admin lock-review days
            <input value={runtimePolicy.dormantAdminDays} onChange={(event) => updateRuntimePolicy("dormantAdminDays", event.target.value, "Changed dormant admin drift threshold") } style={{ width: "100%", marginTop: 6, border: "1px solid #cbd5e1", borderRadius: 8, padding: "8px 10px" }} />
          </label>
          <label>
            JIT default TTL (minutes)
            <input value={runtimePolicy.jitTtlMinutes} onChange={(event) => updateRuntimePolicy("jitTtlMinutes", event.target.value, "Changed JIT TTL") } style={{ width: "100%", marginTop: 6, border: "1px solid #cbd5e1", borderRadius: 8, padding: "8px 10px" }} />
          </label>
        </div>
      </div>

      <div style={{ ...portalCardStyle, marginBottom: 16 }}>
        <div style={portalEyebrowStyle}>Lien & Insurance Registry</div>
        <PortalEntityTable
          columns={[
            { key: "name", label: "Subcontractor" },
            { key: "trade", label: "Trade" },
            { key: "insuranceExpiry", label: "Insurance Expiry" },
            { key: "licenseExpiry", label: "License Expiry" },
            { key: "credentialStatus", label: "Credential", render: (row) => <PortalStatusBadge status={row.credentialStatus} active={normalize(row.credentialStatus) !== "active"} /> },
            {
              key: "action",
              label: "",
              render: (row) => (
                <button
                  type="button"
                  style={portalButtonSecondary}
                  onClick={() => updateSubcontractor(
                    row.id,
                    {
                      credentialStatus: normalize(row.credentialStatus) === "active" ? "Suspended" : "Active",
                    },
                    "Manually toggled subcontractor credential state",
                  )}
                >
                  {normalize(row.credentialStatus) === "active" ? "Suspend" : "Activate"}
                </button>
              ),
            },
          ]}
          rows={subcontractorRegistry}
          emptyTitle="No subcontractors"
          emptyDetail="Registry is used to block new assignments when credentials are expiring or expired."
          emptyPrimaryHref="/portal/admin"
          emptyPrimaryLabel="Stay in admin"
        />
      </div>

      <div style={{ ...portalCardStyle, marginBottom: 16 }}>
        <div style={portalEyebrowStyle}>Data Retention & Privacy</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 10 }}>
          <label>
            Project records (years)
            <input value={retentionPolicy.projectRecordsYears} onChange={(event) => updateRetentionPolicy("projectRecordsYears", event.target.value, "Updated project record retention") } style={{ width: "100%", marginTop: 6, border: "1px solid #cbd5e1", borderRadius: 8, padding: "8px 10px" }} />
          </label>
          <label>
            Move to cold storage (years)
            <input value={retentionPolicy.coldStorageAfterYears} onChange={(event) => updateRetentionPolicy("coldStorageAfterYears", event.target.value, "Updated cold storage transfer rule") } style={{ width: "100%", marginTop: 6, border: "1px solid #cbd5e1", borderRadius: 8, padding: "8px 10px" }} />
          </label>
          <label>
            Audit trail retention (years)
            <input value={retentionPolicy.auditTrailYears} onChange={(event) => updateRetentionPolicy("auditTrailYears", event.target.value, "Updated audit retention") } style={{ width: "100%", marginTop: 6, border: "1px solid #cbd5e1", borderRadius: 8, padding: "8px 10px" }} />
          </label>
          <label>
            PII retention (years)
            <input value={retentionPolicy.piiYears} onChange={(event) => updateRetentionPolicy("piiYears", event.target.value, "Updated PII retention policy") } style={{ width: "100%", marginTop: 6, border: "1px solid #cbd5e1", borderRadius: 8, padding: "8px 10px" }} />
          </label>
        </div>
      </div>

      <div style={portalCardStyle}>
        <div style={portalEyebrowStyle}>Audit-Proof Configuration Trail</div>
        <PortalEntityTable
          columns={[
            { key: "at", label: "When", render: (row) => formatDateTime(row.at) },
            { key: "actor", label: "Who" },
            { key: "ruleKey", label: "Rule" },
            { key: "beforeValue", label: "Before", render: (row) => String(typeof row.beforeValue === "object" ? JSON.stringify(row.beforeValue) : row.beforeValue) },
            { key: "afterValue", label: "After", render: (row) => String(typeof row.afterValue === "object" ? JSON.stringify(row.afterValue) : row.afterValue) },
          ]}
          rows={ruleChangeLog}
          emptyTitle="No configuration mutations"
          emptyDetail="Every policy change will log actor, timestamp, previous value, and new value."
          emptyPrimaryHref="/portal/admin"
          emptyPrimaryLabel="Stay in admin"
        />
      </div>
    </PortalShell>
  );
}
