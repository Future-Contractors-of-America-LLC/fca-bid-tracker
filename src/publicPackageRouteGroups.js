export const publicPackageRouteGroups = [
  {
    key: "saas-workspace",
    title: "FCA SaaS Workspace",
    detail: "Real contractor workflow routes for qualification, estimating, project delivery, files, billing, and operations.",
    routes: [
      { href: "/portal/bids", label: "Qualification Board" },
      { href: "/portal/pipeline", label: "Commercial Pipeline" },
      { href: "/portal/estimates", label: "Estimate Workspace" },
      { href: "/portal/projects", label: "Project Flow" },
      { href: "/portal/files", label: "File Spine" },
      { href: "/portal/design", label: "Design Workspace" },
      { href: "/portal/billing", label: "Billing Command" },
      { href: "/portal/operations", label: "Operations Pipeline" }
    ]
  },
  {
    key: "customer-portal",
    title: "Customer Portal",
    detail: "Tenant-branded customer visibility for workspace entry, projects, files, messages, and notifications.",
    routes: [
      { href: "/portal", label: "Portal Home" },
      { href: "/portal/projects", label: "Project Visibility" },
      { href: "/portal/files", label: "Customer Files" },
      { href: "/portal/messages", label: "Customer Messages" },
      { href: "/portal/notifications", label: "Notifications" }
    ]
  },
  {
    key: "academy-lms",
    title: "Academy / LMS",
    detail: "Operationally linked Academy routes for classroom entry, catalog access, and portal-connected training continuity.",
    routes: [
      { href: "/academy", label: "Academy Home" },
      { href: "/academy/catalog", label: "Academy Catalog" },
      { href: "/academy/programs", label: "Program lessons" },
      { href: "/portal/academy", label: "Portal Academy" }
    ]
  },
  {
    key: "auricrux-comms",
    title: "Auricrux + Comms",
    detail: "Auricrux guidance and routed communications surfaces attached to live customer and operator work.",
    routes: [
      { href: "/portal/auricrux", label: "Auricrux Workspace" },
      { href: "/portal/messages", label: "Messages" },
      { href: "/portal/support", label: "Support Command" },
      { href: "/portal/admin", label: "Admin Controls" }
    ]
  },
  {
    key: "lifecycle-revenue-continuity",
    title: "Lifecycle Revenue Continuity",
    detail: "Revenue, retention, and post-handover routes that keep billing, warranty, support, and referrals attached to delivery.",
    routes: [
      { href: "/portal/billing", label: "Billing Continuity" },
      { href: "/warranty", label: "Warranty Continuity" },
      { href: "/referrals", label: "Referral Continuity" },
      { href: "/portal/support", label: "Support Recovery" }
    ]
  }
];
