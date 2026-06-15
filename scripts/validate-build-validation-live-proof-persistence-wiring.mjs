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
const workflowPath = path.join(repoRoot, '.github', 'workflows', 'build-validation.yml')
fs.mkdirSync(generatedDir, { recursive: true })

const source = fs.existsSync(workflowPath) ? fs.readFileSync(workflowPath, 'utf8') : ''
const checks = {
  persistsCurrentHeadVerifier: source.includes('generated/live-deployment-current-head-verifier-validation.json') && source.includes('docs/runtime-proof/live-deployment/live-deployment-current-head-verifier-validation.json'),
  persistsMetadataTransition: source.includes('generated/live-deployment-metadata-transition-state-validation.json') && source.includes('docs/runtime-proof/live-deployment/live-deployment-metadata-transition-state-validation.json'),
  persistsProofBundleReadiness: source.includes('generated/live-deployment-proof-bundle-readiness-validation.json') && source.includes('docs/runtime-proof/live-deployment/live-deployment-proof-bundle-readiness-validation.json'),
  persistsBuildCoverage: source.includes('generated/build-validation-live-proof-coverage-validation.json') && source.includes('docs/runtime-proof/live-deployment/build-validation-live-proof-coverage-validation.json'),
  persistsStampCoverage: source.includes('generated/live-proof-stamp-coverage-validation.json') && source.includes('docs/runtime-proof/live-deployment/live-proof-stamp-coverage-validation.json'),
  uploadsCurrentHeadVerifier: source.includes('generated/live-deployment-current-head-verifier-report.json'),
  uploadsMetadataTransition: source.includes('generated/live-deployment-metadata-transition-state-report.json'),
  uploadsProofBundleReadiness: source.includes('generated/live-deployment-proof-bundle-readiness-report.json'),
}
const failures = Object.entries(checks).filter(([, value]) => !value).map(([key]) => key)
const result = { packet, generatedAt: new Date().toISOString(), checks, success: failures.length === 0, failures }

fs.writeFileSync(path.join(generatedDir, 'build-validation-live-proof-persistence-wiring-validation.json'), JSON.stringify(result, null, 2))
fs.writeFileSync(path.join(generatedDir, 'build-validation-live-proof-persistence-wiring-validation.md'), ['# Build Validation Live Proof Persistence Wiring Validation','',`- Packet: ${packet}`,`- Generated: ${result.generatedAt}`,`- success: ${result.success}`,'','## Checks',...Object.entries(checks).map(([key,value]) => `- ${key}: ${value}`),'','## Failures',...(failures.length ? failures.map((item) => `- ${item}`) : ['- none']),''].join('\n'))

if (failures.length > 0) {
  console.error('Build validation workflow persistence wiring is incomplete.')
  process.exit(1)
}

console.log(`Build validation live proof persistence wiring validated for packet ${packet}.`)
