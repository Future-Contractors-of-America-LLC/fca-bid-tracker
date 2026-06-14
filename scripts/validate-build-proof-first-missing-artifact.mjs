import fs from 'fs'
import path from 'path'

const REQUIRED_FILES = [
  'build-evidence-report.json',
  'build-evidence-report.md',
  'build-proof-lane-validation.json',
  'build-proof-lane-validation.md',
  'build-proof-lane-report.json',
  'build-proof-lane-report.md',
  'packet-letter-lock-validation.json',
  'packet-letter-lock-validation.md',
  'packet-letter-lock-report.json',
  'packet-letter-lock-report.md',
]

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
  let firstMissingArtifact = null
  let presentCount = 0

  if (fs.existsSync(proofDir)) {
    for (const file of REQUIRED_FILES) {
      if (fs.existsSync(path.join(proofDir, file))) {
        presentCount += 1
      } else {
        firstMissingArtifact = `docs/runtime-proof/build-validation/${file}`
        break
      }
    }
  } else {
    firstMissingArtifact = 'docs/runtime-proof/build-validation/'
  }

  const result = {
    packet,
    generatedAt: new Date().toISOString(),
    proofDirectoryPresent: fs.existsSync(proofDir),
    presentCount,
    requiredCount: REQUIRED_FILES.length,
    firstMissingArtifact,
    success: firstMissingArtifact === null,
  }

  fs.writeFileSync(path.join(generatedDir, 'build-proof-first-missing-artifact.json'), JSON.stringify(result, null, 2))
  fs.writeFileSync(
    path.join(generatedDir, 'build-proof-first-missing-artifact.md'),
    [
      '# Build Proof First Missing Artifact',
      '',
      `- Packet: ${packet}`,
      `- Generated: ${result.generatedAt}`,
      `- proofDirectoryPresent: ${result.proofDirectoryPresent}`,
      `- presentCount: ${result.presentCount}`,
      `- requiredCount: ${result.requiredCount}`,
      `- firstMissingArtifact: ${result.firstMissingArtifact || 'none'}`,
      `- success: ${result.success}`,
      '',
    ].join('\n'),
  )

  if (!result.success) {
    console.error(`First missing build proof artifact: ${result.firstMissingArtifact}`)
    process.exit(1)
  }

  console.log(`All required build proof artifacts are present for packet ${packet}.`)
}

main()
