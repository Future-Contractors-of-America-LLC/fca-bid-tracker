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

  const metadata = readJson(path.join(repoRoot, 'docs', 'runtime-proof', 'live-deployment', 'live_deployment_proof_metadata.json'))
  const failures = []

  if (!metadata) {
    failures.push('missing live_deployment_proof_metadata.json')
  } else {
    if (metadata.provenance !== 'github_actions_ci') failures.push('live deployment metadata not CI-backed')
    if (metadata.ciPersisted !== true) failures.push('live deployment metadata ciPersisted is not true')
  }

  const result = {
    packet,
    generatedAt: new Date().toISOString(),
    success: failures.length === 0,
    failures,
    observed: metadata
      ? {
          provenance: metadata.provenance || null,
          ciPersisted: metadata.ciPersisted === true,
          ciRunId: metadata.ciRunId || null,
          ciCommitSha: metadata.ciCommitSha || null,
          status: metadata.status || null,
        }
      : null,
  }

  fs.writeFileSync(path.join(generatedDir, 'live-deployment-proof-provenance-validation.json'), JSON.stringify(result, null, 2))
  fs.writeFileSync(
    path.join(generatedDir, 'live-deployment-proof-provenance-validation.md'),
    [
      '# Live Deployment Proof Provenance Validation',
      '',
      `- Packet: ${packet}`,
      `- Generated: ${result.generatedAt}`,
      `- success: ${result.success}`,
      '',
      '## Observed',
      `- provenance: ${result.observed?.provenance || 'none'}`,
      `- ciPersisted: ${result.observed?.ciPersisted ?? false}`,
      `- ciRunId: ${result.observed?.ciRunId || 'none'}`,
      `- ciCommitSha: ${result.observed?.ciCommitSha || 'none'}`,
      `- status: ${result.observed?.status || 'none'}`,
      '',
      '## Failures',
      ...(failures.length ? failures.map((item) => `- ${item}`) : ['- none']),
      '',
    ].join('\n'),
  )

  if (failures.length > 0) {
    console.error('Live deployment proof provenance not yet verified.')
    process.exit(1)
  }

  console.log(`Live deployment proof provenance verified for packet ${packet}.`)
}

main()
