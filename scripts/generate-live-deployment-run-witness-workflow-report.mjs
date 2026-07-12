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
const source = readJson(path.join(generatedDir, 'live-deployment-run-witness-workflow-validation.json'))
const report = {
  packet,
  generatedAt: new Date().toISOString(),
  success: Boolean(source?.success),
  failures: source?.failures || [],
}
fs.writeFileSync(path.join(generatedDir, 'live-deployment-run-witness-workflow-report.json'), JSON.stringify(report, null, 2))
fs.writeFileSync(
  path.join(generatedDir, 'live-deployment-run-witness-workflow-report.md'),
  [
    '# Live Deployment Run Witness Workflow Report',
    '',
    `- Packet: ${packet}`,
    `- Generated: ${report.generatedAt}`,
    `- success: ${report.success}`,
    '',
    '## Failures',
    ...(report.failures.length ? report.failures.map((item) => `- ${item}`) : ['- none']),
    '',
  ].join('\n'),
)

console.log(`Live deployment run witness workflow report generated for packet ${packet}.`)
