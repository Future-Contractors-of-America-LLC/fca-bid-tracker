/** FCA shell surface Do→Teach defaults — RA03 execute / RA04 teach per Law #7 surface. */

export const auricruxSurfaceConfigs = {
  landing: {
    surfaceLabel: "Auricrux on FCA public shell",
    title: "Operator voice from first click — not a separate chat tab",
    detail:
      "Auricrux carries Package A-117 bid continuity through platform, pricing, and login routes so conversion never drops the project spine.",
    primaryHref: "/portal/bids",
    primaryLabel: "Open Bid Workspace",
    secondaryHref: "/academy",
    secondaryLabel: "Open Academy LMS",
    targetObjectType: "Bid",
    targetObjectId: "BID-1",
    capabilityId: "bid-intake",
    executeLabel: "Do this — execute Package A-117 bid intake",
    teachLabel: "Teach me — cert-bid-strategy intake review",
  },
  saas: {
    surfaceLabel: "Auricrux in Contractor Command workspace",
    title: "Governed Do on bids, estimates, and proposals",
    detail:
      "Run plan/spec briefing on Package A-117, reconcile MEP plenum conflicts, and hand off to J. Benton estimator before EST-1.",
    primaryHref: "/portal/bids",
    primaryLabel: "Open Package A-117",
    secondaryHref: "/portal/estimates",
    secondaryLabel: "Open Estimate Studio",
    targetObjectType: "Bid",
    targetObjectId: "BID-1",
    capabilityId: "plan-briefing",
    executeLabel: "Do this — run A-117 plan/spec briefing",
    teachLabel: "Teach me — cert-quantity-takeoff scope gaps",
  },
  portal: {
    surfaceLabel: "Auricrux embedded in customer portal",
    title: "Project continuity from bid through closeout",
    detail:
      "Auricrux reads PRJ-BID-1 spine — tenant, files, audit — before any RA03 execute on document control or field workflows.",
    primaryHref: "/portal/files",
    primaryLabel: "Open Document Register",
    secondaryHref: "/portal/audit",
    secondaryLabel: "Open Audit Trail",
    targetObjectType: "Project",
    targetObjectId: "PRJ-BID-1",
    capabilityId: "document-control",
    executeLabel: "Do this — register A-117 drawing set",
    teachLabel: "Teach me — cert-cm-contract-admin doc control",
  },
  academy: {
    surfaceLabel: "Auricrux operates Academy pathways",
    title: "Credential proof tied to executed workflows",
    detail:
      "Every teach-back links to cert-* program keys operated by Auricrux — learners prove RA04 after RA03 execute on live project context.",
    primaryHref: "/academy/programs",
    primaryLabel: "Browse Certification Programs",
    secondaryHref: "/portal/bids",
    secondaryLabel: "Return to Bid Workspace",
    targetObjectType: "Project",
    targetObjectId: "PRJ-BID-1",
    capabilityId: "academy-guidance",
    executeLabel: "Do this — assign cert-quantity-takeoff teach-back",
    teachLabel: "Teach me — in-context scope gap review",
  },
  comms: {
    surfaceLabel: "Auricrux on customer communications",
    title: "Governed portal messages — no control-plane leakage",
    detail:
      "Draft owner scope clarification on Package A-117 with audit trail; escalate only pricing, legal, brand, or external commitment risk.",
    primaryHref: "/portal/messages",
    primaryLabel: "Open Message Center",
    secondaryHref: "/portal/bids",
    secondaryLabel: "Open Bid Context",
    targetObjectType: "Bid",
    targetObjectId: "BID-1",
    capabilityId: "comms",
    executeLabel: "Do this — draft A-117 scope clarification",
    teachLabel: "Teach me — cert-cm-stakeholder-relations messaging",
  },
  immersive: {
    surfaceLabel: "Auricrux on Design / Field immersive",
    title: "FCAM/FCAS coordination with teach-back scoring",
    detail:
      "Run immersive field overlay on A-117 MEP plenum conflict; teach-back through cert-bim-field-operations after governed execute.",
    primaryHref: "/portal/immersive",
    primaryLabel: "Open Immersive Labs",
    secondaryHref: "/portal/files",
    secondaryLabel: "Open Plan Register",
    targetObjectType: "Project",
    targetObjectId: "PRJ-BID-1",
    capabilityId: "immersive",
    executeLabel: "Do this — launch A-117 field overlay",
    teachLabel: "Teach me — cert-bim-field-operations lab review",
  },
};

export function resolveSurfaceKeyFromPath(pathname = "/") {
  if (pathname.startsWith("/academy")) return "academy";
  if (pathname.startsWith("/portal/messages") || pathname.startsWith("/portal/comms")) return "comms";
  if (pathname.startsWith("/portal/immersive") || pathname.startsWith("/portal/design")) return "immersive";
  if (pathname.startsWith("/portal/bids") || pathname.startsWith("/portal/estimates") || pathname.startsWith("/portal/proposals")) return "saas";
  if (pathname.startsWith("/portal")) return "portal";
  return "landing";
}

export function getSurfaceConfig(surfaceKey, pathname) {
  const key = surfaceKey || resolveSurfaceKeyFromPath(pathname);
  return auricruxSurfaceConfigs[key] || auricruxSurfaceConfigs.landing;
}
