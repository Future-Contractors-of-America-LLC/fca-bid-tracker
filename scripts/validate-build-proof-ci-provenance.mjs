import fs from 'fs'
import path from 'path'

const REQUIRED_JSON = [
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

function main() {
  const repoRoot = path.join(path.dirname(new URL(import.meta.url).pathname), '..')
  const packet = readContinuityPacket(repoRoot)
  const proofDir = path.join(repoRoot, 'docs', 'runtime-proof', 'build-validation')
  const generatedDir = path.join(repoRoot, 'generated')
  fs.mkdirSync(generatedDir, { recursive: true })

  const failures = []
  const verified = []

  for (const file of REQUIRED_JSON) {
    const target = path.join(proofDir, file)
    if (!fs.existsSync(target)) {
      failures.push(`missing required JSON artifact: ${file}`)
      continue
    }
    const data = JSON.parse(fs.readFileSync(target, 'utf8'))
    if (data.provenance !== 'github_actions_ci') {
      failures.push(`artifact not CI-backed: ${file}`)
      continue
    }
    if (data.ciPersisted !== true) {
      failures.push(`artifact missing ciPersisted=true: ${file}`)
      continue
    }
    verified.push(file)
  }

  const result = {
    packet,
    generatedAt: new Date().toISOString(),
    verified,
    failureCount: failures.length,
    success: failures.length === 0,
    failures,
  }

  fs.writeFileSync(path.join(generatedDir, 'build-proof-ci-provenance-validation.json'), JSON.stringify(result, null, 2))
  fs.writeFileSync(
    path.join(generatedDir, 'build-proof-ci-provenance-validation.md'),
    [
      '# Build Proof CI Provenance Validation',
      '',
      `- Packet: ${packet}`,
      `- Generated: ${result.generatedAt}`,
      `- success: ${result.success}`,
      `- failureCount: ${result.failureCount}`,
      '',
      '## Verified files',
      ...(verified.length ? verified.map((item) => `- ${item}`) : ['- none']),
      '',
      '## Failures',
      ...(failures.length ? failures.map((item) => `- ${item}`) : ['- none']),
      '',
    ].join('\n'),
  )

  if (failures.length > 0) {
    console.error('Build proof CI provenance not yet verified.')
    process.exit(1)
  }

  console.log(`Build proof CI provenance verified for packet ${packet}.`)
}

main()
