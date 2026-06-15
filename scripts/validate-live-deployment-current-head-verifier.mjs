import fs from 'fs'
import path from 'path'

function readJson(file) {
  if (!fs.existsSync(file)) return null
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'))
  } catch {
    return null
  }
}

function readContinuityPacket(repoRoot) {
  const ledgerPath = path.join(repoRoot, 'docs', 'FCA_EXECUTION_CONTINUITY_LEDGER.md')
  const fallbackPacket = 'UNLOCKED'
  if (!fs.existsSync(ledgerPath)) return fallbackPacket
  const ledger = fs.readFileSync(ledgerPath, 'utf8')
  const match = ledger.match(/- Active packet: `([^`]+)`/)
  return match ? match[1] : fallbackPacket
}

const repoRoot = path.join(path.dirname(new URL(import.meta.url).pathname), '..')
const packet = readContinuityPacket(repoRoot)
const generatedDir = path.join(repoRoot, 'generated')
fs.mkdirSync(generatedDir, { recursive: true })

const summary = readJson(path.join(repoRoot, 'docs', 'runtime-proof', 'live-deployment', 'live_deployment_smoke_summary.json'))
const failuresFile = path.join(repoRoot, 'docs', 'runtime-proof', 'live-deployment', 'live_deployment_smoke_failures.txt')
const failuresText = fs.existsSync(failuresFile) ? fs.readFileSync(failuresFile, 'utf8').trim() : ''

const failures = []
if (!summary || !Array.isArray(summary) || summary.length === 0) failures.push('live deployment smoke summary missing or empty')
if (summary && Array.isArray(summary)) {
  const hostFailures = summary.flatMap((entry) => Array.isArray(entry.failures) ? entry.failures : [])
  if (hostFailures.length > 0) failures.push('current-head live verifier summary still contains host-level failures')
  const staleGitSha = summary.some((entry) => entry.deploymentGitSha === 'pending-build' || entry.runtimeGitSha === 'pending-build')
  if (staleGitSha) failures.push('current-head live verifier summary still shows pending-build SHA state')
}
if (failuresText.length > 0) failures.push('live deployment failures file is non-empty')

const result = {
  packet,
  generatedAt: new Date().toISOString(),
  summaryPresent: Boolean(summary),
  failureFileEmpty: failuresText.length === 0,
  hostCount: Array.isArray(summary) ? summary.length : 0,
  success: failures.length === 0,
  failures,
}

fs.writeFileSync(path.join(generatedDir, 'live-deployment-current-head-verifier-validation.json'), JSON.stringify(result, null, 2))
fs.writeFileSync(
  path.join(generatedDir, 'live-deployment-current-head-verifier-validation.md'),
  [
    '# Live Deployment Current-Head Verifier Validation',
    '',
    `- Packet: ${packet}`,
    `- Generated: ${result.generatedAt}`,
    `- summaryPresent: ${result.summaryPresent}`,
    `- failureFileEmpty: ${result.failureFileEmpty}`,
    `- hostCount: ${result.hostCount}`,
    `- success: ${result.success}`,
    '',
    '## Failures',
    ...(failures.length ? failures.map((item) => `- ${item}`) : ['- none']),
    '',
  ].join('\n'),
)

if (failures.length > 0) {
  console.error('Current-head live verifier remains unverified.')
  process.exit(1)
}

console.log(`Current-head live verifier validated for packet ${packet}.`)
