import fs from 'fs'
import path from 'path'

const REQUIRED_FILES = [
  'build-evidence-report.json',
  'build-proof-lane-validation.json',
  'build-proof-lane-report.json',
  'packet-letter-lock-validation.json',
  'packet-letter-lock-report.json',
]

function readContinuityPacket(repoRoot) {
  const ledgerPath = path.join(repoRoot, 'docs', 'FCA_EXECUTION_CONTINUITY_LEDGER.md')
  const fallbackPacket = 'UNLOCKED'
  if (!fs.existsSync(ledgerPath)) return fallbackPacket
  const ledger = fs.readFileSync(ledgerPath, 'utf8')
  const match = ledger.match(/- Active packet: `([^`]+)`/)
  return match ? match[1] : fallbackPacket
}

function readJson(file) {
  if (!fs.existsSync(file)) return null
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'))
  } catch {
    return null
  }
}

function main() {
  const repoRoot = path.join(path.dirname(new URL(import.meta.url).pathname), '..')
  const packet = readContinuityPacket(repoRoot)
  const generatedDir = path.join(repoRoot, 'generated')
  fs.mkdirSync(generatedDir, { recursive: true })

  const proofDir = path.join(repoRoot, 'docs', 'runtime-proof', 'build-validation')
  const failures = []
  const observations = []

  for (const file of REQUIRED_FILES) {
    const target = path.join(proofDir, file)
    const data = readJson(target)
    if (!data) {
      failures.push(`missing or unreadable JSON proof artifact: ${file}`)
      continue
    }
    observations.push({ file, provenance: data.provenance || null, ciPersisted: Boolean(data.ciPersisted) })
  }

  const ciPersistedFiles = observations.filter((item) => item.ciPersisted).length
  const result = {
    packet,
    generatedAt: new Date().toISOString(),
    observations,
    ciPersistedFiles,
    success: ciPersistedFiles === observations.length && observations.length === REQUIRED_FILES.length,
    failureMode: ciPersistedFiles === observations.length ? null : 'build_validation_ci_provenance_unconfirmed',
  }

  fs.writeFileSync(path.join(generatedDir, 'build-proof-provenance-validation.json'), JSON.stringify(result, null, 2))
  fs.writeFileSync(
    path.join(generatedDir, 'build-proof-provenance-validation.md'),
    [
      '# Build Proof Provenance Validation',
      '',
      `- Packet: ${packet}`,
      `- Generated: ${result.generatedAt}`,
      `- ciPersistedFiles: ${ciPersistedFiles}`,
      `- expectedFiles: ${REQUIRED_FILES.length}`,
      `- success: ${result.success}`,
      `- failureMode: ${result.failureMode || 'none'}`,
      '',
    ].join('\n'),
  )

  if (!result.success) {
    console.error('Build proof provenance remains unconfirmed.')
    process.exit(1)
  }

  console.log(`Build proof provenance confirmed for packet ${packet}.`)
}

main()
