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

function main() {
  const repoRoot = path.join(path.dirname(new URL(import.meta.url).pathname), '..')
  const packet = readContinuityPacket(repoRoot)
  const source = readJson(path.join(repoRoot, 'generated', 'live-deployment-proof-workflow-validation.json'))
  const report = {
    packet,
    generatedAt: new Date().toISOString(),
    success: Boolean(source?.success),
    failures: source?.failures || [],
  }
  const generatedDir = path.join(repoRoot, 'generated')
  fs.mkdirSync(generatedDir, { recursive: true })
  fs.writeFileSync(path.join(generatedDir, 'live-deployment-proof-workflow-report.json'), JSON.stringify(report, null, 2))
  fs.writeFileSync(
    path.join(generatedDir, 'live-deployment-proof-workflow-report.md'),
    [
      '# Live Deployment Proof Workflow Report',
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
  console.log(`Live deployment proof workflow report generated for packet ${packet}.`)
}

main()
