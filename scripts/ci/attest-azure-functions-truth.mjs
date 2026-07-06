#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

function env(name, fallback = '') {
  const value = process.env[name];
  return (value ?? fallback).trim();
}

function fail(message) {
  throw new Error(message);
}

function runAz(args) {
  const result = spawnSync('az', args, {
    encoding: 'utf8',
    maxBuffer: 16 * 1024 * 1024,
    shell: process.platform === 'win32',
  });
  if (result.error) {
    throw new Error(`az ${args.join(' ')} failed: ${result.error.message}`);
  }
  if (result.status !== 0) {
    throw new Error(`az ${args.join(' ')} failed: ${result.stderr || result.stdout}`);
  }
  return result.stdout;
}

function sha256Buffer(buffer) {
  return createHash('sha256').update(buffer).digest('hex');
}

async function sha256File(filePath) {
  const data = await readFile(filePath);
  return sha256Buffer(data);
}

async function loadJson(filePath) {
  const data = await readFile(filePath, 'utf8');
  return JSON.parse(data);
}

function parsePublishingProfile(xml) {
  const profileRegex = /<publishProfile\s+[^>]*publishMethod="ZipDeploy"[^>]*>/i;
  const match = xml.match(profileRegex) || xml.match(/<publishProfile\s+[^>]*publishMethod="MSDeploy"[^>]*>/i);
  if (!match) {
    fail('Could not find a publishing profile in Azure response.');
  }

  const fragment = match[0];
  const username = (fragment.match(/userName="([^"]+)"/i) || [])[1];
  const password = (fragment.match(/userPWD="([^"]+)"/i) || [])[1];
  const publishUrl = (fragment.match(/publishUrl="([^"]+)"/i) || [])[1];

  if (!username || !password || !publishUrl) {
    fail('Publishing profile is missing userName, userPWD, or publishUrl.');
  }

  const scmHost = publishUrl.split(':')[0];
  return {
    username,
    password,
    scmBaseUrl: `https://${scmHost}`,
  };
}

function getPublishingProfile(resourceGroup, functionAppName) {
  try {
    const credsRaw = runAz([
      'webapp',
      'deployment',
      'list-publishing-credentials',
      '--resource-group',
      resourceGroup,
      '--name',
      functionAppName,
      '--output',
      'json',
    ]);
    const creds = JSON.parse(credsRaw);
    const username = String(creds?.publishingUserName || '').trim();
    const password = String(creds?.publishingPassword || '').trim();
    const scmUri = String(creds?.scmUri || '').trim();
    if (username && password && scmUri) {
      const scmHost = scmUri.replace(/^https?:\/\//i, '').split('@').pop();
      if (scmHost) {
        return {
          username,
          password,
          scmBaseUrl: `https://${scmHost}`,
        };
      }
    }
  } catch {
    // Fall back to XML publishing profile parsing below.
  }

  const xml = runAz([
    'functionapp',
    'deployment',
    'list-publishing-profiles',
    '--resource-group',
    resourceGroup,
    '--name',
    functionAppName,
    '--xml',
  ]);
  return parsePublishingProfile(xml);
}

function normalizeMethods(methods) {
  return [...new Set((methods || []).map((m) => String(m).toUpperCase()))].sort();
}

async function fetchKuduFile(profile, relativePath) {
  const encodedPath = relativePath
    .split('/')
    .filter(Boolean)
    .map((part) => encodeURIComponent(part))
    .join('/');

  const url = `${profile.scmBaseUrl}/api/vfs/site/wwwroot/${encodedPath}`;
  const basic = Buffer.from(`${profile.username}:${profile.password}`).toString('base64');

  const response = await fetch(url, {
    headers: {
      Authorization: `Basic ${basic}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Kudu fetch failed for ${relativePath}: HTTP ${response.status}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

function parseCriticalFiles() {
  const raw = env('CRITICAL_FILES');
  if (!raw) {
    return [
      'index.mjs',
      'admin-payroll-profile.js',
      'admin-payroll-directory.js',
      'admin-students.js',
      'internal-company-profile.js',
      'internal-employee-directory.js',
      'internal-record-audit.js',
      'internal-admin-ping-v4.js',
    ];
  }

  return raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

async function getActualRoutes(resourceGroup, functionAppName) {
  const stdout = runAz([
    'functionapp',
    'function',
    'list',
    '--resource-group',
    resourceGroup,
    '--name',
    functionAppName,
    '--output',
    'json',
  ]);

  const rows = JSON.parse(stdout);
  const result = [];

  for (const row of rows) {
    const bindings = row?.config?.bindings || [];
    const httpTrigger = bindings.find((b) => String(b?.type || '').toLowerCase() === 'httptrigger');
    if (!httpTrigger) continue;
    result.push({
      name: row.name,
      route: httpTrigger.route || '',
      methods: normalizeMethods(httpTrigger.methods || []),
    });
  }

  return result;
}

async function runIntentChecks(intentChecks, baseUrl) {
  const checks = [];

  for (const entry of intentChecks) {
    const method = String(entry.method || 'GET').toUpperCase();
    const url = `${baseUrl.replace(/\/$/, '')}${entry.path}`;
    const headers = Object.assign({ Accept: 'application/json' }, entry.headers || {});
    const body = entry.body ? JSON.stringify(entry.body) : undefined;

    let status;
    let ok;
    let error = null;

    try {
      const response = await fetch(url, { method, headers, body });
      status = response.status;
      ok = (entry.allowedStatus || []).includes(status);
    } catch (err) {
      status = null;
      ok = false;
      error = err instanceof Error ? err.message : String(err);
    }

    checks.push({
      name: entry.name,
      method,
      path: entry.path,
      allowedStatus: entry.allowedStatus || [],
      status,
      ok,
      error,
    });
  }

  return checks;
}

function renderMarkdown(report) {
  const lines = [];
  lines.push('# Azure Functions Truth Gate Attestation');
  lines.push('');
  lines.push(`- Overall: ${report.overallPass ? 'PASS' : 'FAIL'}`);
  lines.push(`- Function App: ${report.context.functionAppName}`);
  lines.push(`- Resource Group: ${report.context.resourceGroup}`);
  lines.push(`- Base URL: ${report.context.baseUrl}`);
  lines.push(`- Latest Deployment ID: ${report.context.latestDeploymentId || 'n/a'}`);
  lines.push('');

  lines.push('## Immutable Package Attestation');
  lines.push(`- WEBSITE_RUN_FROM_PACKAGE=${report.immutablePackageAttestation.settingValue || '(empty)'}`);
  lines.push(`- Result: ${report.immutablePackageAttestation.pass ? 'PASS' : 'FAIL'}`);
  lines.push('');

  lines.push('## Artifact vs Live File Attestation');
  for (const row of report.fileAttestation) {
    lines.push(`- ${row.path}: ${row.match ? 'PASS' : 'FAIL'} (local ${row.localHash}, live ${row.liveHash || 'n/a'})`);
  }
  lines.push('');

  lines.push('## Route Manifest Attestation');
  if (report.routeAttestation.missing.length === 0 && report.routeAttestation.methodMismatch.length === 0) {
    lines.push('- PASS: expected routes are present with expected methods.');
  } else {
    for (const row of report.routeAttestation.missing) {
      lines.push(`- FAIL missing route: ${row.route} [${row.methods.join(', ')}]`);
    }
    for (const row of report.routeAttestation.methodMismatch) {
      lines.push(`- FAIL method mismatch: ${row.route} expected [${row.expected.join(', ')}], actual [${row.actual.join(', ')}]`);
    }
  }
  lines.push('');

  lines.push('## Intent Checks');
  for (const row of report.intentChecks) {
    lines.push(`- ${row.name}: ${row.ok ? 'PASS' : 'FAIL'} (${row.method} ${row.path}, status=${row.status ?? 'ERR'})`);
  }

  return `${lines.join('\n')}\n`;
}

async function main() {
  const resourceGroup = env('AZURE_RESOURCE_GROUP');
  const functionAppName = env('AZURE_FUNCTION_APP');
  const artifactDir = env('ARTIFACT_DIR', path.resolve('api_generated'));
  const expectedRoutesFile = env('EXPECTED_ROUTES_FILE', path.resolve('docs/runtime-proof/truth-gate/expected-routes.json'));
  const intentChecksFile = env('INTENT_CHECKS_FILE', path.resolve('docs/runtime-proof/truth-gate/intent-checks.json'));
  const baseUrl = env('FCA_API_BASE', 'https://auricrux-central.azurewebsites.net');

  if (!resourceGroup || !functionAppName) {
    fail('AZURE_RESOURCE_GROUP and AZURE_FUNCTION_APP are required.');
  }

  const expectedRoutes = await loadJson(expectedRoutesFile);
  const intentChecks = await loadJson(intentChecksFile);
  const criticalFiles = parseCriticalFiles();

  const appSettingsRaw = runAz([
    'functionapp',
    'config',
    'appsettings',
    'list',
    '--resource-group',
    resourceGroup,
    '--name',
    functionAppName,
    '--output',
    'json',
  ]);
  const appSettings = JSON.parse(appSettingsRaw);
  const appSettingsMap = new Map(appSettings.map((s) => [String(s.name || ''), String(s.value || '')]));
  const runFromPackageValue = (appSettingsMap.get('WEBSITE_RUN_FROM_PACKAGE') || '').trim().toLowerCase();
  const runFromPackagePass = ['1', 'true'].includes(runFromPackageValue);

  let latestDeployment = null;
  try {
    const deploymentListRaw = runAz([
      'webapp',
      'deployment',
      'list',
      '--resource-group',
      resourceGroup,
      '--name',
      functionAppName,
      '--output',
      'json',
    ]);
    const deployments = JSON.parse(deploymentListRaw);
    latestDeployment = Array.isArray(deployments) && deployments.length > 0 ? deployments[0] : null;
  } catch {
    latestDeployment = null;
  }

  const publishingProfile = getPublishingProfile(resourceGroup, functionAppName);

  const fileAttestation = [];
  let filesPass = true;
  for (const relPath of criticalFiles) {
    const localPath = path.join(artifactDir, relPath);
    let localHash = null;
    let liveHash = null;
    let error = null;

    try {
      localHash = await sha256File(localPath);
    } catch (err) {
      error = `Local file read failed: ${err instanceof Error ? err.message : String(err)}`;
    }

    if (!error) {
      try {
        const liveBuffer = await fetchKuduFile(publishingProfile, relPath);
        liveHash = sha256Buffer(liveBuffer);
      } catch (err) {
        error = `Live file fetch failed: ${err instanceof Error ? err.message : String(err)}`;
      }
    }

    const match = !error && localHash === liveHash;
    fileAttestation.push({ path: relPath, localHash, liveHash, match, error });
    if (!match) filesPass = false;
  }

  const actualRoutes = await getActualRoutes(resourceGroup, functionAppName);
  const routeByPath = new Map(actualRoutes.map((r) => [r.route, r]));

  const missing = [];
  const methodMismatch = [];
  for (const expected of expectedRoutes) {
    const route = routeByPath.get(expected.route);
    const expectedMethods = normalizeMethods(expected.methods || []);
    if (!route) {
      missing.push({ route: expected.route, methods: expectedMethods });
      continue;
    }

    const actualMethods = normalizeMethods(route.methods || []);
    const bad = expectedMethods.some((m) => !actualMethods.includes(m));
    if (bad) {
      methodMismatch.push({ route: expected.route, expected: expectedMethods, actual: actualMethods });
    }
  }

  const routesPass = missing.length === 0 && methodMismatch.length === 0;
  const intentResults = await runIntentChecks(intentChecks, baseUrl);
  const intentsPass = intentResults.every((r) => r.ok);

  const report = {
    generatedAt: new Date().toISOString(),
    context: {
      resourceGroup,
      functionAppName,
      baseUrl,
      artifactDir,
      expectedRoutesFile,
      intentChecksFile,
      criticalFiles,
      runFromPackageValue,
      latestDeploymentId: latestDeployment?.id || null,
    },
    immutablePackageAttestation: {
      pass: runFromPackagePass,
      settingName: 'WEBSITE_RUN_FROM_PACKAGE',
      settingValue: runFromPackageValue,
    },
    fileAttestation,
    routeAttestation: {
      expectedCount: expectedRoutes.length,
      actualCount: actualRoutes.length,
      missing,
      methodMismatch,
    },
    intentChecks: intentResults,
    overallPass: runFromPackagePass && filesPass && routesPass && intentsPass,
  };

  const outDir = path.resolve('generated/truth-gate');
  await mkdir(outDir, { recursive: true });
  const jsonPath = path.join(outDir, 'attestation.json');
  const mdPath = path.join(outDir, 'attestation.md');
  await writeFile(jsonPath, JSON.stringify(report, null, 2));
  await writeFile(mdPath, renderMarkdown(report));

  console.log(`Truth gate report written: ${jsonPath}`);
  console.log(`Truth gate report written: ${mdPath}`);

  if (!report.overallPass) {
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error(err instanceof Error ? err.stack : err);
  process.exitCode = 1;
});
