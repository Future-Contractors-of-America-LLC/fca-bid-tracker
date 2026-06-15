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
const liveProofDir = path.join(repoRoot, 'docs', 'runtime-proof', 'live-deployment')
fs.mkdirSync(generatedDir, { recursive: true })

const proofCommit = readLatestMatchingCommit(repoRoot, 'Persist CI-backed live deployment proof for run')
const surface = readJson(path.join(liveProofDir, 'live-proof-persisted-artifact-surface-validation.json'))
const bundle = readJson(path.join(liveProofDir, 'live-proof-persisted-control-bundle-validation.json'))
const failures = []
if (!proofCommit.observed) failures.push('first repo-visible CI-backed live deployment proof commit remains unobserved')
if (!surface) failures.push('persisted artifact surface validation has not yet landed in repo truth')
if (!bundle) failures.push('persisted control bundle validation has not yet landed in repo truth')

const result = {
  packet,
  generatedAt: new Date().toISOString(),
  proofCommitSha: proofCommit.commitSha,
  surfacePresent: Boolean(surface),
  bundlePresent: Boolean(bundle),
  success: failures.length === 0,
  failures,
}

fs.writeFileSync(path.join(generatedDir, 'first-persisted-control-run-gate-validation.json'), JSON.stringify(result, null, 2))
fs.writeFileSync(path.join(generatedDir, 'first-persisted-control-run-gate-validation.md'), ['# First Persisted Control Run Gate Validation','',`- Packet: ${packet}`,`- Generated: ${result.generatedAt}`,`- success: ${result.success}`,`- proofCommitSha: ${result.proofCommitSha || 'none'}`,`- surfacePresent: ${result.surfacePresent}`,`- bundlePresent: ${result.bundlePresent}`,'','## Failures',...(failures.length ? failures.map((item) => `- ${item}`) : ['- none']),''].join('\n'))

if (failures.length > 0) {
  console.error('First persisted control run gate has not yet been satisfied.')
  process.exit(1)
}

console.log(`First persisted control run gate validated for packet ${packet}.`)
