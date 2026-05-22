export function advise(context) {
  const notes = [];
  if (context?.costActionPlanned) notes.push("Cost-trigger detected: requires Auricrux final approval gate.");
  return { officer: "Numarqon", severity: notes.length ? "warn" : "ok", notes };
}