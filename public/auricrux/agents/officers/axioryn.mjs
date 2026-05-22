export function advise(context) {
  const notes = [];
  if (context?.experimentalChange) notes.push("Experimental change: ensure bounded, reversible, measurable before shipping.");
  return { officer: "Axioryn", severity: notes.length ? "warn" : "ok", notes };
}