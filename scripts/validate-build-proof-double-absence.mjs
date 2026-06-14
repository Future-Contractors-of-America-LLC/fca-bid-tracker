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

  const directoryPresent = fs.existsSync(path.join(repoRoot, 'docs', 'runtime-proof', 'build-validation'))
  const commitSignalEvidencePath = path.join(repoRoot, 'docs', 'FCA_PACKET_061I_PERSISTENCE_COMMIT_ABSENCE_LOCK.md')
  const commitSignalEvidence = fs.existsSync(commitSignalEvidencePath)
    ? fs.readFileSync(commitSignalEvidencePath, 'utf8')
    : ''
  const commitObservedAbsent = commitSignalEvidence.includes('persistence-commit absence remains confirmed')
  const doubleAbsence = !directoryPresent && commitObservedAbsent

  const result = {
    packet,
    generatedAt: new Date().toISOString(),
    directoryPresent,
    commitObservedAbsent,
    doubleAbsence,
    success: doubleAbsence,
  }

  fs.writeFileSync(path.join(generatedDir, 'build-proof-double-absence-validation.json'), JSON.stringify(result, null, 2))
  fs.writeFileSync(
    path.join(generatedDir, 'build-proof-double-absence-validation.md'),
    [
      '# Build Proof Double Absence Validation',
      '',
      `- Packet: ${packet}`,
      `- Generated: ${result.generatedAt}`,
      `- directoryPresent: ${result.directoryPresent}`,
      `- commitObservedAbsent: ${result.commitObservedAbsent}`,
      `- doubleAbsence: ${result.doubleAbsence}`,
      `- success: ${result.success}`,
      '',
    ].join('\n'),
  )

  if (!doubleAbsence) {
    console.error('Double absence is no longer true; build-validation lane state changed.')
    process.exit(1)
  }

  console.log(`Build proof double absence confirmed for packet ${packet}.`)
}

main()
