export const publicPackageRouteGroups = [
  {
    key: "saas-workspace",
    title: "FCA SaaS Workspace",
    detail: "Real contractor workflow routes for qualification, estimating, project delivery, files, billing, and operations.",
    routes: [
      { href: "/portal/bids", label: "Qualification Board" },
      { href: "/portal/pipeline", label: "Commercial Pipeline" },
      { href: "/portal/leads", label: "Lead Intelligence" },
      { href: "/portal/estimates", label: "Estimate Workspace" },
      { href: "/portal/projects", label: "Project Flow" },
      { href: "/portal/files", label: "File Spine" },
      { href: "/portal/design", label: "Design Workspace" },
      { href: "/portal/billing", label: "Billing Command" },
      { href: "/portal/pipeline", label: "Commercial Pipeline" },
      { href: "/portal/legal", label: "Contractor Legal Command" }
    ]
  },
  {
    key: "legal-compliance",
    title: "Legal & Compliance",
    detail: "Public trust policies and contractor legal workspace for entity formation, agreements, lien waivers, and Virginia DPOR alignment.",
    routes: [
      { href: "/legal", label: "Legal Center" },
      { href: "/legal/contractor-resources", label: "Contractor Legal Resources" },
      { href: "/portal/legal", label: "Portal Legal Command" },
      { href: "/privacy", label: "Privacy Policy" }
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
      { href: "/academy/programs/contractor-business-formation-legal/modules/1", label: "Business Formation Legal" },
      { href: "/academy/programs/contractor-construction-law-essentials/modules/1", label: "Construction Law Essentials" },
      { href: "/academy/programs/virginia-dpor-residential-license-prep/modules/1", label: "Virginia DPOR Prep" },
      { href: "/academy/programs/osha30-certification-prep/modules/1", label: "OSHA 30 Prep" },
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
