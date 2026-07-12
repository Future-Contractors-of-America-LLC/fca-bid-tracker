import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

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

const repoRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const packet = readContinuityPacket(repoRoot)
const generatedDir = path.join(repoRoot, 'generated')
fs.mkdirSync(generatedDir, { recursive: true })

const witness = readJson(path.join(repoRoot, 'docs', 'runtime-proof', 'live-deployment', 'live_deployment_ci_run_witness.json'))
const failures = []
if (!witness) failures.push('missing live_deployment_ci_run_witness.json')
if (witness && witness.provenance !== 'github_actions_ci') failures.push('witness provenance is not github_actions_ci')
if (witness && witness.ciPersisted !== true) failures.push('witness ciPersisted is not true')
if (witness && !witness.ciRunId) failures.push('witness ciRunId missing')
if (witness && !witness.ciCommitSha) failures.push('witness ciCommitSha missing')

const result = {
  packet,
  generatedAt: new Date().toISOString(),
  success: failures.length === 0,
  failures,
}

fs.writeFileSync(path.join(generatedDir, 'live-deployment-run-witness-validation.json'), JSON.stringify(result, null, 2))
fs.writeFileSync(
  path.join(generatedDir, 'live-deployment-run-witness-validation.md'),
  [
    '# Live Deployment Run Witness Validation',
    '',
    `- Packet: ${packet}`,
    `- Generated: ${result.generatedAt}`,
    `- success: ${result.success}`,
    '',
    '## Failures',
    ...(failures.length ? failures.map((item) => `- ${item}`) : ['- none']),
    '',
  ].join('\n'),
)

if (failures.length > 0) {
  console.error('Live deployment run witness validation failed.')
  process.exit(1)
}

console.log(`Live deployment run witness validation passed for packet ${packet}.`)
