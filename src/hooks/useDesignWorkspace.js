import { useCallback, useEffect, useMemo, useState } from "react";
import { centralApi } from "../api/backendBase";
import {
  createDesignMarkup,
  createDesignSession,
  createTakeoffFromMarkup,
  fetchDesignContext,
  fetchDesignIntelligence,
  fetchDesignLayers,
  fetchDesignMarkups,
  fetchFileContent,
  fetchFileManifest,
  fetchViewerToken,
} from "../api/designWorkspaceClient";
import { DEFAULT_LAYERS, filterMarkupsByLayer, quantityFromGeometry } from "../utils/designMarkupUtils";

export default function useDesignWorkspace(projectId, fileId, sheetId = "") {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [manifest, setManifest] = useState(null);
  const [contentUrl, setContentUrl] = useState("");
  const [fileRecord, setFileRecord] = useState(null);
  const [markups, setMarkups] = useState([]);
  const [context, setContext] = useState(null);
  const [intelligence, setIntelligence] = useState(null);
  const [layers, setLayers] = useState(DEFAULT_LAYERS);
  const [viewerSession, setViewerSession] = useState(null);
  const [queueBusy, setQueueBusy] = useState(false);
  const [activeSheetId, setActiveSheetId] = useState(sheetId);

  const sheets = useMemo(() => manifest?.sheets || [], [manifest]);
  const visibleMarkups = useMemo(
    () => filterMarkupsByLayer(markups, layers.filter((layer) => layer.visible !== false).map((layer) => layer.id)),
    [markups, layers],
  );

  const refresh = useCallback(async () => {
    if (!projectId || !fileId) return;
    setLoading(true);
    setError("");
    try {
      const [manifestResult, contentResult, markupResult, contextResult, intelligenceResult, layerResult] = await Promise.all([
        fetchFileManifest(fileId).catch(() => ({ manifest: null })),
        fetchFileContent(fileId).catch(() => null),
        fetchDesignMarkups(projectId, { fileId, sheetId: activeSheetId || undefined }),
        fetchDesignContext(projectId, { fileId, sheetId: activeSheetId || undefined }),
        fetchDesignIntelligence(projectId, { fileId, sheetId: activeSheetId || undefined }).catch(() => null),
        fetchDesignLayers(projectId, fileId).catch(() => ({ items: DEFAULT_LAYERS })),
      ]);

      const nextManifest = manifestResult?.manifest || contentResult?.manifest || null;
      const resolvedFormat = contentResult?.file?.format || contentResult?.file?.fileFormat || nextManifest?.format;
      const viewerResult = await fetchViewerToken(projectId, fileId, {
        format: resolvedFormat,
        queue: false,
      }).catch(() => null);
      setManifest(nextManifest);
      setContentUrl(contentResult?.streamUrl ? centralApi(contentResult.streamUrl) : contentResult?.contentUrl || "");
      setFileRecord(contentResult?.file || contextResult?.file || null);
      setMarkups(markupResult?.items || []);
      setContext(contextResult || null);
      setIntelligence(intelligenceResult || contextResult?.intelligence || null);
      setLayers(layerResult?.items?.length ? layerResult.items : DEFAULT_LAYERS);
      setViewerSession(viewerResult || null);

      if (!activeSheetId && nextManifest?.sheets?.[0]?.sheetId) {
        setActiveSheetId(nextManifest.sheets[0].sheetId);
      }
    } catch (refreshError) {
      setError(refreshError.message || "Unable to load Design Workspace.");
    } finally {
      setLoading(false);
    }
  }, [projectId, fileId, activeSheetId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    if (sheetId && sheetId !== activeSheetId) {
      setActiveSheetId(sheetId);
    }
  }, [sheetId, activeSheetId]);

  const openSession = useCallback(async () => {
    if (!projectId || !fileId) return null;
    return createDesignSession(projectId, { fileId, sheetId: activeSheetId, mode: "markup" });
  }, [projectId, fileId, activeSheetId]);

  const queueViewerTranslation = useCallback(async () => {
    if (!projectId || !fileId) return null;
    if (!viewerSession?.interop?.enabled) return null;
    setQueueBusy(true);
    try {
      const format = fileRecord?.format || fileRecord?.fileFormat || manifest?.format;
      const viewerResult = await fetchViewerToken(projectId, fileId, { format, queue: true });
      setViewerSession(viewerResult || null);
      return viewerResult;
    } finally {
      setQueueBusy(false);
    }
  }, [projectId, fileId, fileRecord, manifest, viewerSession]);

  const addMarkup = useCallback(
    async (markupPayload) => {
      const result = await createDesignMarkup(projectId, {
        fileId,
        sheetId: activeSheetId,
        ...markupPayload,
      });
      await refresh();
      return result?.markup || result?.item || result;
    },
    [projectId, fileId, activeSheetId, refresh],
  );

  const spawnTakeoff = useCallback(
    async (markup, quantity, unit = "SF", options = {}) => {
      const resolvedQuantity = quantity ?? quantityFromGeometry(markup.geometry, markup.type === "count" ? 1 : undefined);
      const resolvedUnit = unit || (markup.type === "dimension" ? "LF" : markup.type === "count" ? "EA" : "SF");
      const result = await createTakeoffFromMarkup(projectId, {
        sourceFileId: fileId,
        sourceMarkupIds: [markup.id],
        sheetId: activeSheetId,
        description: markup.label || `Takeoff from ${markup.type}`,
        quantity: resolvedQuantity,
        unit: resolvedUnit,
        sourceGeometry: markup.geometry,
        fileIds: [fileId],
        tetherEstimate: options.tetherEstimate !== false,
        estimateId: options.estimateId,
      });
      await refresh();
      return result?.item || result;
    },
    [projectId, fileId, activeSheetId, refresh],
  );

  return {
    loading,
    error,
    manifest,
    contentUrl,
    fileRecord,
    markups,
    visibleMarkups,
    context,
    intelligence,
    layers,
    viewerSession,
    queueBusy,
    queueViewerTranslation,
    sheets,
    activeSheetId,
    setActiveSheetId,
    refresh,
    openSession,
    addMarkup,
    spawnTakeoff,
    setLayers,
  };
}
