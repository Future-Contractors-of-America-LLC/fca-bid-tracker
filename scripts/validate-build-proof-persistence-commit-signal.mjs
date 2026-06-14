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

  const commitSearchEvidencePath = path.join(repoRoot, 'docs', 'FCA_PACKET_061F_CI_VERIFICATION_GAP_LOCK.md')
  const commitSearchEvidence = fs.existsSync(commitSearchEvidencePath)
    ? fs.readFileSync(commitSearchEvidencePath, 'utf8')
    : ''

  const observedAbsence = commitSearchEvidence.includes('no repo-visible commit matching `Persist build validation and live deployment proof artifacts` was found')
  const result = {
    packet,
    generatedAt: new Date().toISOString(),
    evidenceDocumentPresent: fs.existsSync(commitSearchEvidencePath),
    observedAbsence,
    expectedCommitPattern: 'Persist build validation and live deployment proof artifacts for run ...',
    success: false,
  }

  fs.writeFileSync(path.join(generatedDir, 'build-proof-persistence-commit-signal-validation.json'), JSON.stringify(result, null, 2))
  fs.writeFileSync(
    path.join(generatedDir, 'build-proof-persistence-commit-signal-validation.md'),
    [
      '# Build Proof Persistence Commit Signal Validation',
      '',
      `- Packet: ${packet}`,
      `- Generated: ${result.generatedAt}`,
      `- evidenceDocumentPresent: ${result.evidenceDocumentPresent}`,
      `- observedAbsence: ${result.observedAbsence}`,
      `- expectedCommitPattern: ${result.expectedCommitPattern}`,
      `- success: ${result.success}`,
      '',
    ].join('\n'),
  )

  console.error('Build-proof persistence commit remains unconfirmed in current repo-visible evidence.')
  process.exit(1)
}

main()
