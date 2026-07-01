import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();
const apiRoot = path.join(repoRoot, 'api');
const outRoot = path.join(repoRoot, 'api_generated');

/** Flat legacy handlers — kept for imports only, never deployed as HTTP functions. */
const LEGACY_FLAT_ONLY = new Set([
  'leads-store.js',
  'remediation-store.js',
  'customer-account-store.js',
  'academy-store.js',
]);

function rmrf(target) {
  fs.rmSync(target, { recursive: true, force: true });
}

function ensureDir(target) {
  fs.mkdirSync(target, { recursive: true });
}

function writeJson(filePath, value) {
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function hasCentralProxyIndex(dirName) {
  const indexPath = path.join(apiRoot, dirName, 'index.js');
  if (!fs.existsSync(indexPath)) return false;
  const source = fs.readFileSync(indexPath, 'utf8');
  return source.includes('createCentralProxy') || source.includes('createCentralPathProxy');
}

function main() {
  if (!fs.existsSync(apiRoot)) {
    throw new Error(`Missing api directory at ${apiRoot}`);
  }

  rmrf(outRoot);
  ensureDir(outRoot);

  const hasHost = fs.existsSync(path.join(apiRoot, 'host.json'));
  if (hasHost) {
    fs.copyFileSync(path.join(apiRoot, 'host.json'), path.join(outRoot, 'host.json'));
  } else {
    writeJson(path.join(outRoot, 'host.json'), { version: '2.0' });
  }

  if (fs.existsSync(path.join(apiRoot, 'package.json'))) {
    fs.copyFileSync(path.join(apiRoot, 'package.json'), path.join(outRoot, 'package.json'));
  } else {
    writeJson(path.join(outRoot, 'package.json'), { name: 'fca-bid-tracker-api-generated', version: '1.0.0' });
  }

  const libDir = path.join(apiRoot, '_lib');
  if (fs.existsSync(libDir)) {
    fs.cpSync(libDir, path.join(outRoot, '_lib'), { recursive: true });
  }

  const academyCatalogSource = path.join(repoRoot, 'src', 'academyCatalog.js');
  const entityInfoSource = path.join(repoRoot, 'src', 'legal', 'entityInfo.js');
  const generatedLibDir = path.join(outRoot, '_lib');
  ensureDir(generatedLibDir);
  if (fs.existsSync(academyCatalogSource)) {
    fs.copyFileSync(academyCatalogSource, path.join(generatedLibDir, 'academyCatalog.js'));
  }
  if (fs.existsSync(entityInfoSource)) {
    const apiEntityInfo = `/** API copy of src/legal/entityInfo.js */\n${fs.readFileSync(entityInfoSource, 'utf8')}`;
    fs.writeFileSync(path.join(generatedLibDir, 'entityInfo.js'), apiEntityInfo, 'utf8');
  }

  const apiEntries = fs.readdirSync(apiRoot, { withFileTypes: true });

  const canonicalFunctionDirs = new Set(
    apiEntries
      .filter((entry) => entry.isDirectory())
      .filter((entry) => fs.existsSync(path.join(apiRoot, entry.name, 'function.json')))
      .map((entry) => entry.name),
  );

  for (const entry of apiEntries) {
    if (!entry.isDirectory()) continue;
    if (entry.name === '_lib') continue;
    const functionJsonPath = path.join(apiRoot, entry.name, 'function.json');
    if (fs.existsSync(functionJsonPath)) {
      fs.cpSync(path.join(apiRoot, entry.name), path.join(outRoot, entry.name), { recursive: true });
    }
  }

  for (const entry of apiEntries) {
    if (!entry.isFile()) continue;
    if (!entry.name.endsWith('.js')) continue;
    if (LEGACY_FLAT_ONLY.has(entry.name)) {
      fs.copyFileSync(path.join(apiRoot, entry.name), path.join(outRoot, entry.name));
    }
  }

  console.log(`Prepared Azure Functions backend at api_generated (${canonicalFunctionDirs.size} central proxy routes).`);
}

main();
