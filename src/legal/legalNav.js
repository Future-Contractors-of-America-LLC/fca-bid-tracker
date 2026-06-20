/** Public legal pages - keep in sync with docs/legal/enterprise/ */
export const LEGAL_PAGES = [
  { href: "/legal", label: "Legal Center" },
  { href: "/legal/contractor-resources", label: "Contractor Legal Resources" },
  { href: "/terms", label: "Terms of Service" },
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/cookies", label: "Cookie Policy" },
  { href: "/acceptable-use", label: "Acceptable Use" },
  { href: "/security", label: "Security" },
  { href: "/subprocessors", label: "Subprocessors" },
  { href: "/ai-policy", label: "AI Data Use" },
  { href: "/accessibility", label: "Accessibility" },
  { href: "/dmca", label: "DMCA" },
  { href: "/refunds", label: "Refunds & Billing" },
  { href: "/ip", label: "Intellectual Property" },
];

export const LEGAL_FOOTER_PAGES = LEGAL_PAGES.filter((p) => p.href !== "/legal");

export const ENTERPRISE_DOCS = [
  { label: "Master Services Agreement", path: "docs/legal/enterprise/MASTER_SERVICES_AGREEMENT.md" },
  { label: "Data Processing Agreement", path: "docs/legal/enterprise/DATA_PROCESSING_AGREEMENT.md" },
  { label: "Service Level Agreement", path: "docs/legal/enterprise/SERVICE_LEVEL_AGREEMENT.md" },
];
