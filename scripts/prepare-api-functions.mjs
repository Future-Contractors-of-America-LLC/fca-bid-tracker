import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();
const apiRoot = path.join(repoRoot, 'api');
const outRoot = path.join(repoRoot, 'api_generated');

function rmrf(target) {
  fs.rmSync(target, { recursive: true, force: true });
}

function ensureDir(target) {
  fs.mkdirSync(target, { recursive: true });
}

function copyIfExists(from, to) {
  if (fs.existsSync(from)) {
    fs.copyFileSync(from, to);
    return true;
  }
  return false;
}

function writeJson(filePath, value) {
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function createFunctionWrapper(functionName, sourceFileName) {
  return `module.exports = async function (context, req) {\n  const handler = require('../${sourceFileName}');\n  const result = await handler(context, req);\n\n  if (!context.res && result && typeof result === 'object' && ('status' in result || 'body' in result || 'headers' in result)) {\n    context.res = result;\n    return;\n  }\n\n  if (!context.res && typeof result !== 'undefined') {\n    context.res = {\n      status: 200,\n      headers: { 'Content-Type': 'application/json; charset=utf-8' },\n      body: result\n    };\n    return;\n  }\n\n  if (!context.res) {\n    context.res = {\n      status: 204\n    };\n  }\n};\n`;
}

function main() {
  if (!fs.existsSync(apiRoot)) {
    throw new Error(`Missing api directory at ${apiRoot}`);
  }

  rmrf(outRoot);
  ensureDir(outRoot);

  // Base files expected by Azure Functions runtime.
  const hasHost = copyIfExists(path.join(apiRoot, 'host.json'), path.join(outRoot, 'host.json'));
  if (!hasHost) {
    writeJson(path.join(outRoot, 'host.json'), { version: '2.0' });
  }

  const hasPackage = copyIfExists(path.join(apiRoot, 'package.json'), path.join(outRoot, 'package.json'));
  if (!hasPackage) {
    writeJson(path.join(outRoot, 'package.json'), { name: 'fca-bid-tracker-api-generated', version: '1.0.0' });
  }

  const libDir = path.join(apiRoot, '_lib');
  if (fs.existsSync(libDir) && fs.statSync(libDir).isDirectory()) {
    fs.cpSync(libDir, path.join(outRoot, '_lib'), { recursive: true });
  }

  const apiEntries = fs.readdirSync(apiRoot, { withFileTypes: true });
  const existingFunctionDirs = new Set(
    apiEntries
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
  );

  // Copy canonical function directories as-is.
  for (const entry of apiEntries) {
    if (!entry.isDirectory()) continue;
    if (entry.name === '_lib') continue;
    const sourceDir = path.join(apiRoot, entry.name);
    const functionJsonPath = path.join(sourceDir, 'function.json');
    if (fs.existsSync(functionJsonPath)) {
      fs.cpSync(sourceDir, path.join(outRoot, entry.name), { recursive: true });
    }
  }

  // Convert flat *.js handlers into function folders so backend changes are actually deployable.
  for (const entry of apiEntries) {
    if (!entry.isFile()) continue;
    if (!entry.name.endsWith('.js')) continue;

    const base = entry.name.slice(0, -3);
    if (existingFunctionDirs.has(base)) {
      // Directory function takes precedence; keep flat file for shared imports.
      copyIfExists(path.join(apiRoot, entry.name), path.join(outRoot, entry.name));
      continue;
    }

    const fnDir = path.join(outRoot, base);
    ensureDir(fnDir);

    fs.writeFileSync(path.join(fnDir, 'index.js'), createFunctionWrapper(base, entry.name), 'utf8');
    writeJson(path.join(fnDir, 'function.json'), {
      bindings: [
        {
          authLevel: 'anonymous',
          type: 'httpTrigger',
          direction: 'in',
          name: 'req',
          methods: ['get', 'post', 'put', 'patch', 'delete', 'options']
        },
        {
          type: 'http',
          direction: 'out',
          name: 'res'
        }
      ]
    });

    // Keep original handler available for wrapper require('../handler.js').
    copyIfExists(path.join(apiRoot, entry.name), path.join(outRoot, entry.name));
  }

  console.log('Prepared Azure Functions backend at api_generated');
}

main();
