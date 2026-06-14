import fs from 'fs'
import path from 'path'

const REQUIRED = [
  'live_deployment_smoke_summary.json',
  'live_deployment_smoke_failures.txt',
  'live_deployment_proof_metadata.json',
  'live_deployment_proof_metadata.md',
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
  const proofDir = path.join(repoRoot, 'docs', 'runtime-proof', 'live-deployment')
  const generatedDir = path.join(repoRoot, 'generated')
  fs.mkdirSync(generatedDir, { recursive: true })

  const failures = []
  const present = []
  for (const file of REQUIRED) {
    const target = path.join(proofDir, file)
    if (fs.existsSync(target)) present.push(file)
    else failures.push(`missing live deployment proof artifact: ${file}`)
  }

  const result = {
    packet,
    generatedAt: new Date().toISOString(),
    present,
    failureCount: failures.length,
    success: failures.length === 0,
    failures,
  }

  fs.writeFileSync(path.join(generatedDir, 'live-deployment-proof-surface-validation.json'), JSON.stringify(result, null, 2))
  fs.writeFileSync(
    path.join(generatedDir, 'live-deployment-proof-surface-validation.md'),
    [
      '# Live Deployment Proof Surface Validation',
      '',
      `- Packet: ${packet}`,
      `- Generated: ${result.generatedAt}`,
      `- success: ${result.success}`,
      `- failureCount: ${result.failureCount}`,
      '',
      '## Present',
      ...(present.length ? present.map((item) => `- ${item}`) : ['- none']),
      '',
      '## Failures',
      ...(failures.length ? failures.map((item) => `- ${item}`) : ['- none']),
      '',
    ].join('\n'),
  )

  if (failures.length > 0) {
    console.error('Live deployment proof surface validation failed.')
    process.exit(1)
  }

  console.log(`Live deployment proof surface validation passed for packet ${packet}.`)
}

main()
