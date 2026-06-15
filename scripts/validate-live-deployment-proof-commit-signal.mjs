import fs from 'fs'
import path from 'path'
import { execSync } from 'child_process'

function readContinuityPacket(repoRoot) {
  const ledgerPath = path.join(repoRoot, 'docs', 'FCA_EXECUTION_CONTINUITY_LEDGER.md')
  const fallbackPacket = 'UNLOCKED'
  if (!fs.existsSync(ledgerPath)) return fallbackPacket
  const ledger = fs.readFileSync(ledgerPath, 'utf8')
  const match = ledger.match(/- Active packet: `([^`]+)`/)
  return match ? match[1] : fallbackPacket
}

function readLatestMatchingCommit(repoRoot, pattern) {
  try {
    const output = execSync(`git log --grep="${pattern}" --format=%H%x09%s -n 1`, {
      cwd: repoRoot,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim()

    if (!output) {
      return { observed: false, commitSha: null, commitMessage: null }
    }

    const [commitSha, commitMessage] = output.split('\t')
    return {
      observed: Boolean(commitSha),
      commitSha: commitSha || null,
      commitMessage: commitMessage || null,
    }
  } catch {
    return { observed: false, commitSha: null, commitMessage: null }
  }
}

function main() {
  const repoRoot = path.join(path.dirname(new URL(import.meta.url).pathname), '..')
  const packet = readContinuityPacket(repoRoot)
  const generatedDir = path.join(repoRoot, 'generated')
  fs.mkdirSync(generatedDir, { recursive: true })

  const observation = readLatestMatchingCommit(repoRoot, 'Persist CI-backed live deployment proof for run')
  const result = {
    packet,
    generatedAt: new Date().toISOString(),
    expectedCommitPattern: 'Persist CI-backed live deployment proof for run ...',
    observed: observation.observed,
    latestCommitSha: observation.commitSha,
    latestCommitMessage: observation.commitMessage,
    success: observation.observed,
  }

  fs.writeFileSync(path.join(generatedDir, 'live-deployment-proof-commit-signal-validation.json'), JSON.stringify(result, null, 2))
  fs.writeFileSync(
    path.join(generatedDir, 'live-deployment-proof-commit-signal-validation.md'),
    [
      '# Live Deployment Proof Commit Signal Validation',
      '',
      `- Packet: ${packet}`,
      `- Generated: ${result.generatedAt}`,
      `- expectedCommitPattern: ${result.expectedCommitPattern}`,
      `- observed: ${result.observed}`,
      `- latestCommitSha: ${result.latestCommitSha || 'none'}`,
      `- latestCommitMessage: ${result.latestCommitMessage || 'none'}`,
      `- success: ${result.success}`,
      '',
    ].join('\n'),
  )

  if (!observation.observed) {
    console.error('Live deployment proof commit signal not yet observed in repo-visible history.')
    process.exit(1)
  }

  console.log(`Live deployment proof commit signal observed for packet ${packet}.`)
}

main()
