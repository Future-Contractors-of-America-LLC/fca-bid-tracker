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

  const source = fs.readFileSync(workflowPath, 'utf8')
  const checks = {
    noNpmCiStep: !source.includes('npm ci'),
    usesNodeDirectVerify: source.includes('node scripts/verify-live-deployment.mjs'),
    usesNodeDirectStamp: source.includes('node scripts/stamp-live-deployment-proof.mjs'),
    usesNodeDirectSurfaceValidation: source.includes('node scripts/validate-live-deployment-proof-surface.mjs'),
    usesNodeDirectWorkflowValidation: source.includes('node scripts/validate-live-deployment-proof-workflow.mjs'),
  }
  const failures = Object.entries(checks).filter(([, value]) => !value).map(([key]) => key)
  const result = {
    packet,
    generatedAt: new Date().toISOString(),
    checks,
    success: failures.length === 0,
    failures,
  }

  fs.writeFileSync(path.join(generatedDir, 'live-deployment-proof-zero-dependency-workflow-validation.json'), JSON.stringify(result, null, 2))
  fs.writeFileSync(
    path.join(generatedDir, 'live-deployment-proof-zero-dependency-workflow-validation.md'),
    [
      '# Live Deployment Proof Zero Dependency Workflow Validation',
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
    console.error('Live deployment proof zero-dependency workflow validation failed.')
    process.exit(1)
  }

  console.log(`Live deployment proof zero-dependency workflow validation passed for packet ${packet}.`)
}

main()
