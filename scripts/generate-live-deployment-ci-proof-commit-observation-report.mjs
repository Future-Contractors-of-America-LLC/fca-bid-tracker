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

const repoRoot = path.join(path.dirname(new URL(import.meta.url).pathname), '..')
const packet = readContinuityPacket(repoRoot)
const generatedDir = path.join(repoRoot, 'generated')
fs.mkdirSync(generatedDir, { recursive: true })

const source = readJson(path.join(generatedDir, 'live-deployment-ci-proof-commit-observation-validation.json'))
const report = {
  packet,
  generatedAt: new Date().toISOString(),
  success: Boolean(source?.success),
  observed: Boolean(source?.observed),
  latestCommitSha: source?.latestCommitSha || null,
  latestCommitMessage: source?.latestCommitMessage || null,
}

fs.writeFileSync(path.join(generatedDir, 'live-deployment-ci-proof-commit-observation-report.json'), JSON.stringify(report, null, 2))
fs.writeFileSync(
  path.join(generatedDir, 'live-deployment-ci-proof-commit-observation-report.md'),
  [
    '# Live Deployment CI Proof Commit Observation Report',
    '',
    `- Packet: ${packet}`,
    `- Generated: ${report.generatedAt}`,
    `- success: ${report.success}`,
    `- observed: ${report.observed}`,
    `- latestCommitSha: ${report.latestCommitSha || 'none'}`,
    `- latestCommitMessage: ${report.latestCommitMessage || 'none'}`,
    '',
  ].join('\n'),
)

console.log(`Live deployment CI proof commit observation report generated for packet ${packet}.`)
