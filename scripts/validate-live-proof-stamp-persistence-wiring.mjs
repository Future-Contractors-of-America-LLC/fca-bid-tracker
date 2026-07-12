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

const repoRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const packet = readContinuityPacket(repoRoot)
const generatedDir = path.join(repoRoot, 'generated')
const workflowPath = path.join(repoRoot, '.github', 'workflows', 'live-deployment-proof-stamp.yml')
fs.mkdirSync(generatedDir, { recursive: true })

const source = fs.existsSync(workflowPath) ? fs.readFileSync(workflowPath, 'utf8') : ''
const checks = {
  commitsCurrentHeadVerifier: source.includes('generated/live-deployment-current-head-verifier-validation.json') && source.includes('generated/live-deployment-current-head-verifier-report.json'),
  commitsMetadataTransition: source.includes('generated/live-deployment-metadata-transition-state-validation.json') && source.includes('generated/live-deployment-metadata-transition-state-report.json'),
  commitsProofBundleReadiness: source.includes('generated/live-deployment-proof-bundle-readiness-validation.json') && source.includes('generated/live-deployment-proof-bundle-readiness-report.json'),
  commitsBuildCoverage: source.includes('generated/build-validation-live-proof-coverage-validation.json') && source.includes('generated/build-validation-live-proof-coverage-report.json'),
  commitsStampCoverage: source.includes('generated/live-proof-stamp-coverage-validation.json') && source.includes('generated/live-proof-stamp-coverage-report.json'),
  runsCurrentHeadVerifier: source.includes('node scripts/validate-live-deployment-current-head-verifier.mjs'),
  runsMetadataTransition: source.includes('node scripts/validate-live-deployment-metadata-transition-state.mjs'),
  runsProofBundleReadiness: source.includes('node scripts/validate-live-deployment-proof-bundle-readiness.mjs'),
}
const failures = Object.entries(checks).filter(([, value]) => !value).map(([key]) => key)
const result = { packet, generatedAt: new Date().toISOString(), checks, success: failures.length === 0, failures }

fs.writeFileSync(path.join(generatedDir, 'live-proof-stamp-persistence-wiring-validation.json'), JSON.stringify(result, null, 2))
fs.writeFileSync(path.join(generatedDir, 'live-proof-stamp-persistence-wiring-validation.md'), ['# Live Proof Stamp Persistence Wiring Validation','',`- Packet: ${packet}`,`- Generated: ${result.generatedAt}`,`- success: ${result.success}`,'','## Checks',...Object.entries(checks).map(([key,value]) => `- ${key}: ${value}`),'','## Failures',...(failures.length ? failures.map((item) => `- ${item}`) : ['- none']),''].join('\n'))

if (failures.length > 0) {
  console.error('Live proof stamp persistence wiring is incomplete.')
  process.exit(1)
}

console.log(`Live proof stamp persistence wiring validated for packet ${packet}.`)
