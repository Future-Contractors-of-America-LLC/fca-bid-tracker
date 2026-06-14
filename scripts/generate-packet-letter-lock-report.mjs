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
  const generatedDir = path.join(repoRoot, 'generated')
  fs.mkdirSync(generatedDir, { recursive: true })

  const packet = readContinuityPacket(repoRoot)
  const validation = readJson(path.join(generatedDir, 'packet-letter-lock-validation.json'))
  const runtimeSmoke = readJson(path.join(repoRoot, 'docs', 'runtime-proof', 'runtime-smoke', 'runtime-smoke-check-report.json'))
  const report = {
    packet,
    generatedAt: new Date().toISOString(),
    verificationState: {
      packetLockValidationPresent: Boolean(validation),
      runtimeSmokeRepoVisible: Boolean(runtimeSmoke),
      runtimeSmokePassing: runtimeSmoke ? runtimeSmoke.failed === 0 : false,
      buildProofRepoVisible: fs.existsSync(path.join(repoRoot, 'docs', 'runtime-proof', 'build-validation')),
    },
    validationFailures: validation?.failures || [],
  }

  fs.writeFileSync(path.join(generatedDir, 'packet-letter-lock-report.json'), JSON.stringify(report, null, 2))
  fs.writeFileSync(
    path.join(generatedDir, 'packet-letter-lock-report.md'),
    [
      '# Packet Letter Lock Report',
      '',
      `- Packet: ${packet}`,
      `- Generated: ${report.generatedAt}`,
      '',
      '## Verification state',
      `- packetLockValidationPresent: ${report.verificationState.packetLockValidationPresent}`,
      `- runtimeSmokeRepoVisible: ${report.verificationState.runtimeSmokeRepoVisible}`,
      `- runtimeSmokePassing: ${report.verificationState.runtimeSmokePassing}`,
      `- buildProofRepoVisible: ${report.verificationState.buildProofRepoVisible}`,
      '',
      '## Validation failures',
      ...(report.validationFailures.length ? report.validationFailures.map((item) => `- ${item}`) : ['- none']),
      '',
    ].join('\n'),
  )

  console.log(`Packet letter lock report generated for packet ${packet}.`)
}

main()
