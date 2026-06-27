import { useState } from "react";
import { portalButtonPrimary, portalCardStyle, portalTokens } from "../../portalDesignTokens";

export default function CreateBidForm({ onCreate, busy = false }) {
  const [packageName, setPackageName] = useState("");
  const [company, setCompany] = useState("");
  const [projectName, setProjectName] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    if (!packageName.trim() || busy) return;
    setError("");
    try {
      await onCreate({
        package: packageName.trim(),
        company: company.trim(),
        projectName: (projectName || packageName).trim(),
      });
      setPackageName("");
      setCompany("");
      setProjectName("");
    } catch (err) {
      setError(err.message || "Unable to create opportunity.");
    }
  }

  return (
    <div style={{ ...portalCardStyle, marginBottom: 16, border: "1px solid #bfdbfe", background: "linear-gradient(180deg, #eff6ff 0%, #fff 100%)" }}>
      <div style={{ fontWeight: 800, color: portalTokens.primaryInk, marginBottom: 8 }}>Add your first real opportunity</div>
      <p style={{ margin: "0 0 14px", color: "#475569", lineHeight: 1.6, fontSize: 14 }}>
        This creates a governed bid on your production spine — not demo data. Name a package you are actually pursuing.
      </p>
      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 12 }}>
        <label style={{ display: "grid", gap: 6 }}>
          <span style={{ fontWeight: 700, fontSize: 13 }}>Package name</span>
          <input
            required
            value={packageName}
            onChange={(event) => setPackageName(event.target.value)}
            placeholder="Example: Package A-117 — Lobby TI"
            style={{ border: "1px solid #cbd5e1", borderRadius: 10, padding: "10px 12px", font: "inherit" }}
          />
        </label>
        <label style={{ display: "grid", gap: 6 }}>
          <span style={{ fontWeight: 700, fontSize: 13 }}>GC / client (optional)</span>
          <input
            value={company}
            onChange={(event) => setCompany(event.target.value)}
            placeholder="Who issued the bid?"
            style={{ border: "1px solid #cbd5e1", borderRadius: 10, padding: "10px 12px", font: "inherit" }}
          />
        </label>
        <label style={{ display: "grid", gap: 6 }}>
          <span style={{ fontWeight: 700, fontSize: 13 }}>Project title (optional)</span>
          <input
            value={projectName}
            onChange={(event) => setProjectName(event.target.value)}
            placeholder="Same as package if blank"
            style={{ border: "1px solid #cbd5e1", borderRadius: 10, padding: "10px 12px", font: "inherit" }}
          />
        </label>
        <button type="submit" disabled={busy || !packageName.trim()} style={portalButtonPrimary}>
          {busy ? "Creating…" : "Create opportunity"}
        </button>
        {error ? <p style={{ color: "#b91c1c", margin: 0, fontSize: 13 }}>{error}</p> : null}
      </form>
    </div>
  );
}
