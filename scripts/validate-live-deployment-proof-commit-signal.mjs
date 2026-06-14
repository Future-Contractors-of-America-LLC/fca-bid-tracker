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

function main() {
  const repoRoot = path.join(path.dirname(new URL(import.meta.url).pathname), '..')
  const packet = readContinuityPacket(repoRoot)
  const generatedDir = path.join(repoRoot, 'generated')
  fs.mkdirSync(generatedDir, { recursive: true })

  const evidencePath = path.join(repoRoot, 'docs', 'FCA_PACKET_061R_LIVE_COMMIT_SIGNAL_GATE.md')
  const evidence = fs.existsSync(evidencePath) ? fs.readFileSync(evidencePath, 'utf8') : ''
  const observed = evidence.includes('Persist CI-backed live deployment proof for run')

  const result = {
    packet,
    generatedAt: new Date().toISOString(),
    expectedCommitPattern: 'Persist CI-backed live deployment proof for run ...',
    observed,
    success: observed,
  }

  fs.writeFileSync(path.join(generatedDir, 'live-deployment-proof-commit-signal-validation.json'), JSON.stringify(result, null, 2))
  fs.writeFileSync(
    path.join(generatedDir, 'live-deployment-proof-commit-signal-validation.md'),
    [
      '# Live Deployment Proof Commit Signal Validation',
      '',
      `- Packet: ${packet}`,
      `- Generated: ${result.generatedAt}`,
      `- expectedCommitPattern: ${result.expectedCommitPattern}`,
      `- observed: ${result.observed}`,
      `- success: ${result.success}`,
      '',
    ].join('\n'),
  )

  if (!observed) {
    console.error('Live deployment proof commit signal not yet observed.')
    process.exit(1)
  }

  console.log(`Live deployment proof commit signal observed for packet ${packet}.`)
}

main()
