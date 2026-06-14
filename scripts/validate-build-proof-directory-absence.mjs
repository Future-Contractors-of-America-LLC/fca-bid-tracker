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

  const proofDir = path.join(repoRoot, 'docs', 'runtime-proof', 'build-validation')
  const directoryPresent = fs.existsSync(proofDir)
  const result = {
    packet,
    generatedAt: new Date().toISOString(),
    directoryPresent,
    firstMissingArtifact: directoryPresent ? null : 'docs/runtime-proof/build-validation/',
    success: directoryPresent,
  }

  fs.writeFileSync(path.join(generatedDir, 'build-proof-directory-absence-validation.json'), JSON.stringify(result, null, 2))
  fs.writeFileSync(
    path.join(generatedDir, 'build-proof-directory-absence-validation.md'),
    [
      '# Build Proof Directory Absence Validation',
      '',
      `- Packet: ${packet}`,
      `- Generated: ${result.generatedAt}`,
      `- directoryPresent: ${directoryPresent}`,
      `- firstMissingArtifact: ${result.firstMissingArtifact || 'none'}`,
      `- success: ${result.success}`,
      '',
    ].join('\n'),
  )

  if (!directoryPresent) {
    console.error('Build-validation proof directory is absent.')
    process.exit(1)
  }

  console.log(`Build-validation proof directory exists for packet ${packet}.`)
}

main()
