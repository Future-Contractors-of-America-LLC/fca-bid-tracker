import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();
const apiRoot = path.join(repoRoot, 'api');
const outRoot = path.join(repoRoot, 'api_generated');

/** Flat files that should never be copied to deployment package. */
const EXCLUDED_FLAT_FILES = new Set([
  'host.json',
  'package.json',
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

function extractHttpConfig(source, fallbackRoute) {
  const methodsMatch = source.match(/methods\s*:\s*\[([^\]]+)\]/m);
  const routeMatch = source.match(/route\s*:\s*['"]([^'"]+)['"]/m);
  const authMatch = source.match(/authLevel\s*:\s*['"]([^'"]+)['"]/m);

  const methods = methodsMatch
    ? methodsMatch[1]
        .split(',')
        .map((token) => token.replace(/['"\s]/g, '').toLowerCase())
        .filter(Boolean)
    : ['get', 'post', 'put', 'patch', 'delete', 'options'];

  return {
    methods,
    route: routeMatch ? routeMatch[1] : fallbackRoute,
    authLevel: authMatch ? authMatch[1] : 'anonymous',
  };
}

function hasCentralProxyIndex(dirName) {
  const indexPath = path.join(apiRoot, dirName, 'index.js');
  if (!fs.existsSync(indexPath)) return false;
  const source = fs.readFileSync(indexPath, 'utf8');
  return source.includes('createCentralProxy') || source.includes('createCentralPathProxy');
}

function rewriteCanonicalFunctionScriptsForModulePackage(functionDir) {
  const functionJsonPath = path.join(functionDir, 'function.json');
  if (!fs.existsSync(functionJsonPath)) return;

  const functionJson = JSON.parse(fs.readFileSync(functionJsonPath, 'utf8'));
  let scriptFile = typeof functionJson.scriptFile === 'string' && functionJson.scriptFile.trim()
    ? functionJson.scriptFile.trim()
    : 'index.js';

  // Normalize script file path to avoid platform-specific separators.
  scriptFile = scriptFile.replace(/\\/g, '/');

  if (!scriptFile.toLowerCase().endsWith('.js')) {
    return;
  }

  const currentScriptPath = path.join(functionDir, scriptFile);
  if (!fs.existsSync(currentScriptPath)) {
    return;
  }

  // Keep canonical handlers as .js and force CommonJS semantics locally.
  const functionPackageJsonPath = path.join(functionDir, 'package.json');
  const functionPackageJson = fs.existsSync(functionPackageJsonPath)
    ? JSON.parse(fs.readFileSync(functionPackageJsonPath, 'utf8'))
    : {};
  functionPackageJson.type = 'commonjs';
  writeJson(functionPackageJsonPath, functionPackageJson);
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

  const generatedPackageJson = fs.existsSync(path.join(apiRoot, 'package.json'))
    ? JSON.parse(fs.readFileSync(path.join(apiRoot, 'package.json'), 'utf8'))
    : {
        name: 'fca-bid-tracker-api-generated',
        version: '1.0.0',
      };

  const libDir = path.join(apiRoot, '_lib');
  if (fs.existsSync(libDir)) {
    fs.cpSync(libDir, path.join(outRoot, '_lib'), { recursive: true });
  }

  const academyCatalogSource = path.join(repoRoot, 'src', 'academyCatalog.js');
  const academyCourseStandardsSource = path.join(repoRoot, 'src', 'academyCourseStandards.js');
  const virginiaCteCoursesSource = path.join(repoRoot, 'src', 'virginiaCteCourses.js');
  const cteExternalAlignmentSourcesSource = path.join(repoRoot, 'src', 'cteExternalAlignmentSources.js');
  const vdoeCteSourceManifestSource = path.join(repoRoot, 'src', 'vdoeCteSourceManifest.js');
  const entityInfoSource = path.join(repoRoot, 'src', 'legal', 'entityInfo.js');
  const generatedLibDir = path.join(outRoot, '_lib');
  ensureDir(generatedLibDir);
  if (fs.existsSync(academyCatalogSource)) {
    fs.copyFileSync(academyCatalogSource, path.join(generatedLibDir, 'academyCatalog.js'));
  }
  if (fs.existsSync(academyCourseStandardsSource)) {
    fs.copyFileSync(academyCourseStandardsSource, path.join(generatedLibDir, 'academyCourseStandards.js'));
  }
  if (fs.existsSync(virginiaCteCoursesSource)) {
    fs.copyFileSync(virginiaCteCoursesSource, path.join(generatedLibDir, 'virginiaCteCourses.js'));
  }
  if (fs.existsSync(cteExternalAlignmentSourcesSource)) {
    fs.copyFileSync(cteExternalAlignmentSourcesSource, path.join(generatedLibDir, 'cteExternalAlignmentSources.js'));
  }
  if (fs.existsSync(vdoeCteSourceManifestSource)) {
    fs.copyFileSync(vdoeCteSourceManifestSource, path.join(generatedLibDir, 'vdoeCteSourceManifest.js'));
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

  const shimmedCanonicalRoutes = new Set([
    'academy-lms',
    'auricrux',
    'diag-canary',
    'projects',
    'stripe-checkout',
  ]);

  for (const entry of apiEntries) {
    if (!entry.isDirectory()) continue;
    if (entry.name === '_lib') continue;
    if (shimmedCanonicalRoutes.has(entry.name)) continue;
    const functionJsonPath = path.join(apiRoot, entry.name, 'function.json');
    if (fs.existsSync(functionJsonPath)) {
      const generatedFunctionDir = path.join(outRoot, entry.name);
      fs.cpSync(path.join(apiRoot, entry.name), generatedFunctionDir, { recursive: true });
      rewriteCanonicalFunctionScriptsForModulePackage(generatedFunctionDir);
    }
  }

  const copiedFlatHandlers = [];

  for (const entry of apiEntries) {
    if (!entry.isFile()) continue;
    if (!entry.name.endsWith('.js')) continue;
    if (EXCLUDED_FLAT_FILES.has(entry.name)) continue;

    const baseName = entry.name.replace(/\.js$/i, '');

    // Canonical function directories take precedence when both styles exist.
    if (canonicalFunctionDirs.has(baseName)) continue;

    const flatSourcePath = path.join(apiRoot, entry.name);
    const generatedFlatPath = path.join(outRoot, entry.name);
    fs.copyFileSync(flatSourcePath, generatedFlatPath);
    copiedFlatHandlers.push(entry.name);
  }

  const bootstrapSource = copiedFlatHandlers
    .sort((a, b) => a.localeCompare(b))
    .map((fileName) => `import './${fileName}';`)
    .join('\n');

  fs.writeFileSync(path.join(outRoot, 'index.mjs'), `${bootstrapSource}\n`, 'utf8');

  // Force explicit flat handler bootstrap so v4 indexing does not depend on wildcard main behavior.
  generatedPackageJson.main = 'index.mjs';
  writeJson(path.join(outRoot, 'package.json'), generatedPackageJson);

  if (copiedFlatHandlers.length === 0) {
    console.warn('No flat handlers were copied into api_generated; only canonical function.json routes are available.');
  }

  console.log(`Prepared Azure Functions backend at api_generated (${canonicalFunctionDirs.size} central proxy routes).`);
}

main();
