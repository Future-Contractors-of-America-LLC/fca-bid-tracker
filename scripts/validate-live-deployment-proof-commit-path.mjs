import fs from 'fs'
import path from 'path'

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
const workflowPath = path.join(repoRoot, '.github', 'workflows', 'live-deployment-proof-stamp.yml')
const source = fs.readFileSync(workflowPath, 'utf8')

const checks = {
  emitsRunWitness: source.includes('node scripts/emit-live-deployment-run-witness.mjs'),
  validatesRunWitness: source.includes('node scripts/validate-live-deployment-run-witness.mjs'),
  commitsWitnessJson: source.includes('docs/runtime-proof/live-deployment generated/live-deployment-proof-surface-validation.json') && source.includes('live-deployment-run-witness-validation.json'),
  commitMessagePresent: source.includes('Persist CI-backed live deployment proof for run ${GITHUB_RUN_ID}'),
}

const failures = Object.entries(checks).filter(([, value]) => !value).map(([key]) => key)
const result = {
  packet,
  generatedAt: new Date().toISOString(),
  checks,
  success: failures.length === 0,
  failures,
}

fs.writeFileSync(path.join(generatedDir, 'live-deployment-proof-commit-path-validation.json'), JSON.stringify(result, null, 2))
fs.writeFileSync(
  path.join(generatedDir, 'live-deployment-proof-commit-path-validation.md'),
  [
    '# Live Deployment Proof Commit Path Validation',
    '',
    `- Packet: ${packet}`,
    `- Generated: ${result.generatedAt}`,
    `- success: ${result.success}`,
    '',
    '## Checks',
    ...Object.entries(checks).map(([key, value]) => `- ${key}: ${value}`),
    '',
    '## Failures',
    ...(failures.length ? failures.map((item) => `- ${item}`) : ['- none']),
    '',
  ].join('\n'),
)

if (failures.length > 0) {
  console.error('Live deployment proof commit path validation failed.')
  process.exit(1)
}

console.log(`Live deployment proof commit path validation passed for packet ${packet}.`)
