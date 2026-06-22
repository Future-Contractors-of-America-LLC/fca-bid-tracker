import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'node:url'

function readContinuityPacket(repoRoot) {
  const ledgerPath = path.join(repoRoot, 'docs', 'FCA_EXECUTION_CONTINUITY_LEDGER.md')
  const fallbackPacket = 'UNLOCKED'

  if (!fs.existsSync(ledgerPath)) return fallbackPacket
  const ledger = fs.readFileSync(ledgerPath, 'utf8')
  const match = ledger.match(/- Active packet: `([^`]+)`/)
  return match ? match[1] : fallbackPacket
}

function exists(file) {
  return fs.existsSync(file)
}

function main() {
  const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
  const packet = readContinuityPacket(repoRoot)
  const generatedDir = path.join(repoRoot, 'generated')
  fs.mkdirSync(generatedDir, { recursive: true })

  const requiredDocs = [
    `docs/FCA_PACKET_${packet}_RUNTIME_PASS_BUILD_PROOF_GAP.md`,
    'docs/FCA_PACKET_061E_PER_LETTER_LOCK_AND_VERIFY_STANDARD.md',
    'docs/FCA_PACKET_061F_BUILD_PROOF_ABSENCE_REMEDIATION_GATE.md',
  ]

  const runtimeSmokeJson = path.join(repoRoot, 'docs', 'runtime-proof', 'runtime-smoke', 'runtime-smoke-check-report.json')
  const buildProofDir = path.join(repoRoot, 'docs', 'runtime-proof', 'build-validation')

  const failures = []

  for (const relative of requiredDocs) {
    if (!exists(path.join(repoRoot, relative))) {
      failures.push(`missing required packet document: ${relative}`)
    }
  }

  if (!exists(runtimeSmokeJson)) {
    failures.push('missing runtime smoke proof artifact: docs/runtime-proof/runtime-smoke/runtime-smoke-check-report.json')
  }

  const result = {
    packet,
    generatedAt: new Date().toISOString(),
    lockChecks: {
      requiredDocsPresent: failures.filter((item) => item.includes('packet document')).length === 0,
      runtimeSmokeProofPresent: exists(runtimeSmokeJson),
      buildProofDirectoryPresent: exists(buildProofDir),
    },
    failures,
  }

  fs.writeFileSync(path.join(generatedDir, 'packet-letter-lock-validation.json'), JSON.stringify(result, null, 2))
  fs.writeFileSync(
    path.join(generatedDir, 'packet-letter-lock-validation.md'),
    [
      '# Packet Letter Lock Validation',
      '',
      `- Packet: ${packet}`,
      `- Generated: ${result.generatedAt}`,
      `- requiredDocsPresent: ${result.lockChecks.requiredDocsPresent}`,
      `- runtimeSmokeProofPresent: ${result.lockChecks.runtimeSmokeProofPresent}`,
      `- buildProofDirectoryPresent: ${result.lockChecks.buildProofDirectoryPresent}`,
      '',
      '## Failures',
      ...(failures.length ? failures.map((item) => `- ${item}`) : ['- none']),
      '',
    ].join('\n'),
  )

  if (failures.length > 0) {
    console.error('Packet letter lock validation found blocking gaps:')
    for (const failure of failures) console.error(`- ${failure}`)
    process.exit(1)
  }

  console.log(`Packet letter lock validation passed for packet ${packet}.`)
}

main()
