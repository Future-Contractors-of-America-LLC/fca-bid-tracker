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

  const source = readJson(path.join(generatedDir, 'build-proof-double-absence-validation.json'))
  const report = {
    packet,
    generatedAt: new Date().toISOString(),
    directoryPresent: Boolean(source?.directoryPresent),
    commitObservedAbsent: Boolean(source?.commitObservedAbsent),
    doubleAbsence: Boolean(source?.doubleAbsence),
    success: Boolean(source?.success),
  }

  fs.writeFileSync(path.join(generatedDir, 'build-proof-double-absence-report.json'), JSON.stringify(report, null, 2))
  fs.writeFileSync(
    path.join(generatedDir, 'build-proof-double-absence-report.md'),
    [
      '# Build Proof Double Absence Report',
      '',
      `- Packet: ${packet}`,
      `- Generated: ${report.generatedAt}`,
      `- directoryPresent: ${report.directoryPresent}`,
      `- commitObservedAbsent: ${report.commitObservedAbsent}`,
      `- doubleAbsence: ${report.doubleAbsence}`,
      `- success: ${report.success}`,
      '',
    ].join('\n'),
  )

  console.log(`Build proof double absence report generated for packet ${packet}.`)
}

main()
