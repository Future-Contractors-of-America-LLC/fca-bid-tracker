import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

function readJson(file) {
  if (!fs.existsSync(file)) return null
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'))
  } catch {
    return null
  }
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
fs.mkdirSync(generatedDir, { recursive: true })

const witnessCommit = readJson(path.join(generatedDir, 'live-deployment-witness-commit-observation-validation.json'))
const ciProofCommit = readJson(path.join(generatedDir, 'live-deployment-ci-proof-commit-observation-validation.json'))
const runWitness = readJson(path.join(generatedDir, 'live-deployment-run-witness-validation.json'))
const proofProvenance = readJson(path.join(generatedDir, 'live-deployment-proof-provenance-validation.json'))

const checks = {
  witnessCommitObserved: Boolean(witnessCommit?.success),
  ciProofCommitObserved: Boolean(ciProofCommit?.success),
  runWitnessSurfaceValid: Boolean(runWitness?.success),
  proofMetadataCiBacked: Boolean(proofProvenance?.success),
}

const failures = Object.entries(checks).filter(([, value]) => !value).map(([key]) => key)
const result = {
  packet,
  generatedAt: new Date().toISOString(),
  checks,
  success: failures.length === 0,
  failures,
  observed: {
    witnessCommitSha: witnessCommit?.latestCommitSha || null,
    ciProofCommitSha: ciProofCommit?.latestCommitSha || null,
    proofMetadataStatus: proofProvenance?.observed?.status || null,
  },
}

fs.writeFileSync(path.join(generatedDir, 'live-deployment-proof-suite-validation.json'), JSON.stringify(result, null, 2))
fs.writeFileSync(
  path.join(generatedDir, 'live-deployment-proof-suite-validation.md'),
  [
    '# Live Deployment Proof Suite Validation',
    '',
    `- Packet: ${packet}`,
    `- Generated: ${result.generatedAt}`,
    `- success: ${result.success}`,
    '',
    '## Checks',
    ...Object.entries(checks).map(([key, value]) => `- ${key}: ${value}`),
    '',
    '## Observed',
    `- witnessCommitSha: ${result.observed.witnessCommitSha || 'none'}`,
    `- ciProofCommitSha: ${result.observed.ciProofCommitSha || 'none'}`,
    `- proofMetadataStatus: ${result.observed.proofMetadataStatus || 'none'}`,
    '',
    '## Failures',
    ...(failures.length ? failures.map((item) => `- ${item}`) : ['- none']),
    '',
  ].join('\n'),
)

if (failures.length > 0) {
  console.error('Live deployment proof suite not yet fully verified.')
  process.exit(1)
}

console.log(`Live deployment proof suite validated for packet ${packet}.`)
