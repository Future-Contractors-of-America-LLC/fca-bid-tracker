import fs from 'fs'
import path from 'path'

function readJson(file) {
  if (!fs.existsSync(file)) return null
  try { return JSON.parse(fs.readFileSync(file, 'utf8')) } catch { return null }
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
const source = readJson(path.join(generatedDir, 'live-proof-witness-observed-state-validation.json'))
const report = { packet, generatedAt: new Date().toISOString(), success: Boolean(source?.success), observedCommitSha: source?.observedCommitSha || null, observedCommitMessage: source?.observedCommitMessage || null, observedWitness: source?.observedWitness || null, failures: source?.failures || [] }
fs.writeFileSync(path.join(generatedDir, 'live-proof-witness-observed-state-report.json'), JSON.stringify(report, null, 2))
fs.writeFileSync(path.join(generatedDir, 'live-proof-witness-observed-state-report.md'), ['# Live Proof Witness Observed State Report','',`- Packet: ${packet}`,`- Generated: ${report.generatedAt}`,`- success: ${report.success}`,`- observedCommitSha: ${report.observedCommitSha || 'none'}`,`- observedCommitMessage: ${report.observedCommitMessage || 'none'}`,'','## Failures',...(report.failures.length ? report.failures.map((item) => `- ${item}`) : ['- none']),''].join('\n'))
console.log(`Live proof witness observed state report generated for packet ${packet}.`)
