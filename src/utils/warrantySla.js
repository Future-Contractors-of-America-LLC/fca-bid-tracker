const SLA_HOURS = {
  urgent: 24,
  standard: 72,
  low: 168,
};

export function slaHoursForSeverity(severity = "standard") {
  return SLA_HOURS[severity] || SLA_HOURS.standard;
}

export function formatWarrantyDueAt(dueAt) {
  if (!dueAt) return "SLA pending";
  const due = new Date(dueAt);
  if (Number.isNaN(due.getTime())) return String(dueAt);
  return due.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

export function isWarrantyOverdue(dueAt, status) {
  if (!dueAt || status === "resolved") return false;
  const due = new Date(dueAt);
  if (Number.isNaN(due.getTime())) return false;
  return due.getTime() < Date.now();
}

export function warrantySlaLabel({ severity, dueAt, status }) {
  if (status === "resolved") return "Resolved";
  if (isWarrantyOverdue(dueAt, status)) return "Past SLA";
  const hours = slaHoursForSeverity(severity);
  return `${hours}h SLA - due ${formatWarrantyDueAt(dueAt)}`;
}
