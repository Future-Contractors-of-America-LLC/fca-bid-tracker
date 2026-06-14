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
  const source = readJson(path.join(generatedDir, 'build-proof-provenance-validation.json'))

  const report = {
    packet,
    generatedAt: new Date().toISOString(),
    ciPersistedFiles: source?.ciPersistedFiles || 0,
    expectedFiles: source?.observations?.length || 0,
    success: Boolean(source?.success),
    failureMode: source?.failureMode || null,
  }

  fs.writeFileSync(path.join(generatedDir, 'build-proof-provenance-report.json'), JSON.stringify(report, null, 2))
  fs.writeFileSync(
    path.join(generatedDir, 'build-proof-provenance-report.md'),
    [
      '# Build Proof Provenance Report',
      '',
      `- Packet: ${packet}`,
      `- Generated: ${report.generatedAt}`,
      `- ciPersistedFiles: ${report.ciPersistedFiles}`,
      `- expectedFiles: ${report.expectedFiles}`,
      `- success: ${report.success}`,
      `- failureMode: ${report.failureMode || 'none'}`,
      '',
    ].join('\n'),
  )

  console.log(`Build proof provenance report generated for packet ${packet}.`)
}

main()
