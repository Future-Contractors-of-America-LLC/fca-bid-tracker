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
const workflowPath = path.join(repoRoot, '.github', 'workflows', 'build-validation.yml')
fs.mkdirSync(generatedDir, { recursive: true })

const source = fs.existsSync(workflowPath) ? fs.readFileSync(workflowPath, 'utf8') : ''
const checks = {
  validatesCurrentHeadVerifier: source.includes('npm run validate:live-deployment-current-head-verifier'),
  reportsCurrentHeadVerifier: source.includes('npm run generate:live-deployment-current-head-verifier-report'),
  validatesMetadataTransition: source.includes('npm run validate:live-deployment-metadata-transition-state'),
  reportsMetadataTransition: source.includes('npm run generate:live-deployment-metadata-transition-state-report'),
  validatesProofBundleReadiness: source.includes('npm run validate:live-deployment-proof-bundle-readiness'),
  reportsProofBundleReadiness: source.includes('npm run generate:live-deployment-proof-bundle-readiness-report'),
  persistsCurrentHeadVerifier: source.includes('generated/live-deployment-current-head-verifier-validation.json'),
  persistsMetadataTransition: source.includes('generated/live-deployment-metadata-transition-state-validation.json'),
  persistsProofBundleReadiness: source.includes('generated/live-deployment-proof-bundle-readiness-validation.json'),
}
const failures = Object.entries(checks).filter(([, value]) => !value).map(([key]) => key)
const result = {
  packet,
  generatedAt: new Date().toISOString(),
  checks,
  success: failures.length === 0,
  failures,
}

fs.writeFileSync(path.join(generatedDir, 'build-validation-live-proof-coverage-validation.json'), JSON.stringify(result, null, 2))
fs.writeFileSync(
  path.join(generatedDir, 'build-validation-live-proof-coverage-validation.md'),
  [
    '# Build Validation Live Proof Coverage Validation',
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
  console.error('Build validation workflow does not fully cover live proof controls.')
  process.exit(1)
}

console.log(`Build validation live proof coverage validated for packet ${packet}.`)
