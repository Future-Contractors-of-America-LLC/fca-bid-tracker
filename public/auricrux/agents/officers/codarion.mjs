export function advise(context) {
  const notes = [];
  if (context?.buildTargets?.length === 0) notes.push("No build targets detected: verify matrix parsing and generators.");
  return { officer: "Codarion", severity: notes.length ? "warn" : "ok", notes };
}
