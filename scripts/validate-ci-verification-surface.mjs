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

function exists(repoRoot, relativePath) {
  return fs.existsSync(path.join(repoRoot, relativePath))
}

function main() {
  const repoRoot = path.join(path.dirname(new URL(import.meta.url).pathname), '..')
  const packet = readContinuityPacket(repoRoot)
  const generatedDir = path.join(repoRoot, 'generated')
  fs.mkdirSync(generatedDir, { recursive: true })

  const runtimeSmokeCommitSignal = exists(repoRoot, 'docs/runtime-proof/runtime-smoke/runtime-smoke-check-report.json')
  const buildValidationDirSignal = exists(repoRoot, 'docs/runtime-proof/build-validation')
  const buildProofPresenceValidator = exists(repoRoot, 'scripts/validate-build-proof-presence.mjs')
  const buildWorkflow = exists(repoRoot, '.github/workflows/build-validation.yml')

  const failures = []
  if (!runtimeSmokeCommitSignal) failures.push('missing runtime smoke proof signal in repo truth')
  if (!buildProofPresenceValidator) failures.push('missing build proof presence validator in repo truth')
  if (!buildWorkflow) failures.push('missing build-validation workflow in repo truth')

  const result = {
    packet,
    generatedAt: new Date().toISOString(),
    success: failures.length === 0,
    ciSignals: {
      runtimeSmokeCommitSignal,
      buildValidationDirSignal,
      buildProofPresenceValidator,
      buildWorkflow,
    },
    failures,
  }

  fs.writeFileSync(path.join(generatedDir, 'ci-verification-surface-validation.json'), JSON.stringify(result, null, 2))
  fs.writeFileSync(
    path.join(generatedDir, 'ci-verification-surface-validation.md'),
    [
      '# CI Verification Surface Validation',
      '',
      `- Packet: ${packet}`,
      `- Generated: ${result.generatedAt}`,
      `- success: ${result.success}`,
      '',
      '## CI signals',
      `- runtimeSmokeCommitSignal: ${runtimeSmokeCommitSignal}`,
      `- buildValidationDirSignal: ${buildValidationDirSignal}`,
      `- buildProofPresenceValidator: ${buildProofPresenceValidator}`,
      `- buildWorkflow: ${buildWorkflow}`,
      '',
      '## Failures',
      ...(failures.length ? failures.map((item) => `- ${item}`) : ['- none']),
      '',
    ].join('\n'),
  )

  if (failures.length > 0) {
    console.error('CI verification surface validation failed:')
    for (const failure of failures) console.error(`- ${failure}`)
    process.exit(1)
  }

  console.log(`CI verification surface validation passed for packet ${packet}.`)
}

main()
