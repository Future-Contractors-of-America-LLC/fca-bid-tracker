import fs from "fs/promises";
import path from "path";

const root = process.cwd();

const checks = [
  {
    file: path.join(root, "src", "systemState.js"),
    markers: [
      "export const auricruxCommsChannels = [",
      'label: "Chat"',
      'label: "SMS"',
      'label: "Phone"',
      'label: "Email"',
      'label: "Teams"',
      'label: "Conference"',
      'label: "Lecture"',
    ],
  },
  {
    file: path.join(root, "src", "components", "AuricruxCommsPanel.jsx"),
    markers: [
      "Auricrux Comms",
      "Open Comms Workspace",
      "items.map((item) => (",
    ],
  },
  {
    file: path.join(root, "src", "pages", "website", "Contact.jsx"),
    markers: [
      'import AuricruxCommsPanel from "../../components/AuricruxCommsPanel";',
      "founder-demo channels active",
      "communications stack",
    ],
  },
  {
    file: path.join(root, "src", "pages", "portal", "PortalMessages.jsx"),
    markers: [
      'import AuricruxCommsPanel from "../../components/AuricruxCommsPanel";',
      "Unified coordination active",
      "every external and internal follow-through lane",
    ],
  },
  {
    file: path.join(root, "src", "pages", "portal", "PortalSupport.jsx"),
    markers: [
      'import AuricruxCommsPanel from "../../components/AuricruxCommsPanel";',
      "Escalation lanes connected",
      "full Auricrux communications stack",
    ],
  },
  {
    file: path.join(root, "src", "pages", "portal", "PortalAuricrux.jsx"),
    markers: [
      'import AuricruxCommsPanel from "../../components/AuricruxCommsPanel";',
      "Cross-channel orchestration active",
      "live Auricrux guidance + comms orchestration",
    ],
  },
  {
    file: path.join(root, "src", "pages", "academy", "AcademyHome.jsx"),
    markers: [
      'import AuricruxCommsPanel from "../../components/AuricruxCommsPanel";',
      "Rollout channels connected",
      "full Auricrux communications stack",
    ],
  },
];

const failures = [];

for (const check of checks) {
  const source = await fs.readFile(check.file, "utf8");
  for (const marker of check.markers) {
    if (!source.includes(marker)) {
      failures.push(`${path.basename(check.file)} is missing Auricrux comms marker: ${marker}`);
    }
  }
}

if (failures.length > 0) {
  console.error("Auricrux comms surface validation failed:");
  for (const failure of failures) {
    console.error(` - ${failure}`);
  }
  process.exit(1);
}

console.log("Auricrux comms surface validation passed across website, portal, academy, and system state layers.");
