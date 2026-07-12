import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

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

const repoRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const packet = readContinuityPacket(repoRoot)
const generatedDir = path.join(repoRoot, 'generated')
const liveProofDir = path.join(repoRoot, 'docs', 'runtime-proof', 'live-deployment')
fs.mkdirSync(generatedDir, { recursive: true })

const currentHead = readJson(path.join(liveProofDir, 'live-deployment-current-head-verifier-validation.json'))
const metadata = readJson(path.join(liveProofDir, 'live-deployment-metadata-transition-state-validation.json'))
const bundle = readJson(path.join(liveProofDir, 'live-deployment-proof-bundle-readiness-validation.json'))
const buildCoverage = readJson(path.join(liveProofDir, 'build-validation-live-proof-coverage-validation.json'))
const stampCoverage = readJson(path.join(liveProofDir, 'live-proof-stamp-coverage-validation.json'))

const checks = {
  currentHeadPresent: Boolean(currentHead),
  metadataPresent: Boolean(metadata),
  bundlePresent: Boolean(bundle),
  buildCoveragePresent: Boolean(buildCoverage),
  stampCoveragePresent: Boolean(stampCoverage),
}
const failures = Object.entries(checks).filter(([,value]) => !value).map(([key]) => key)
const result = { packet, generatedAt: new Date().toISOString(), checks, success: failures.length === 0, failures }

fs.writeFileSync(path.join(generatedDir, 'live-proof-persisted-control-bundle-validation.json'), JSON.stringify(result, null, 2))
fs.writeFileSync(path.join(generatedDir, 'live-proof-persisted-control-bundle-validation.md'), ['# Live Proof Persisted Control Bundle Validation','',`- Packet: ${packet}`,`- Generated: ${result.generatedAt}`,`- success: ${result.success}`,'','## Checks',...Object.entries(checks).map(([key,value]) => `- ${key}: ${value}`),'','## Failures',...(failures.length ? failures.map((item) => `- ${item}`) : ['- none']),''].join('\n'))

if (failures.length > 0) {
  console.error('Persisted live proof control bundle is incomplete.')
  process.exit(1)
}

console.log(`Persisted live proof control bundle validated for packet ${packet}.`)
