import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

const VIOLATIONS = [
  { id: "guardrail", label: "Missing guardrail on elevated scaffold", hint: "OSHA 1926.451(g)(1)" },
  { id: "ppe", label: "Worker in hard-hat zone without PPE", hint: "OSHA 1926.100" },
  { id: "electrical", label: "Open electrical panel — not LOTO secured", hint: "OSHA 1926.416" },
  { id: "egress", label: "Materials blocking emergency egress path", hint: "OSHA 1926.34" },
  { id: "fall-edge", label: "Unprotected floor opening at slab edge", hint: "OSHA 1926.502(b)" },
];

function buildSafetySiteScene(scene) {
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(24, 18),
    new THREE.MeshStandardMaterial({ color: 0x9ca3af }),
  );
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  scene.add(floor);

  const slab = new THREE.Mesh(
    new THREE.BoxGeometry(8, 0.4, 6),
    new THREE.MeshStandardMaterial({ color: 0xd1d5db }),
  );
  slab.position.set(-4, 0.2, 0);
  slab.castShadow = true;
  scene.add(slab);

  const scaffold = new THREE.Group();
  for (let y = 0; y < 3; y += 1) {
    const deck = new THREE.Mesh(
      new THREE.BoxGeometry(3, 0.12, 2),
      new THREE.MeshStandardMaterial({ color: 0xfbbf24 }),
    );
    deck.position.set(5, 1 + y * 1.2, -2);
    scaffold.add(deck);
    const legGeo = new THREE.CylinderGeometry(0.06, 0.06, 1.2);
    const legMat = new THREE.MeshStandardMaterial({ color: 0x374151 });
    [[-1.4, -0.9], [1.4, -0.9], [-1.4, 0.9], [1.4, 0.9]].forEach(([lx, lz]) => {
      const leg = new THREE.Mesh(legGeo, legMat);
      leg.position.set(5 + lx, 0.6 + y * 1.2, -2 + lz);
      scaffold.add(leg);
    });
  }
  scene.add(scaffold);

  const guardrail = new THREE.Mesh(
    new THREE.BoxGeometry(3, 0.08, 0.08),
    new THREE.MeshStandardMaterial({ color: 0xdc2626, emissive: 0x450a0a, emissiveIntensity: 0.2 }),
  );
  guardrail.position.set(5, 4.2, -3);
  guardrail.userData = { violationId: "guardrail", isViolation: true };
  guardrail.visible = false;
  scene.add(guardrail);

  const missingGuardrailMarker = new THREE.Mesh(
    new THREE.BoxGeometry(3, 0.15, 0.15),
    new THREE.MeshStandardMaterial({ color: 0xf97316, transparent: true, opacity: 0.85 }),
  );
  missingGuardrailMarker.position.set(5, 4.05, -3);
  missingGuardrailMarker.userData = { violationId: "guardrail", isViolation: true };
  scene.add(missingGuardrailMarker);

  const ppeZone = new THREE.Mesh(
    new THREE.CylinderGeometry(1.2, 1.2, 0.05, 32),
    new THREE.MeshStandardMaterial({ color: 0xfacc15, transparent: true, opacity: 0.35 }),
  );
  ppeZone.position.set(-1, 0.03, 3);
  scene.add(ppeZone);

  const worker = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.25, 0.8, 4, 8),
    new THREE.MeshStandardMaterial({ color: 0x2563eb }),
  );
  worker.position.set(-1, 0.85, 3);
  worker.userData = { violationId: "ppe", isViolation: true };
  scene.add(worker);

  const panel = new THREE.Mesh(
    new THREE.BoxGeometry(0.6, 0.9, 0.15),
    new THREE.MeshStandardMaterial({ color: 0x7f1d1d }),
  );
  panel.position.set(8, 1.2, 4);
  const panelDoor = new THREE.Mesh(
    new THREE.BoxGeometry(0.55, 0.85, 0.05),
    new THREE.MeshStandardMaterial({ color: 0xfca5a5 }),
  );
  panelDoor.position.set(8, 1.2, 4.12);
  panelDoor.userData = { violationId: "electrical", isViolation: true };
  scene.add(panel, panelDoor);

  const blockedPath = new THREE.Mesh(
    new THREE.BoxGeometry(2.5, 1.2, 1.5),
    new THREE.MeshStandardMaterial({ color: 0x78350f }),
  );
  blockedPath.position.set(0, 0.6, 7);
  blockedPath.userData = { violationId: "egress", isViolation: true };
  scene.add(blockedPath);

  const opening = new THREE.Mesh(
    new THREE.BoxGeometry(1.5, 0.05, 1.5),
    new THREE.MeshStandardMaterial({ color: 0x111827 }),
  );
  opening.position.set(-4, 0.42, -2);
  opening.userData = { violationId: "fall-edge", isViolation: true };
  scene.add(opening);

  const cone = new THREE.Mesh(
    new THREE.ConeGeometry(0.2, 0.5, 12),
    new THREE.MeshStandardMaterial({ color: 0xf97316 }),
  );
  cone.position.set(-4.5, 0.25, -2);
  scene.add(cone);
}

export default function FcaSafetySiteLab({ onSessionComplete, sessionId = "" }) {
  const mountRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const sceneRef = useRef(null);
  const raycasterRef = useRef(new THREE.Raycaster());
  const pointerRef = useRef(new THREE.Vector2());
  const [found, setFound] = useState([]);
  const [message, setMessage] = useState("Click each safety violation in the FCA-built site scene.");
  const [vrSupported, setVrSupported] = useState(false);

  useEffect(() => {
    if (!mountRef.current) return undefined;

    const width = mountRef.current.clientWidth || 640;
    const height = 420;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87ceeb);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 200);
    camera.position.set(10, 8, 12);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(2, 1, 0);
    controls.update();

    scene.add(new THREE.AmbientLight(0xffffff, 0.55));
    const sun = new THREE.DirectionalLight(0xffffff, 0.9);
    sun.position.set(8, 14, 6);
    sun.castShadow = true;
    scene.add(sun);

    buildSafetySiteScene(scene);

    if (navigator.xr) {
      navigator.xr.isSessionSupported("immersive-vr").then(setVrSupported).catch(() => setVrSupported(false));
    }

    let frameId = 0;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    function onPointerDown(event) {
      const rect = renderer.domElement.getBoundingClientRect();
      pointerRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointerRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      raycasterRef.current.setFromCamera(pointerRef.current, camera);
      const hits = raycasterRef.current.intersectObjects(scene.children, true);
      const hit = hits.find((item) => item.object.userData?.isViolation);
      if (!hit) return;

      const violationId = hit.object.userData.violationId;
      setFound((prev) => {
        if (prev.includes(violationId)) return prev;
        const next = [...prev, violationId];
        const label = VIOLATIONS.find((v) => v.id === violationId)?.label || violationId;
        setMessage(`Found: ${label} (${next.length}/${VIOLATIONS.length})`);
        if (next.length === VIOLATIONS.length) {
          const score = 100;
          onSessionComplete?.({
            sessionId,
            findings: next.map((id) => ({
              id,
              label: VIOLATIONS.find((v) => v.id === id)?.label,
            })),
            score,
          });
          setMessage("All five violations identified. Lab complete.");
        }
        return next;
      });
      hit.object.material = hit.object.material.clone();
      hit.object.material.emissive = new THREE.Color(0x15803d);
      hit.object.material.emissiveIntensity = 0.35;
    }

    renderer.domElement.addEventListener("pointerdown", onPointerDown);

    return () => {
      cancelAnimationFrame(frameId);
      renderer.domElement.removeEventListener("pointerdown", onPointerDown);
      controls.dispose();
      renderer.dispose();
      if (mountRef.current?.contains(renderer.domElement)) {
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, [onSessionComplete, sessionId]);

  async function enterVr() {
    if (!rendererRef.current?.xr || !navigator.xr) return;
    try {
      const session = await navigator.xr.requestSession("immersive-vr");
      await rendererRef.current.xr.setSession(session);
    } catch {
      setMessage("WebXR VR unavailable on this device. Desktop mode remains active.");
    }
  }

  return (
    <div>
      <div style={{ fontWeight: 700, color: "#0f172a", marginBottom: 8 }}>FCA Safety Site Simulation</div>
      <p style={{ color: "#475569", lineHeight: 1.65, marginTop: 0 }}>
        This scene is built entirely by FCA — no external models or services. Identify all five violations.
      </p>
      <div
        ref={mountRef}
        style={{
          width: "100%",
          minHeight: 420,
          borderRadius: 12,
          overflow: "hidden",
          border: "1px solid #cbd5e1",
          background: "#0f172a",
        }}
      />
      <div style={{ display: "flex", gap: 12, alignItems: "center", marginTop: 12, flexWrap: "wrap" }}>
        <div style={{ color: found.length === VIOLATIONS.length ? "#15803d" : "#334155", fontWeight: 600 }}>
          {message}
        </div>
        {vrSupported ? (
          <button
            type="button"
            onClick={enterVr}
            style={{
              border: "1px solid #2563eb",
              background: "#eff6ff",
              color: "#1d4ed8",
              borderRadius: 8,
              padding: "8px 12px",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Enter VR (WebXR)
          </button>
        ) : null}
      </div>
      <ul style={{ marginTop: 12, paddingLeft: 20, color: "#64748b", lineHeight: 1.7 }}>
        {VIOLATIONS.map((item) => (
          <li key={item.id} style={{ color: found.includes(item.id) ? "#15803d" : "#64748b" }}>
            {found.includes(item.id) ? "✓ " : "○ "}
            {item.label}
          </li>
        ))}
      </ul>
    </div>
  );
}

export { VIOLATIONS };
