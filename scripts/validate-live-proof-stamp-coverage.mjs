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
const workflowPath = path.join(repoRoot, '.github', 'workflows', 'live-deployment-proof-stamp.yml')
fs.mkdirSync(generatedDir, { recursive: true })

const source = fs.existsSync(workflowPath) ? fs.readFileSync(workflowPath, 'utf8') : ''
const checks = {
  validatesCurrentHeadVerifier: source.includes('node scripts/validate-live-deployment-current-head-verifier.mjs'),
  reportsCurrentHeadVerifier: source.includes('node scripts/generate-live-deployment-current-head-verifier-report.mjs'),
  validatesMetadataTransition: source.includes('node scripts/validate-live-deployment-metadata-transition-state.mjs'),
  reportsMetadataTransition: source.includes('node scripts/generate-live-deployment-metadata-transition-state-report.mjs'),
  validatesProofBundleReadiness: source.includes('node scripts/validate-live-deployment-proof-bundle-readiness.mjs'),
  reportsProofBundleReadiness: source.includes('node scripts/generate-live-deployment-proof-bundle-readiness-report.mjs'),
  commitsCurrentHeadVerifier: source.includes('generated/live-deployment-current-head-verifier-validation.json'),
  commitsMetadataTransition: source.includes('generated/live-deployment-metadata-transition-state-validation.json'),
  commitsProofBundleReadiness: source.includes('generated/live-deployment-proof-bundle-readiness-validation.json'),
}
const failures = Object.entries(checks).filter(([, value]) => !value).map(([key]) => key)
const result = {
  packet,
  generatedAt: new Date().toISOString(),
  checks,
  success: failures.length === 0,
  failures,
}

fs.writeFileSync(path.join(generatedDir, 'live-proof-stamp-coverage-validation.json'), JSON.stringify(result, null, 2))
fs.writeFileSync(
  path.join(generatedDir, 'live-proof-stamp-coverage-validation.md'),
  [
    '# Live Proof Stamp Coverage Validation',
    '',
    `- Packet: ${packet}`,
    `- Generated: ${result.generatedAt}`,
    `- success: ${result.success}`,
    '',
    '## Checks',
    ...Object.entries(checks).map(([key, value]) => `- ${key}: ${value}`),
    '',
    '## Failures',
    ...(failures.length ? failures.map((item) => `- ${item}`) : ['- none']),
    '',
  ].join('\n'),
)

if (failures.length > 0) {
  console.error('Live proof stamp workflow does not fully cover current 061V controls.')
  process.exit(1)
}

console.log(`Live proof stamp coverage validated for packet ${packet}.`)
