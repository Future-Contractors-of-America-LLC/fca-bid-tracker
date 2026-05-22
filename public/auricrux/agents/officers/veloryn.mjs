export function advise(context) {
  const notes = [];
  if (!context?.matrixLoaded) notes.push("Matrix not loaded: execution is noncompliant with system truth posture.");
  if (context?.publicIdentity !== "Auricrux") notes.push("Identity violation: only Auricrux may be public-facing.");
  return { officer: "Veloryn", severity: notes.length ? "warn" : "ok", notes };
}