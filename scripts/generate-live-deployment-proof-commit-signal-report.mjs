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

function main() {
  const repoRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
  const packet = readContinuityPacket(repoRoot)
  const generatedDir = path.join(repoRoot, 'generated')
  fs.mkdirSync(generatedDir, { recursive: true })

  const source = readJson(path.join(generatedDir, 'live-deployment-proof-commit-signal-validation.json'))
  const report = {
    packet,
    generatedAt: new Date().toISOString(),
    success: Boolean(source?.success),
    observed: Boolean(source?.observed),
    expectedCommitPattern: source?.expectedCommitPattern || 'Persist CI-backed live deployment proof for run ...',
  }

  fs.writeFileSync(path.join(generatedDir, 'live-deployment-proof-commit-signal-report.json'), JSON.stringify(report, null, 2))
  fs.writeFileSync(
    path.join(generatedDir, 'live-deployment-proof-commit-signal-report.md'),
    [
      '# Live Deployment Proof Commit Signal Report',
      '',
      `- Packet: ${packet}`,
      `- Generated: ${report.generatedAt}`,
      `- success: ${report.success}`,
      `- observed: ${report.observed}`,
      `- expectedCommitPattern: ${report.expectedCommitPattern}`,
      '',
    ].join('\n'),
  )

  console.log(`Live deployment proof commit signal report generated for packet ${packet}.`)
}

main()
