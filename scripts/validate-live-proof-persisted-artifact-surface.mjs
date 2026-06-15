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

const repoRoot = path.join(path.dirname(new URL(import.meta.url).pathname), '..')
const packet = readContinuityPacket(repoRoot)
const generatedDir = path.join(repoRoot, 'generated')
const liveProofDir = path.join(repoRoot, 'docs', 'runtime-proof', 'live-deployment')
fs.mkdirSync(generatedDir, { recursive: true })

const requiredFiles = [
  'live-deployment-current-head-verifier-validation.json',
  'live-deployment-current-head-verifier-report.json',
  'live-deployment-metadata-transition-state-validation.json',
  'live-deployment-metadata-transition-state-report.json',
  'live-deployment-proof-bundle-readiness-validation.json',
  'live-deployment-proof-bundle-readiness-report.json',
  'build-validation-live-proof-coverage-validation.json',
  'build-validation-live-proof-coverage-report.json',
  'live-proof-stamp-coverage-validation.json',
  'live-proof-stamp-coverage-report.json',
]

const missing = requiredFiles.filter((file) => !fs.existsSync(path.join(liveProofDir, file)))
const result = {
  packet,
  generatedAt: new Date().toISOString(),
  requiredFiles,
  missing,
  success: missing.length === 0,
}

fs.writeFileSync(path.join(generatedDir, 'live-proof-persisted-artifact-surface-validation.json'), JSON.stringify(result, null, 2))
fs.writeFileSync(path.join(generatedDir, 'live-proof-persisted-artifact-surface-validation.md'), ['# Live Proof Persisted Artifact Surface Validation','',`- Packet: ${packet}`,`- Generated: ${result.generatedAt}`,`- success: ${result.success}`,'','## Missing',...(missing.length ? missing.map((item) => `- ${item}`) : ['- none']),''].join('\n'))

if (missing.length > 0) {
  console.error('Persisted live proof artifact surface is not yet complete.')
  process.exit(1)
}

console.log(`Persisted live proof artifact surface validated for packet ${packet}.`)
