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
  const failures = []
  const presentFiles = []

  if (!fs.existsSync(proofDir)) {
    failures.push('missing proof directory: docs/runtime-proof/build-validation')
  } else {
    for (const file of REQUIRED_FILES) {
      const target = path.join(proofDir, file)
      if (fs.existsSync(target)) {
        presentFiles.push(file)
      } else {
        failures.push(`missing proof artifact: docs/runtime-proof/build-validation/${file}`)
      }
    }
  }

  const result = {
    packet,
    generatedAt: new Date().toISOString(),
    proofDirectoryPresent: fs.existsSync(proofDir),
    requiredFiles: REQUIRED_FILES,
    presentFiles,
    missingCount: failures.length,
    success: failures.length === 0,
    failures,
  }

  fs.writeFileSync(path.join(generatedDir, 'build-proof-presence-validation.json'), JSON.stringify(result, null, 2))
  fs.writeFileSync(
    path.join(generatedDir, 'build-proof-presence-validation.md'),
    [
      '# Build Proof Presence Validation',
      '',
      `- Packet: ${packet}`,
      `- Generated: ${result.generatedAt}`,
      `- proofDirectoryPresent: ${result.proofDirectoryPresent}`,
      `- success: ${result.success}`,
      `- missingCount: ${result.missingCount}`,
      '',
      '## Present files',
      ...(presentFiles.length ? presentFiles.map((item) => `- ${item}`) : ['- none']),
      '',
      '## Failures',
      ...(failures.length ? failures.map((item) => `- ${item}`) : ['- none']),
      '',
    ].join('\n'),
  )

  if (failures.length > 0) {
    console.error('Build proof presence validation failed:')
    for (const failure of failures) console.error(`- ${failure}`)
    process.exit(1)
  }

  console.log(`Build proof presence validation passed for packet ${packet}.`)
}

main()
