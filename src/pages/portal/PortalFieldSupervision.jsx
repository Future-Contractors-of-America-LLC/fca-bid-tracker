import { useCallback, useEffect, useMemo, useState } from "react";
import PortalShell from "../../components/PortalShell";
import AuricruxInsightPanel from "../../components/auricrux/AuricruxInsightPanel";
import FieldPhotoCapture from "../../components/field/FieldPhotoCapture";
import FieldPhotoAnnotator from "../../components/field/FieldPhotoAnnotator";
import PlanComparePanel from "../../components/field/PlanComparePanel";
import usePortalProjectId from "../../hooks/usePortalProjectId";
import useProjectWorkspace from "../../hooks/useProjectWorkspace";
import useCustomerSession from "../../hooks/useCustomerSession";
import useWorkflowEvidence from "../../hooks/useWorkflowEvidence";
import {
  autoRedlineFromPhoto,
  compareFieldPhoto,
  fetchFieldPhotoFeedback,
  fetchFieldPhotos,
  fieldPhotoStreamUrl,
  updateFieldPhoto,
  uploadFieldPhoto,
} from "../../api/fieldPhotosClient";
import { routeStateOverlays } from "../../systemState";

const card = { border: "1px solid #e5e7eb", borderRadius: 14, padding: 18, background: "#fff" };
const actionBtn = { border: "1px solid #cbd5e1", background: "#fff", borderRadius: 8, padding: "8px 12px", fontWeight: 700, cursor: "pointer" };

function readProjectIdFromLocation() {
  if (typeof window === "undefined") return "";
  return new URLSearchParams(window.location.search).get("projectId") || "";
}

export default function PortalFieldSupervision() {
  const deepLinkProjectId = useMemo(() => readProjectIdFromLocation(), []);
  const { projectId, hasProject } = usePortalProjectId(deepLinkProjectId);
  const { projects, activeProject } = useProjectWorkspace();
  const { session } = useCustomerSession();
  const { files } = useWorkflowEvidence(projectId);

  const [photos, setPhotos] = useState([]);
  const [redlines, setRedlines] = useState([]);
  const [selectedPhotoId, setSelectedPhotoId] = useState("");
  const [fileId, setFileId] = useState("");
  const [sheetId, setSheetId] = useState("");
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [previewMap, setPreviewMap] = useState({});

  const selectedPhoto = photos.find((item) => item.id === selectedPhotoId) || photos[0] || null;
  const planFiles = (files || []).filter((file) => /plan|dwg|pdf|rvt|ifc|sheet/i.test(`${file.category} ${file.name} ${file.discipline}`));

  const reload = useCallback(async () => {
    if (!hasProject) {
      setPhotos([]);
      setRedlines([]);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const payload = await fetchFieldPhotos(projectId);
      setPhotos(payload.items || []);
      setRedlines(payload.redlines || []);
      if (!selectedPhotoId && payload.items?.[0]?.id) setSelectedPhotoId(payload.items[0].id);
    } catch (err) {
      setError(err.message || "Unable to load field photos.");
    } finally {
      setLoading(false);
    }
  }, [hasProject, projectId, selectedPhotoId]);

  useEffect(() => {
    reload();
  }, [reload]);

  useEffect(() => {
    if (selectedPhoto?.fileId) setFileId(selectedPhoto.fileId);
    if (selectedPhoto?.sheetId) setSheetId(selectedPhoto.sheetId);
  }, [selectedPhoto?.id, selectedPhoto?.fileId, selectedPhoto?.sheetId]);

  async function handleCapture(capture) {
    if (!hasProject) return;
    setBusy(true);
    setError("");
    try {
      const payload = await uploadFieldPhoto({
        projectId,
        contentBase64: capture.contentBase64,
        mimeType: capture.mimeType,
        notes: capture.notes,
        capturedBy: capture.capturedBy || session?.email || "field-supervisor",
        fileId,
        sheetId,
      });
      const item = payload.item;
      if (capture.previewUrl) {
        setPreviewMap((current) => ({ ...current, [item.id]: capture.previewUrl }));
      }
      setSelectedPhotoId(item.id);
      setNotice("Field photo uploaded to governed spine.");
      await reload();
    } catch (err) {
      setError(err.message || "Unable to upload photo.");
    } finally {
      setBusy(false);
    }
  }

  async function saveAnnotations(annotations) {
    if (!selectedPhoto?.id) return;
    setBusy(true);
    try {
      await updateFieldPhoto(selectedPhoto.id, { annotations, notes: selectedPhoto.notes });
      setNotice("Annotations saved.");
      await reload();
    } catch (err) {
      setError(err.message || "Unable to save annotations.");
    } finally {
      setBusy(false);
    }
  }

  async function runCompare() {
    if (!selectedPhoto?.id) return;
    setBusy(true);
    try {
      await compareFieldPhoto(selectedPhoto.id, { fileId, sheetId, projectId });
      setNotice("Plan compare complete.");
      await reload();
    } catch (err) {
      setError(err.message || "Unable to compare photo to plan.");
    } finally {
      setBusy(false);
    }
  }

  async function runAutoRedline() {
    if (!selectedPhoto?.id) return;
    setBusy(true);
    try {
      const payload = await autoRedlineFromPhoto(selectedPhoto.id, { fileId, sheetId, projectId });
      setNotice(`Generated ${payload.count || 0} redline(s) on governing plan.`);
      await reload();
    } catch (err) {
      setError(err.message || "Unable to generate redlines.");
    } finally {
      setBusy(false);
    }
  }

  async function runAuricruxFeedback() {
    if (!selectedPhoto?.id) return;
    setBusy(true);
    try {
      const payload = await fetchFieldPhotoFeedback(selectedPhoto.id);
      setNotice(payload.feedback || "Auricrux feedback updated.");
      await reload();
    } catch (err) {
      setError(err.message || "Unable to load Auricrux feedback.");
    } finally {
      setBusy(false);
    }
  }

  const imageUrl = selectedPhoto
    ? previewMap[selectedPhoto.id] || fieldPhotoStreamUrl(selectedPhoto.id)
    : "";

  return (
    <PortalShell
      title="Field Supervision"
      subtitle="Capture site photos, annotate conditions, compare to governing plans, and auto-generate redlines with Auricrux guidance."
      activeHref="/portal/field-supervision"
      currentJourney="job"
      routeOverlay={routeStateOverlays.projects}
      primaryHref={hasProject ? `/portal/design?projectId=${encodeURIComponent(projectId)}` : "/portal/projects"}
      primaryLabel="Open Design Workspace"
    >
      {!hasProject ? (
        <div style={card}>Select an active project from <a href="/portal/projects">Projects</a> to begin field supervision.</div>
      ) : null}

      {hasProject ? (
        <>
          <AuricruxInsightPanel
            title="Auricrux Field Intelligence"
            targetObjectId={projectId}
            sourceRoute="/portal/field-supervision"
            rationale="Review field photos, compare to plans, and advance redlines and RFIs with governed continuity."
            nextAction="Capture site photos, pin to sheets, compare to plans, and review auto-generated redlines."
            actionHref={`/portal/rfis?project=${encodeURIComponent(projectId)}`}
            actionLabel="Open RFIs"
            tone="amber"
            liveRecommend
          />

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 16, marginTop: 16 }}>
            <FieldPhotoCapture onCapture={handleCapture} busy={busy} author={session?.email || "field-supervisor"} />

            <div style={card}>
              <div style={{ fontWeight: 800, marginBottom: 10 }}>Pin to governing plan</div>
              <label style={{ display: "block", marginBottom: 10 }}>
                <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>Plan file</div>
                <select value={fileId} onChange={(event) => setFileId(event.target.value)} style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #cbd5e1" }}>
                  <option value="">Select plan file</option>
                  {planFiles.map((file) => (
                    <option key={file.fileId || file.id} value={file.fileId || file.id}>{file.name}</option>
                  ))}
                </select>
              </label>
              <label style={{ display: "block", marginBottom: 12 }}>
                <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>Sheet ID</div>
                <input value={sheetId} onChange={(event) => setSheetId(event.target.value)} placeholder="e.g. SHT-001" style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #cbd5e1", boxSizing: "border-box" }} />
              </label>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <button type="button" style={actionBtn} disabled={busy || !selectedPhoto} onClick={runCompare}>Compare to plan</button>
                <button type="button" style={actionBtn} disabled={busy || !selectedPhoto} onClick={runAutoRedline}>Auto redlines</button>
                <button type="button" style={actionBtn} disabled={busy || !selectedPhoto} onClick={runAuricruxFeedback}>Auricrux feedback</button>
              </div>
            </div>
          </div>

          {error ? <div style={{ ...card, marginTop: 16, color: "#991b1b", borderColor: "#fecaca", background: "#fef2f2" }}>{error}</div> : null}
          {notice ? <div style={{ ...card, marginTop: 16, color: "#166534", borderColor: "#86efac", background: "#ecfdf5" }}>{notice}</div> : null}

          {selectedPhoto ? (
            <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 16, marginTop: 16 }}>
              <div style={card}>
                <div style={{ fontWeight: 800, marginBottom: 8 }}>{selectedPhoto.notes || "Field photo"}</div>
                <FieldPhotoAnnotator imageUrl={imageUrl} annotations={selectedPhoto.annotations || []} onChange={saveAnnotations} />
                {selectedPhoto.auricruxFeedback ? (
                  <div style={{ marginTop: 12, padding: 12, borderRadius: 10, background: "#fffbeb", border: "1px solid #fde68a", color: "#92400e", lineHeight: 1.7 }}>
                    <strong>Auricrux:</strong> {selectedPhoto.auricruxFeedback}
                  </div>
                ) : null}
              </div>
              <div style={{ display: "grid", gap: 16 }}>
                <PlanComparePanel photo={selectedPhoto} onOpenDesign={(photo) => {
                  window.location.href = `/portal/design?projectId=${encodeURIComponent(projectId)}&fileId=${encodeURIComponent(photo.fileId)}&sheetId=${encodeURIComponent(photo.sheetId)}`;
                }} />
                <div style={card}>
                  <div style={{ fontWeight: 800, marginBottom: 8 }}>Photo register ({photos.length})</div>
                  {loading ? <div>Loading…</div> : null}
                  <div style={{ display: "grid", gap: 8, maxHeight: 280, overflowY: "auto" }}>
                    {photos.map((photo) => (
                      <button
                        key={photo.id}
                        type="button"
                        onClick={() => setSelectedPhotoId(photo.id)}
                        style={{
                          ...actionBtn,
                          textAlign: "left",
                          borderColor: photo.id === selectedPhotoId ? "#2563eb" : "#cbd5e1",
                          background: photo.id === selectedPhotoId ? "#eff6ff" : "#fff",
                        }}
                      >
                        <div style={{ fontWeight: 700 }}>{photo.notes || photo.id}</div>
                        <div style={{ fontSize: 12, color: "#64748b" }}>{photo.compareStatus || "pending"} · {photo.redlineIds?.length || 0} redline(s)</div>
                      </button>
                    ))}
                  </div>
                </div>
                {redlines.length ? (
                  <div style={card}>
                    <div style={{ fontWeight: 800, marginBottom: 8 }}>Redlines ({redlines.length})</div>
                    {redlines.slice(0, 6).map((redline) => (
                      <div key={redline.id} style={{ fontSize: 13, color: "#475569", marginBottom: 6 }}>{redline.label} · {redline.status}</div>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
          ) : null}
        </>
      ) : null}
    </PortalShell>
  );
}
