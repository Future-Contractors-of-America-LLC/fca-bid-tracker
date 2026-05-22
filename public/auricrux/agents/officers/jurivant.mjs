export function advise(context) {
  const notes = [];
  if (context?.externalCommitmentPlanned) notes.push("External commitment detected: ensure approved class/template or escalate.");
  return { officer: "Jurivant", severity: notes.length ? "warn" : "ok", notes };
}