export function buildWarrantyContinuityHints(continuity = {}) {
  const hints = Array.isArray(continuity?.hints) ? continuity.hints : [];
  if (hints.length) return hints;

  const items = [];
  if ((continuity?.incompleteCloseoutCount || 0) > 0) {
    items.push({
      kind: "closeout-gap",
      message: "Complete closeout artifacts before closing warranty cases.",
      actionHref: "/portal/closeout",
    });
  }
  if ((continuity?.overdueCaseCount || 0) > 0) {
    items.push({
      kind: "sla-breach",
      message: "One or more warranty cases are past SLA response time.",
      actionHref: "/portal/warranty",
    });
  }
  if (!items.length) {
    items.push({
      kind: "ready",
      message: "Service continuity lane is active - log issues and track SLA on governed surfaces.",
      actionHref: "/portal/support",
    });
  }
  return items;
}
