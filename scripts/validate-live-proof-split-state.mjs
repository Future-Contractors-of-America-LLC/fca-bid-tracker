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
const proofCommit = readLatestMatchingCommit(repoRoot, 'Persist CI-backed live deployment proof for run')
const metadata = readJson(path.join(repoRoot, 'docs', 'runtime-proof', 'live-deployment', 'live_deployment_proof_metadata.json'))
const failures = []
if (!witnessCommit.observed) failures.push('witness commit is not observed')
if (proofCommit.observed) failures.push('CI-backed live deployment proof commit is already observed; split-state lock no longer applies')
if (!metadata) failures.push('live deployment proof metadata missing')
if (metadata && metadata.provenance !== 'manual_repo_backfill') failures.push('metadata provenance is no longer manual_repo_backfill; split-state lock no longer applies')
if (metadata && metadata.ciPersisted !== false) failures.push('metadata ciPersisted is no longer false; split-state lock no longer applies')

const result = {
  packet,
  generatedAt: new Date().toISOString(),
  witnessCommitSha: witnessCommit.commitSha,
  proofCommitSha: proofCommit.commitSha,
  metadataState: metadata ? { provenance: metadata.provenance || null, ciPersisted: metadata.ciPersisted === true, status: metadata.status || null } : null,
  success: failures.length === 0,
  failures,
}

fs.writeFileSync(path.join(generatedDir, 'live-proof-split-state-validation.json'), JSON.stringify(result, null, 2))
fs.writeFileSync(path.join(generatedDir, 'live-proof-split-state-validation.md'), ['# Live Proof Split State Validation','',`- Packet: ${packet}`,`- Generated: ${result.generatedAt}`,`- success: ${result.success}`,`- witnessCommitSha: ${result.witnessCommitSha || 'none'}`,`- proofCommitSha: ${result.proofCommitSha || 'none'}`,'','## Metadata State',`- provenance: ${result.metadataState?.provenance || 'none'}`,`- ciPersisted: ${result.metadataState?.ciPersisted ?? false}`,`- status: ${result.metadataState?.status || 'none'}`,'','## Failures',...(failures.length ? failures.map((item) => `- ${item}`) : ['- none']),''].join('\n'))

if (failures.length > 0) {
  console.error('Live proof split state is not in the expected current truth state.')
  process.exit(1)
}

console.log(`Live proof split state validated for packet ${packet}.`)
