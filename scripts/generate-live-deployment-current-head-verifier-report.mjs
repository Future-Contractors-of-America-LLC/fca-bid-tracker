import fs from 'fs'
import path from 'path'

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

const repoRoot = path.join(path.dirname(new URL(import.meta.url).pathname), '..')
const packet = readContinuityPacket(repoRoot)
const generatedDir = path.join(repoRoot, 'generated')
fs.mkdirSync(generatedDir, { recursive: true })

const source = readJson(path.join(generatedDir, 'live-deployment-current-head-verifier-validation.json'))
const report = {
  packet,
  generatedAt: new Date().toISOString(),
  success: Boolean(source?.success),
  summaryPresent: Boolean(source?.summaryPresent),
  failureFileEmpty: Boolean(source?.failureFileEmpty),
  hostCount: source?.hostCount || 0,
  failures: source?.failures || [],
}

fs.writeFileSync(path.join(generatedDir, 'live-deployment-current-head-verifier-report.json'), JSON.stringify(report, null, 2))
fs.writeFileSync(
  path.join(generatedDir, 'live-deployment-current-head-verifier-report.md'),
  [
    '# Live Deployment Current-Head Verifier Report',
    '',
    `- Packet: ${packet}`,
    `- Generated: ${report.generatedAt}`,
    `- success: ${report.success}`,
    `- summaryPresent: ${report.summaryPresent}`,
    `- failureFileEmpty: ${report.failureFileEmpty}`,
    `- hostCount: ${report.hostCount}`,
    '',
    '## Failures',
    ...(report.failures.length ? report.failures.map((item) => `- ${item}`) : ['- none']),
    '',
  ].join('\n'),
)

console.log(`Current-head live verifier report generated for packet ${packet}.`)
