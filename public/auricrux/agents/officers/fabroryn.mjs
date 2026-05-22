export function advise(context) {
  const notes = [];
  if (context?.buildTargets?.length > 15) notes.push("High task volume: apply batching to preserve throughput and avoid churn.");
  return { officer: "Fabroryn", severity: notes.length ? "warn" : "ok", notes };
}