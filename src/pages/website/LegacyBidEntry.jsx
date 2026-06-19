import { useEffect } from "react";
import { navigateTo } from "../../navigation";

export default function LegacyBidEntry() {
  useEffect(() => {
    const params = typeof window !== "undefined" ? window.location.search : "";
    navigateTo(`/intake${params || "?plan=startup"}`);
  }, []);

  return (
    <main style={{ padding: 48, fontFamily: "system-ui, sans-serif", textAlign: "center" }}>
      <h1>Opening company intake</h1>
      <p style={{ color: "#64748b" }}>Redirecting you to the FCA onboarding form.</p>
    </main>
  );
}
