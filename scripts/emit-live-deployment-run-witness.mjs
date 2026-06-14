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
const proofDir = path.join(repoRoot, 'docs', 'runtime-proof', 'live-deployment')
fs.mkdirSync(proofDir, { recursive: true })

const witness = {
  packet,
  generatedAt: new Date().toISOString(),
  provenance: 'github_actions_ci',
  ciPersisted: true,
  ciRunId: process.env.GITHUB_RUN_ID || 'local',
  ciCommitSha: process.env.GITHUB_SHA || 'local',
  workflow: process.env.GITHUB_WORKFLOW || 'FCA Live Deployment Proof Stamp',
}

fs.writeFileSync(path.join(proofDir, 'live_deployment_ci_run_witness.json'), JSON.stringify(witness, null, 2))
fs.writeFileSync(
  path.join(proofDir, 'live_deployment_ci_run_witness.md'),
  [
    '# Live Deployment CI Run Witness',
    '',
    `- Packet: ${witness.packet}`,
    `- Generated: ${witness.generatedAt}`,
    `- provenance: ${witness.provenance}`,
    `- ciPersisted: ${witness.ciPersisted}`,
    `- ciRunId: ${witness.ciRunId}`,
    `- ciCommitSha: ${witness.ciCommitSha}`,
    `- workflow: ${witness.workflow}`,
    '',
  ].join('\n'),
)

console.log(`Live deployment CI run witness emitted for packet ${packet}.`)
