import PdfPlanViewer from "./PdfPlanViewer";
import NativeSheetViewer from "./NativeSheetViewer";

export default function DesignCanvas({
  fileId,
  contentUrl,
  fileFormat = "pdf",
  activeSheet,
  markups = [],
  activeTool = "select",
  onMarkupComplete,
}) {
  const pageNumber = (activeSheet?.pageIndex ?? 0) + 1;
  const normalizedFormat = String(fileFormat || "pdf").toLowerCase();

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

  if (fileId && activeSheet?.sheetId) {
    return (
      <NativeSheetViewer
        fileId={fileId}
        sheetId={activeSheet.sheetId}
        activeSheet={activeSheet}
        fileFormat={normalizedFormat}
        markups={markups}
        activeTool={activeTool}
        scaleLabel={activeSheet?.scale}
        onMarkupComplete={onMarkupComplete}
      />
    );
  }

  return (
    <div style={{ padding: 24, color: "#64748b", textAlign: "center" }}>
      Select a governed file to open the FCA native design surface.
    </div>
  );
}
