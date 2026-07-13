import { navigateTo } from "../../navigation";
import { useEffect } from "react";

/** Legacy /cte/program → honest CTE entry at /cte/portal */
export default function CteProgram() {
  useEffect(() => {
    navigateTo("/cte/portal");
  }, []);

  return (
    <div style={{ minHeight: "40vh", display: "flex", alignItems: "center", justifyContent: "center", color: "#475569", fontFamily: "system-ui, sans-serif" }}>
      Opening CTE programs…
    </div>
  );
}
