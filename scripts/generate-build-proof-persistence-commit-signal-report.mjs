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

function main() {
  const repoRoot = path.join(path.dirname(new URL(import.meta.url).pathname), '..')
  const packet = readContinuityPacket(repoRoot)
  const generatedDir = path.join(repoRoot, 'generated')
  fs.mkdirSync(generatedDir, { recursive: true })

  const source = readJson(path.join(generatedDir, 'build-proof-persistence-commit-signal-validation.json'))
  const report = {
    packet,
    generatedAt: new Date().toISOString(),
    evidenceDocumentPresent: Boolean(source?.evidenceDocumentPresent),
    observedAbsence: Boolean(source?.observedAbsence),
    expectedCommitPattern: source?.expectedCommitPattern || 'Persist build validation and live deployment proof artifacts for run ...',
    success: false,
  }

  fs.writeFileSync(path.join(generatedDir, 'build-proof-persistence-commit-signal-report.json'), JSON.stringify(report, null, 2))
  fs.writeFileSync(
    path.join(generatedDir, 'build-proof-persistence-commit-signal-report.md'),
    [
      '# Build Proof Persistence Commit Signal Report',
      '',
      `- Packet: ${packet}`,
      `- Generated: ${report.generatedAt}`,
      `- evidenceDocumentPresent: ${report.evidenceDocumentPresent}`,
      `- observedAbsence: ${report.observedAbsence}`,
      `- expectedCommitPattern: ${report.expectedCommitPattern}`,
      `- success: ${report.success}`,
      '',
    ].join('\n'),
  )

  console.log(`Build proof persistence commit signal report generated for packet ${packet}.`)
}

main()
