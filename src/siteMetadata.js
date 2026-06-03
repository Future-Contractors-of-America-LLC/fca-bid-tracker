const SITE_ORIGIN = "https://futurecontractorsofamerica.com";
const SITE_NAME = "Future Contractors of America";
const DEFAULT_TITLE = "Future Contractors of America | FCA Operating System";
const DEFAULT_DESCRIPTION =
  "Future Contractors of America is the operating system for contractor growth, bid execution, project visibility, and Auricrux-guided workflow continuity.";
const DEFAULT_OG_IMAGE = `${SITE_ORIGIN}/social-card.svg`;

const routeMetadata = {
  "/": {
    title: DEFAULT_TITLE,
    description:
      "Future Contractors of America unifies contractor growth, bid coordination, project visibility, and Auricrux-guided execution in one operating system.",
  },
  "/platform": {
    title: "Platform | Future Contractors of America",
    description:
      "See the FCA platform shell spanning portal operations, academy readiness, support continuity, and executive visibility.",
  },
  "/auricrux": {
    title: "Auricrux | Future Contractors of America",
    description:
      "Auricrux is the intelligence and execution layer embedded across FCA workflows, customer operations, and field continuity.",
  },
  "/pricing": {
    title: "Pricing | Future Contractors of America",
    description:
      "Review FCA pricing options for contractor visibility, workflow control, and Auricrux-enabled operating continuity.",
  },
  "/contact": {
    title: "Contact | Future Contractors of America",
    description:
      "Contact Future Contractors of America to start rollout planning, demos, onboarding, or platform deployment discussions.",
  },
  "/login": {
    title: "Login | Future Contractors of America",
    description:
      "Access the FCA workspace, customer portal, academy continuity, and Auricrux-supported operations.",
  },
  "/portal": {
    title: "Portal | Future Contractors of America",
    description:
      "Manage active contractor work, projects, bids, files, billing, support, and operational visibility inside the FCA portal.",
  },
  "/portal/platform": {
    title: "Platform Dashboard | Future Contractors of America",
    description:
      "View the unified FCA platform dashboard across projects, academy progress, support posture, and administrative status.",
  },
  "/portal/projects": {
    title: "Projects | Future Contractors of America",
    description:
      "Track contractor projects, lifecycle progress, and rollout readiness inside the FCA workspace.",
  },
  "/portal/bids": {
    title: "Bids | Future Contractors of America",
    description:
      "Coordinate bid pipeline activity, opportunity posture, and execution follow-through in the FCA portal.",
  },
  "/portal/files": {
    title: "Files | Future Contractors of America",
    description:
      "Review project files, operational documents, and supporting artifacts inside the FCA workspace.",
  },
  "/portal/messages": {
    title: "Messages | Future Contractors of America",
    description:
      "Maintain customer, team, and operational communication continuity across FCA workflows.",
  },
  "/portal/billing": {
    title: "Billing | Future Contractors of America",
    description:
      "Manage FCA billing posture, subscriptions, and account continuity from the unified portal shell.",
  },
  "/portal/support": {
    title: "Support | Future Contractors of America",
    description:
      "Access support status, issue handling, and operator continuity within the FCA workspace.",
  },
  "/portal/admin": {
    title: "Admin | Future Contractors of America",
    description:
      "Review tenant controls, permissions, and executive administration across the FCA operating surface.",
  },
  "/portal/academy": {
    title: "Academy | Future Contractors of America",
    description:
      "Deliver Academy learning, certification readiness, and operational training continuity inside FCA.",
  },
  "/academy": {
    title: "Academy | Future Contractors of America",
    description:
      "Explore FCA Academy training, certification, and operational readiness connected to the broader platform shell.",
  },
};

function ensureTag(selector, createTag) {
  let node = document.head.querySelector(selector);
  if (!node) {
    node = createTag();
    document.head.appendChild(node);
  }
  return node;
}

function ensureMetaByName(name) {
  return ensureTag(`meta[name="${name}"]`, () => {
    const meta = document.createElement("meta");
    meta.name = name;
    return meta;
  });
}

function ensureMetaByProperty(property) {
  return ensureTag(`meta[property="${property}"]`, () => {
    const meta = document.createElement("meta");
    meta.setAttribute("property", property);
    return meta;
  });
}

export function syncDocumentMetadata(pathname) {
  const cleanPath = pathname?.replace(/\/$/, "") || "/";
  const metadata = routeMetadata[cleanPath] || routeMetadata["/"];
  const title = metadata.title || DEFAULT_TITLE;
  const descriptionText = metadata.description || DEFAULT_DESCRIPTION;
  const url = cleanPath === "/" ? SITE_ORIGIN : `${SITE_ORIGIN}${cleanPath}`;

  document.title = title;

  ensureMetaByName("description").setAttribute("content", descriptionText);
  ensureMetaByName("twitter:card").setAttribute("content", "summary_large_image");
  ensureMetaByName("twitter:title").setAttribute("content", title);
  ensureMetaByName("twitter:description").setAttribute("content", descriptionText);
  ensureMetaByName("twitter:image").setAttribute("content", DEFAULT_OG_IMAGE);

  ensureMetaByProperty("og:type").setAttribute("content", "website");
  ensureMetaByProperty("og:site_name").setAttribute("content", SITE_NAME);
  ensureMetaByProperty("og:title").setAttribute("content", title);
  ensureMetaByProperty("og:description").setAttribute("content", descriptionText);
  ensureMetaByProperty("og:url").setAttribute("content", url);
  ensureMetaByProperty("og:image").setAttribute("content", DEFAULT_OG_IMAGE);

  const canonical = ensureTag('link[rel="canonical"]', () => {
    const link = document.createElement("link");
    link.rel = "canonical";
    return link;
  });
  canonical.setAttribute("href", url);
}
