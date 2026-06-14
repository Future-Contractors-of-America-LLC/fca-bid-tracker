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
  const generatedDir = path.join(repoRoot, 'generated')
  fs.mkdirSync(generatedDir, { recursive: true })

  const validation = readJson(path.join(generatedDir, 'build-proof-presence-validation.json'))
  const runtimeSmoke = readJson(path.join(repoRoot, 'docs', 'runtime-proof', 'runtime-smoke', 'runtime-smoke-check-report.json'))

  const report = {
    packet,
    generatedAt: new Date().toISOString(),
    summary: {
      runtimeSmokeRepoVisible: Boolean(runtimeSmoke),
      runtimeSmokePassing: runtimeSmoke ? runtimeSmoke.failed === 0 : false,
      buildProofRepoVisible: Boolean(validation?.proofDirectoryPresent),
      buildProofPresencePass: Boolean(validation?.success),
    },
    presentFiles: validation?.presentFiles || [],
    failures: validation?.failures || [],
  }

  fs.writeFileSync(path.join(generatedDir, 'build-proof-presence-report.json'), JSON.stringify(report, null, 2))
  fs.writeFileSync(
    path.join(generatedDir, 'build-proof-presence-report.md'),
    [
      '# Build Proof Presence Report',
      '',
      `- Packet: ${packet}`,
      `- Generated: ${report.generatedAt}`,
      '',
      '## Summary',
      `- runtimeSmokeRepoVisible: ${report.summary.runtimeSmokeRepoVisible}`,
      `- runtimeSmokePassing: ${report.summary.runtimeSmokePassing}`,
      `- buildProofRepoVisible: ${report.summary.buildProofRepoVisible}`,
      `- buildProofPresencePass: ${report.summary.buildProofPresencePass}`,
      '',
      '## Present files',
      ...(report.presentFiles.length ? report.presentFiles.map((item) => `- ${item}`) : ['- none']),
      '',
      '## Failures',
      ...(report.failures.length ? report.failures.map((item) => `- ${item}`) : ['- none']),
      '',
    ].join('\n'),
  )

  console.log(`Build proof presence report generated for packet ${packet}.`)
}

main()
