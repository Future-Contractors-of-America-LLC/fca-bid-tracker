import PdfPlanViewer from "./PdfPlanViewer";
import FcasPlanViewer from "./FcasPlanViewer";

function TransitionalSheetViewer({ activeSheet, fileFormat, markups, activeTool, onMarkupComplete }) {
  return (
    <div
      style={{
        position: "relative",
        minHeight: 640,
        border: "1px solid #dbe3ef",
        borderRadius: 12,
        overflow: "hidden",
        background: "linear-gradient(180deg, #0f172a 0%, #1e293b 100%)",
        color: "#e2e8f0",
      }}
    >
      <div style={{ padding: 24, textAlign: "center" }}>
        <div style={{ fontSize: 28, fontWeight: 800 }}>{activeSheet?.name || "Design sheet"}</div>
        <div style={{ marginTop: 8, lineHeight: 1.7, color: "#cbd5e1" }}>
          {String(fileFormat).toUpperCase()} coordination surface with governed extraction manifest.
          <br />
          FCA native ingest converts interchange files to FCAM/FCAS — markup tools remain active.
        </div>
      </div>
      <div style={{ position: "relative", margin: "0 auto", width: "min(960px, 100%)", aspectRatio: "4 / 3", background: "#fff", borderRadius: 8 }}>
        <canvas
          width={960}
          height={720}
          onClick={(event) => {
            if (activeTool === "select") return;
            const rect = event.currentTarget.getBoundingClientRect();
            const point = [(event.clientX - rect.left) / rect.width, (event.clientY - rect.top) / rect.height];
            onMarkupComplete?.({ type: activeTool, geometry: { coordinates: [point] }, label: activeTool });
          }}
          style={{ width: "100%", height: "100%", cursor: activeTool === "select" ? "default" : "crosshair" }}
        />
      </div>
      <div style={{ position: "absolute", left: 16, bottom: 16, fontSize: 12, color: "#94a3b8" }}>
        {markups.length} markup(s) on sheet
      </div>
    </div>
  );
}

export default function DesignCanvas({
  fileId,
  contentUrl,
  fileFormat = "pdf",
  activeSheet,
  markups = [],
  activeTool = "select",
  onMarkupComplete,
  useFcas = false,
}) {
  const pageNumber = (activeSheet?.pageIndex ?? 0) + 1;
  const normalizedFormat = String(fileFormat || "").toLowerCase();

  if ((useFcas || normalizedFormat === "fcas") && fileId) {
    return (
      <FcasPlanViewer
        fileId={fileId}
        activeSheet={activeSheet}
        markups={markups}
        activeTool={activeTool}
        scaleLabel={activeSheet?.scale}
        onMarkupComplete={onMarkupComplete}
      />
    );
  }

  if (normalizedFormat === "pdf" && fileId) {
    return (
      <PdfPlanViewer
        fileId={fileId}
        pageNumber={pageNumber}
        markups={markups}
        activeTool={activeTool}
        scaleLabel={activeSheet?.scale}
        onMarkupComplete={onMarkupComplete}
      />
    );
  }

  return (
    <TransitionalSheetViewer
      activeSheet={activeSheet}
      fileFormat={fileFormat}
      markups={markups}
      activeTool={activeTool}
      onMarkupComplete={onMarkupComplete}
    />
  );
}
