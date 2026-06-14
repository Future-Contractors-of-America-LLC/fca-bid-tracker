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

  const validation = readJson(path.join(generatedDir, 'build-proof-directory-absence-validation.json'))
  const report = {
    packet,
    generatedAt: new Date().toISOString(),
    directoryPresent: Boolean(validation?.directoryPresent),
    firstMissingArtifact: validation?.firstMissingArtifact || null,
    success: Boolean(validation?.success),
  }

  fs.writeFileSync(path.join(generatedDir, 'build-proof-directory-absence-report.json'), JSON.stringify(report, null, 2))
  fs.writeFileSync(
    path.join(generatedDir, 'build-proof-directory-absence-report.md'),
    [
      '# Build Proof Directory Absence Report',
      '',
      `- Packet: ${packet}`,
      `- Generated: ${report.generatedAt}`,
      `- directoryPresent: ${report.directoryPresent}`,
      `- firstMissingArtifact: ${report.firstMissingArtifact || 'none'}`,
      `- success: ${report.success}`,
      '',
    ].join('\n'),
  )

  console.log(`Build proof directory absence report generated for packet ${packet}.`)
}

main()
