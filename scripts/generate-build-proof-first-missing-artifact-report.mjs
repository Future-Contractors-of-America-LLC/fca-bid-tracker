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

  const source = readJson(path.join(generatedDir, 'build-proof-first-missing-artifact.json'))
  const report = {
    packet,
    generatedAt: new Date().toISOString(),
    proofDirectoryPresent: source?.proofDirectoryPresent || false,
    firstMissingArtifact: source?.firstMissingArtifact || null,
    presentCount: source?.presentCount || 0,
    requiredCount: source?.requiredCount || 0,
    success: source?.success || false,
  }

  fs.writeFileSync(path.join(generatedDir, 'build-proof-first-missing-artifact-report.json'), JSON.stringify(report, null, 2))
  fs.writeFileSync(
    path.join(generatedDir, 'build-proof-first-missing-artifact-report.md'),
    [
      '# Build Proof First Missing Artifact Report',
      '',
      `- Packet: ${packet}`,
      `- Generated: ${report.generatedAt}`,
      `- proofDirectoryPresent: ${report.proofDirectoryPresent}`,
      `- firstMissingArtifact: ${report.firstMissingArtifact || 'none'}`,
      `- presentCount: ${report.presentCount}`,
      `- requiredCount: ${report.requiredCount}`,
      `- success: ${report.success}`,
      '',
    ].join('\n'),
  )

  console.log(`Build proof first-missing-artifact report generated for packet ${packet}.`)
}

main()
