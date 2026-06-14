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
  const workflowPath = path.join(repoRoot, '.github', 'workflows', 'live-deployment-proof-stamp.yml')
  const generatedDir = path.join(repoRoot, 'generated')
  fs.mkdirSync(generatedDir, { recursive: true })

  const source = fs.existsSync(workflowPath) ? fs.readFileSync(workflowPath, 'utf8') : ''
  const checks = {
    workflowExists: fs.existsSync(workflowPath),
    hasName: source.includes('name: FCA Live Deployment Proof Stamp'),
    invokesVerifyLiveDeployment: source.includes('npm run verify:live-deployment'),
    invokesStamp: source.includes('npm run stamp:live-deployment-proof'),
    commitsCiProof: source.includes('Persist CI-backed live deployment proof for run ${GITHUB_RUN_ID}'),
  }
  const failures = Object.entries(checks).filter(([, value]) => !value).map(([key]) => key)
  const result = {
    packet,
    generatedAt: new Date().toISOString(),
    checks,
    success: failures.length === 0,
    failures,
  }

  fs.writeFileSync(path.join(generatedDir, 'live-deployment-proof-workflow-validation.json'), JSON.stringify(result, null, 2))
  fs.writeFileSync(
    path.join(generatedDir, 'live-deployment-proof-workflow-validation.md'),
    [
      '# Live Deployment Proof Workflow Validation',
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
    console.error('Live deployment proof workflow validation failed.')
    process.exit(1)
  }

  console.log(`Live deployment proof workflow validation passed for packet ${packet}.`)
}

main()
