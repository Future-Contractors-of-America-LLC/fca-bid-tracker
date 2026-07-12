import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

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
const workflowPath = path.join(repoRoot, '.github', 'workflows', 'live-deployment-run-witness.yml')
const generatedDir = path.join(repoRoot, 'generated')
fs.mkdirSync(generatedDir, { recursive: true })

const source = fs.readFileSync(workflowPath, 'utf8')
const checks = {
  workflowExists: fs.existsSync(workflowPath),
  hasWorkflowName: source.includes('name: FCA Live Deployment Run Witness'),
  emitsWitness: source.includes('node scripts/emit-live-deployment-run-witness.mjs'),
  validatesWitness: source.includes('node scripts/validate-live-deployment-run-witness.mjs'),
  commitMessagePresent: source.includes('Persist live deployment run witness for run ${GITHUB_RUN_ID}'),
}
const failures = Object.entries(checks).filter(([, value]) => !value).map(([key]) => key)
const result = {
  packet,
  generatedAt: new Date().toISOString(),
  checks,
  success: failures.length === 0,
  failures,
}

fs.writeFileSync(path.join(generatedDir, 'live-deployment-run-witness-workflow-validation.json'), JSON.stringify(result, null, 2))
fs.writeFileSync(
  path.join(generatedDir, 'live-deployment-run-witness-workflow-validation.md'),
  [
    '# Live Deployment Run Witness Workflow Validation',
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
  console.error('Live deployment run witness workflow validation failed.')
  process.exit(1)
}

console.log(`Live deployment run witness workflow validation passed for packet ${packet}.`)
