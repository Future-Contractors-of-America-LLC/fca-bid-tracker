import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const root = path.resolve("api_generated");
const files = fs.readdirSync(root)
  .filter((name) => name.endsWith('.js'))
  .filter((name) => name !== 'host.json' && name !== 'package.json');

let failed = 0;
for (const file of files) {
  const abs = path.join(root, file);
  try {
    await import(pathToFileURL(abs).href);
  } catch (err) {
    failed += 1;
    const msg = err && err.stack ? err.stack.split('\n').slice(0, 6).join('\n') : String(err);
    console.log(`FAIL ${file}`);
    console.log(msg);
    console.log('---');
  }
}

console.log(`TOTAL_FILES=${files.length}`);
console.log(`FAILED=${failed}`);
