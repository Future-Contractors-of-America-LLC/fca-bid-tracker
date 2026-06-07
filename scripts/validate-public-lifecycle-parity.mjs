import fs from "fs";
import path from "path";

const root = process.cwd();

const expectedPublicRoutes = [
  "/",
  "/platform",
  "/auricrux",
  "/warranty",
  "/referrals",
  "/pricing",
  "/contact",
  "/login",
  "/academy",
];

const routesSource = fs.readFileSync(path.join(root, "src", "routes.js"), "utf8");
const metadataSource = fs.readFileSync(path.join(root, "src", "siteMetadata.js"), "utf8");
const sitemapSource = fs.readFileSync(path.join(root, "public", "sitemap.xml"), "utf8");
const shellSource = fs.readFileSync(path.join(root, "src", "websiteShell.js"), "utf8");

const failures = [];

for (const route of expectedPublicRoutes) {
  if (!routesSource.includes(`"${route}"`) && !routesSource.includes(`'${route}'`)) {
    failures.push(`src/routes.js is missing public lifecycle route: ${route}`);
  }

  if (!metadataSource.includes(`"${route}"`) && !metadataSource.includes(`'${route}'`)) {
    failures.push(`src/siteMetadata.js is missing metadata entry for public lifecycle route: ${route}`);
  }

  const sitemapLoc = `<loc>https://futurecontractorsofamerica.com${route === "/" ? "/" : route}</loc>`;
  if (!sitemapSource.includes(sitemapLoc)) {
    failures.push(`public/sitemap.xml is missing lifecycle route: ${route}`);
  }
}

const shellMarkers = [
  "publicActionCatalog.warranty",
  "publicActionCatalog.referrals",
  'href: "/warranty"',
  'href: "/referrals"',
  'label: "Warranty"',
  'label: "Referrals"',
];

for (const marker of shellMarkers) {
  if (!shellSource.includes(marker)) {
    failures.push(`src/websiteShell.js is missing lifecycle navigation marker: ${marker}`);
  }
}

if (failures.length > 0) {
  console.error("Public lifecycle parity validation failed:");
  for (const failure of failures) {
    console.error(` - ${failure}`);
  }
  process.exit(1);
}

console.log("Public lifecycle parity validation passed for routes, metadata, sitemap coverage, and shell navigation continuity.");
