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

function readJson(file) {
  if (!fs.existsSync(file)) return null
  try { return JSON.parse(fs.readFileSync(file, 'utf8')) } catch { return null }
}

function readLatestMatchingCommit(repoRoot, pattern) {
  try {
    const output = execSync(`git log --grep="${pattern}" --format=%H%x09%s -n 1`, { cwd: repoRoot, encoding: 'utf8', stdio: ['ignore','pipe','ignore'] }).trim()
    if (!output) return { observed: false, commitSha: null, commitMessage: null }
    const [commitSha, commitMessage] = output.split('\t')
    return { observed: Boolean(commitSha), commitSha: commitSha || null, commitMessage: commitMessage || null }
  } catch {
    return { observed: false, commitSha: null, commitMessage: null }
  }
}

const repoRoot = path.join(path.dirname(new URL(import.meta.url).pathname), '..')
const packet = readContinuityPacket(repoRoot)
const generatedDir = path.join(repoRoot, 'generated')
fs.mkdirSync(generatedDir, { recursive: true })

const witnessCommit = readLatestMatchingCommit(repoRoot, 'Persist live deployment run witness for run')
const witness = readJson(path.join(repoRoot, 'docs', 'runtime-proof', 'live-deployment', 'live_deployment_ci_run_witness.json'))
const failures = []
if (!witnessCommit.observed) failures.push('repo-visible live deployment run witness commit not yet observed')
if (!witness) failures.push('live_deployment_ci_run_witness.json missing')
if (witness && witness.provenance !== 'github_actions_ci') failures.push('live deployment run witness provenance is not github_actions_ci')
if (witness && witness.ciPersisted !== true) failures.push('live deployment run witness ciPersisted is not true')
if (witness && witnessCommit.commitSha && witness.ciCommitSha !== '69eb2baf8efd66d08f7cf0861e95ad0d0b9e04eb') failures.push('live deployment run witness does not point at the expected source commit for the observed witness run')

const result = {
  packet,
  generatedAt: new Date().toISOString(),
  observedCommitSha: witnessCommit.commitSha,
  observedCommitMessage: witnessCommit.commitMessage,
  observedWitness: witness ? {
    provenance: witness.provenance || null,
    ciPersisted: witness.ciPersisted === true,
    ciRunId: witness.ciRunId || null,
    ciCommitSha: witness.ciCommitSha || null,
    workflow: witness.workflow || null,
  } : null,
  success: failures.length === 0,
  failures,
}

fs.writeFileSync(path.join(generatedDir, 'live-proof-witness-observed-state-validation.json'), JSON.stringify(result, null, 2))
fs.writeFileSync(path.join(generatedDir, 'live-proof-witness-observed-state-validation.md'), ['# Live Proof Witness Observed State Validation','',`- Packet: ${packet}`,`- Generated: ${result.generatedAt}`,`- success: ${result.success}`,`- observedCommitSha: ${result.observedCommitSha || 'none'}`,`- observedCommitMessage: ${result.observedCommitMessage || 'none'}`,'','## Observed Witness',`- provenance: ${result.observedWitness?.provenance || 'none'}`,`- ciPersisted: ${result.observedWitness?.ciPersisted ?? false}`,`- ciRunId: ${result.observedWitness?.ciRunId || 'none'}`,`- ciCommitSha: ${result.observedWitness?.ciCommitSha || 'none'}`,`- workflow: ${result.observedWitness?.workflow || 'none'}`,'','## Failures',...(failures.length ? failures.map((item) => `- ${item}`) : ['- none']),''].join('\n'))

if (failures.length > 0) {
  console.error('Live proof witness observed state remains unverified.')
  process.exit(1)
}

console.log(`Live proof witness observed state validated for packet ${packet}.`)
