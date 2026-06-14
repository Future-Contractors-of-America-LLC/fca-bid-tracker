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

  const validation = readJson(path.join(generatedDir, 'ci-verification-surface-validation.json'))
  const report = {
    packet,
    generatedAt: new Date().toISOString(),
    ciVerificationSummary: validation?.ciSignals || null,
    repoVisibleBuildProof: Boolean(validation?.ciSignals?.buildValidationDirSignal),
    repoVisibleRuntimeSmokeProof: Boolean(validation?.ciSignals?.runtimeSmokeCommitSignal),
    failures: validation?.failures || [],
  }

  fs.writeFileSync(path.join(generatedDir, 'ci-verification-surface-report.json'), JSON.stringify(report, null, 2))
  fs.writeFileSync(
    path.join(generatedDir, 'ci-verification-surface-report.md'),
    [
      '# CI Verification Surface Report',
      '',
      `- Packet: ${packet}`,
      `- Generated: ${report.generatedAt}`,
      `- repoVisibleBuildProof: ${report.repoVisibleBuildProof}`,
      `- repoVisibleRuntimeSmokeProof: ${report.repoVisibleRuntimeSmokeProof}`,
      '',
      '## Failures',
      ...(report.failures.length ? report.failures.map((item) => `- ${item}`) : ['- none']),
      '',
    ].join('\n'),
  )

  console.log(`CI verification surface report generated for packet ${packet}.`)
}

main()
