import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

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
  const repoRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
  const packet = readContinuityPacket(repoRoot)
  const generatedDir = path.join(repoRoot, 'generated')
  fs.mkdirSync(generatedDir, { recursive: true })

  const metadata = readJson(path.join(repoRoot, 'docs', 'runtime-proof', 'live-deployment', 'live_deployment_proof_metadata.json'))
  const summary = readJson(path.join(repoRoot, 'docs', 'runtime-proof', 'live-deployment', 'live_deployment_smoke_summary.json'))

  const targetReached = Boolean(metadata?.provenance === 'github_actions_ci' && metadata?.ciPersisted === true)
  const result = {
    packet,
    generatedAt: new Date().toISOString(),
    targetReached,
    metadata: metadata
      ? {
          provenance: metadata.provenance || null,
          ciPersisted: metadata.ciPersisted === true,
          ciRunId: metadata.ciRunId || null,
          ciCommitSha: metadata.ciCommitSha || null,
          status: metadata.status || null,
        }
      : null,
    summaryPresent: Boolean(summary),
  }

  fs.writeFileSync(path.join(generatedDir, 'live-deployment-transition-target.json'), JSON.stringify(result, null, 2))
  fs.writeFileSync(
    path.join(generatedDir, 'live-deployment-transition-target.md'),
    [
      '# Live Deployment Transition Target',
      '',
      `- Packet: ${packet}`,
      `- Generated: ${result.generatedAt}`,
      `- targetReached: ${result.targetReached}`,
      `- summaryPresent: ${result.summaryPresent}`,
      `- provenance: ${result.metadata?.provenance || 'none'}`,
      `- ciPersisted: ${result.metadata?.ciPersisted ?? false}`,
      `- ciRunId: ${result.metadata?.ciRunId || 'none'}`,
      `- ciCommitSha: ${result.metadata?.ciCommitSha || 'none'}`,
      `- status: ${result.metadata?.status || 'none'}`,
      '',
    ].join('\n'),
  )

  console.log(`Live deployment transition target captured for packet ${packet}.`)
}

main()
