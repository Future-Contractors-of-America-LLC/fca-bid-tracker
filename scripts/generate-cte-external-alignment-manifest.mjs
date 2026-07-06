import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { CTE_EXTERNAL_ALIGNMENT_MANIFEST } from "../src/cteExternalAlignmentSources.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outPath = path.join(root, "public", "config", "cte-external-alignment-sources.json");

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, `${JSON.stringify(CTE_EXTERNAL_ALIGNMENT_MANIFEST, null, 2)}\n`, "utf8");

console.log(`Generated ${path.relative(root, outPath)} with ${CTE_EXTERNAL_ALIGNMENT_MANIFEST.sources.length} reference-only alignment sources.`);