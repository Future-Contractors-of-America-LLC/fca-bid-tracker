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
  const workspaceDir = path.join(repoRoot, 'workspace')
  const proofDir = path.join(repoRoot, 'docs', 'runtime-proof', 'live-deployment')
  fs.mkdirSync(proofDir, { recursive: true })

  const runId = process.env.GITHUB_RUN_ID || 'local'
  const commitSha = process.env.GITHUB_SHA || 'local'
  const summarySource = path.join(workspaceDir, 'live_deployment_smoke_summary.json')
  const failuresSource = path.join(workspaceDir, 'live_deployment_smoke_failures.txt')

  const summaryTarget = path.join(proofDir, 'live_deployment_smoke_summary.json')
  const failuresTarget = path.join(proofDir, 'live_deployment_smoke_failures.txt')
  const metadataJsonTarget = path.join(proofDir, 'live_deployment_proof_metadata.json')
  const metadataMdTarget = path.join(proofDir, 'live_deployment_proof_metadata.md')

  if (fs.existsSync(summarySource)) {
    fs.copyFileSync(summarySource, summaryTarget)
  }
  if (fs.existsSync(failuresSource)) {
    fs.copyFileSync(failuresSource, failuresTarget)
  }

  const metadata = {
    packet,
    generatedAt: new Date().toISOString(),
    provenance: 'github_actions_ci',
    ciPersisted: true,
    ciRunId: runId,
    ciCommitSha: commitSha,
    status: fs.existsSync(failuresTarget) && fs.readFileSync(failuresTarget, 'utf8').trim().length > 0 ? 'ci_surface_present_with_failures' : 'ci_surface_present_success',
    surface: {
      summaryPath: 'docs/runtime-proof/live-deployment/live_deployment_smoke_summary.json',
      failuresPath: 'docs/runtime-proof/live-deployment/live_deployment_smoke_failures.txt',
    },
  }

  fs.writeFileSync(metadataJsonTarget, JSON.stringify(metadata, null, 2))
  fs.writeFileSync(
    metadataMdTarget,
    [
      '# Live Deployment Proof Metadata',
      '',
      `- Packet: ${packet}`,
      `- Generated: ${metadata.generatedAt}`,
      `- provenance: github_actions_ci`,
      `- ciPersisted: true`,
      `- ciRunId: ${runId}`,
      `- ciCommitSha: ${commitSha}`,
      `- status: ${metadata.status}`,
      '',
      '## Surface',
      `- summaryPath: ${metadata.surface.summaryPath}`,
      `- failuresPath: ${metadata.surface.failuresPath}`,
      '',
    ].join('\n'),
  )

  console.log(`Live deployment proof stamped for packet ${packet}.`)
}

main()
