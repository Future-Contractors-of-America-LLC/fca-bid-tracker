import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { centralApi } from "../../api/backendBase";

async function loadIfcModel(scene, url) {
  const WebIFC = await import("web-ifc");
  const ifcApi = new WebIFC.IfcAPI();
  const wasmUrl = (await import("web-ifc/web-ifc.wasm?url")).default;
  ifcApi.SetWasmPath(wasmUrl.replace(/web-ifc\.wasm(\?.*)?$/, ""));
  await ifcApi.Init();

  const response = await fetch(url, { credentials: "include" });
  const buffer = new Uint8Array(await response.arrayBuffer());
  const modelId = ifcApi.OpenModel(buffer);
  const group = new THREE.Group();

  ifcApi.StreamAllMeshes(modelId, (flatMesh) => {
    const placed = flatMesh.geometries;
    for (let index = 0; index < placed.size(); index += 1) {
      const placedGeometry = placed.get(index);
      const geometry = new THREE.BufferGeometry();
      const verts = ifcApi.GetVertexArray(placedGeometry.geometryExpressID, modelId);
      geometry.setAttribute("position", new THREE.BufferAttribute(verts, 3));
      const indices = ifcApi.GetIndexArray(placedGeometry.geometryExpressID, modelId);
      geometry.setIndex(new THREE.BufferAttribute(indices, 1));
      geometry.computeVertexNormals();
      const color = placedGeometry.color
        ? new THREE.Color(placedGeometry.color.x, placedGeometry.color.y, placedGeometry.color.z)
        : new THREE.Color(0x94a3b8);
      const material = new THREE.MeshStandardMaterial({ color, metalness: 0.05, roughness: 0.85 });
      group.add(new THREE.Mesh(geometry, material));
    }
  });

  scene.add(group);
  ifcApi.CloseModel(modelId);
  return group;
}

async function loadGltfModel(scene, url) {
  const loader = new GLTFLoader();
  return new Promise((resolve, reject) => {
    loader.load(
      url,
      (gltf) => {
        scene.add(gltf.scene);
        resolve(gltf.scene);
      },
      undefined,
      reject,
    );
  });
}

async function loadFcamModel(scene, url) {
  const response = await fetch(url, { credentials: "include" });
  const document = await response.json();
  const group = new THREE.Group();
  const elements = document.elements || [];

  elements.forEach((element) => {
    const geometry = element.geometry || {};
    const scale = geometry.scale || [1, 1, 1];
    const position = geometry.position || [0, 0, 0];
    const color = element.color || [0.6, 0.62, 0.66];
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(scale[0], scale[1], scale[2]),
      new THREE.MeshStandardMaterial({
        color: new THREE.Color(color[0], color[1], color[2]),
        metalness: 0.05,
        roughness: 0.85,
      }),
    );
    mesh.position.set(position[0], position[1], position[2]);
    mesh.userData = { fcaElementId: element.id, fcaType: element.type };
    group.add(mesh);
  });

  scene.add(group);
  return { group, document };
}

function frameObject(camera, controls, object) {
  const box = new THREE.Box3().setFromObject(object);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  const maxDim = Math.max(size.x, size.y, size.z, 1);
  camera.position.copy(center.clone().add(new THREE.Vector3(maxDim * 1.4, maxDim, maxDim * 1.4)));
  controls.target.copy(center);
  controls.update();
}

export default function FcaNative3dViewer({ viewerSession, fileFormat, streamUrl = "", onExport }) {
  const mountRef = useRef(null);
  const rendererRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const controlsRef = useRef(null);
  const [status, setStatus] = useState("Initializing FCA FCAM viewer…");
  const [canonicalLabel, setCanonicalLabel] = useState("FCAM");
  const [vrSupported, setVrSupported] = useState(false);
  const fmt = (fileFormat || viewerSession?.format || viewerSession?.sourceFormat || "").toLowerCase();
  const effectiveFormat = viewerSession?.format || fmt;

  useEffect(() => {
    if (!viewerSession?.configured || !mountRef.current) {
      setStatus(viewerSession?.message || "Upload an IFC or glTF/GLB file to the project file spine.");
      return undefined;
    }

    const fcamPath = viewerSession.fcamStreamUrl || (effectiveFormat === "fcam" ? viewerSession.streamUrl : "");
    const resolvedUrl = streamUrl
      || (fcamPath ? centralApi(fcamPath) : viewerSession.streamUrl ? centralApi(viewerSession.streamUrl) : "");
    if (!resolvedUrl) {
      setStatus("FCA canonical stream unavailable.");
      return undefined;
    }

    const loadFormat = (fcamPath || effectiveFormat === "fcam")
      ? "fcam"
      : effectiveFormat === "glb" || effectiveFormat === "gltf"
        ? effectiveFormat
        : fmt;

    const width = mountRef.current.clientWidth || 640;
    const height = 360;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf1f5f9);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.01, 5000);
    camera.position.set(4, 4, 4);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.xr.enabled = true;
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controlsRef.current = controls;

    scene.add(new THREE.AmbientLight(0xffffff, 0.65));
    const key = new THREE.DirectionalLight(0xffffff, 0.85);
    key.position.set(5, 10, 7);
    scene.add(key);
    scene.add(new THREE.GridHelper(20, 20, 0xcbd5e1, 0xe2e8f0));

    if (navigator.xr) {
      navigator.xr.isSessionSupported("immersive-vr").then(setVrSupported).catch(() => setVrSupported(false));
    }

    let disposed = false;
    let frameId = 0;

    (async () => {
      try {
        setStatus("Loading FCA canonical model…");
        let root = null;
        if (loadFormat === "fcam") {
          const result = await loadFcamModel(scene, resolvedUrl);
          root = result.group;
          setCanonicalLabel(viewerSession.canonicalFormat || "FCAM");
          setStatus(
            `FCA ${viewerSession.canonicalFormat || "FCAM"} loaded (${result.document.elements?.length || 0} elements). `
            + "External import is evidence only.",
          );
        } else if (loadFormat === "glb" || loadFormat === "gltf") {
          root = await loadGltfModel(scene, resolvedUrl);
          setCanonicalLabel(viewerSession.canonicalFormat || "FCAM");
          setStatus("Viewing FCA view cache derived from canonical FCAM.");
        } else if (loadFormat === "ifc") {
          root = await loadIfcModel(scene, resolvedUrl);
          setStatus("Legacy IFC stream — re-upload to convert to FCAM.");
        } else {
          setStatus("FCA viewer supports FCAM and derived GLB view cache.");
          return;
        }
        if (disposed) return;
        if (root) frameObject(camera, controls, root);
        if (loadFormat !== "fcam") {
          setStatus((prev) => prev || "FCA Native 3D viewer ready.");
        }
      } catch (error) {
        if (!disposed) {
          setStatus(error.message || "Unable to load model from FCA storage.");
        }
      }
    })();

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      disposed = true;
      cancelAnimationFrame(frameId);
      renderer.setAnimationLoop(null);
      controls.dispose();
      renderer.dispose();
      sceneRef.current = null;
      cameraRef.current = null;
      controlsRef.current = null;
      if (mountRef.current?.contains(renderer.domElement)) {
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, [viewerSession, fileFormat, streamUrl, fmt, effectiveFormat]);

  async function enterVr() {
    const renderer = rendererRef.current;
    const scene = sceneRef.current;
    const camera = cameraRef.current;
    const controls = controlsRef.current;
    if (!renderer?.xr || !navigator.xr || !scene || !camera) return;
    try {
      const session = await navigator.xr.requestSession("immersive-vr", {
        optionalFeatures: ["local-floor"],
      });
      await renderer.xr.setSession(session);
      renderer.setAnimationLoop(() => {
        controls?.update();
        renderer.render(scene, camera);
      });
      session.addEventListener("end", () => {
        renderer.setAnimationLoop(null);
      });
    } catch {
      setStatus("WebXR unavailable — desktop viewing active.");
    }
  }

  if (!viewerSession) return null;

  return (
    <div style={{ color: "#475569", lineHeight: 1.7 }}>
      <div style={{ fontWeight: 700, color: "#0f172a", marginBottom: 8 }}>FCA Native 3D ({canonicalLabel})</div>
      {!viewerSession.configured ? (
        <p>{viewerSession.message}</p>
      ) : (
        <>
          <p style={{ marginTop: 0 }}>{status}</p>
          <div
            ref={mountRef}
            style={{
              width: "100%",
              minHeight: 360,
              borderRadius: 12,
              overflow: "hidden",
              border: "1px solid #cbd5e1",
              background: "#f8fafc",
            }}
          />
          <div style={{ marginTop: 8, display: "flex", gap: 8, flexWrap: "wrap", fontSize: 13 }}>
            <span><strong>Engine:</strong> {viewerSession.engine || "fca-native-fcam"}</span>
            <span><strong>Canonical:</strong> {canonicalLabel}</span>
            <span><strong>View:</strong> {effectiveFormat.toUpperCase()}</span>
            {viewerSession.convertMode ? <span><strong>Bridge:</strong> {viewerSession.convertMode}</span> : null}
            {onExport ? (
              <>
                <button type="button" onClick={() => onExport("ifc")} style={exportButtonStyle}>Export IFC</button>
                <button type="button" onClick={() => onExport("glb")} style={exportButtonStyle}>Export GLB</button>
              </>
            ) : null}
            {vrSupported ? (
              <button
                type="button"
                onClick={enterVr}
                style={{
                  border: "1px solid #2563eb",
                  background: "#eff6ff",
                  color: "#1d4ed8",
                  borderRadius: 8,
                  padding: "4px 10px",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Enter VR
              </button>
            ) : null}
          </div>
        </>
      )}
    </div>
  );
}

const exportButtonStyle = {
  border: "1px solid #cbd5e1",
  background: "#fff",
  color: "#334155",
  borderRadius: 8,
  padding: "4px 10px",
  fontWeight: 700,
  cursor: "pointer",
};
