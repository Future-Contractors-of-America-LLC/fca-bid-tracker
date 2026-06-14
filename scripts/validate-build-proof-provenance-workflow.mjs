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
  const workflowPath = path.join(repoRoot, '.github', 'workflows', 'build-proof-provenance-stamp.yml')
  const generatedDir = path.join(repoRoot, 'generated')
  fs.mkdirSync(generatedDir, { recursive: true })

  const source = fs.existsSync(workflowPath) ? fs.readFileSync(workflowPath, 'utf8') : ''
  const checks = {
    workflowExists: fs.existsSync(workflowPath),
    hasWorkflowName: source.includes('name: FCA Build Proof Provenance Stamp'),
    invokesStamp: source.includes('npm run stamp:build-proof-ci-provenance'),
    invokesTransitionCapture: source.includes('npm run capture:build-proof-transition-target'),
    invokesCiValidation: source.includes('npm run validate:build-proof-ci-provenance'),
    invokesTransitionValidation: source.includes('npm run validate:build-proof-ci-rewrite-transition'),
    commitsRewrite: source.includes('Persist CI-backed build proof provenance for run ${GITHUB_RUN_ID}'),
  }

  const failures = Object.entries(checks)
    .filter(([, value]) => !value)
    .map(([key]) => key)

  const result = {
    packet,
    generatedAt: new Date().toISOString(),
    checks,
    success: failures.length === 0,
    failures,
  }

  fs.writeFileSync(path.join(generatedDir, 'build-proof-provenance-workflow-validation.json'), JSON.stringify(result, null, 2))
  fs.writeFileSync(
    path.join(generatedDir, 'build-proof-provenance-workflow-validation.md'),
    [
      '# Build Proof Provenance Workflow Validation',
      '',
      `- Packet: ${packet}`,
      `- Generated: ${result.generatedAt}`,
      `- success: ${result.success}`,
      '',
      '## Checks',
      ...Object.entries(checks).map(([key, value]) => `- ${key}: ${value}`),
      '',
      '## Failures',
      ...(failures.length ? failures.map((item) => `- ${item}`) : ['- none']),
      '',
    ].join('\n'),
  )

  if (failures.length > 0) {
    console.error('Build proof provenance workflow validation failed.')
    process.exit(1)
  }

  console.log(`Build proof provenance workflow validation passed for packet ${packet}.`)
}

main()
