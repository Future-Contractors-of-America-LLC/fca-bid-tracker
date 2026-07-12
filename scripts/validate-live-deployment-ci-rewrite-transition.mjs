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

function readJson(file) {
  if (!fs.existsSync(file)) return null
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'))
  } catch {
    return null
  }
}

function main() {
  const repoRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
  const packet = readContinuityPacket(repoRoot)
  const generatedDir = path.join(repoRoot, 'generated')
  fs.mkdirSync(generatedDir, { recursive: true })

  const target = readJson(path.join(generatedDir, 'live-deployment-transition-target.json'))
  const success = Boolean(target?.targetReached)
  const failures = success ? [] : ['live deployment CI-backed rewrite not yet verified']

  const result = {
    packet,
    generatedAt: new Date().toISOString(),
    success,
    failures,
  }

  fs.writeFileSync(path.join(generatedDir, 'live-deployment-ci-rewrite-transition-validation.json'), JSON.stringify(result, null, 2))
  fs.writeFileSync(
    path.join(generatedDir, 'live-deployment-ci-rewrite-transition-validation.md'),
    [
      '# Live Deployment CI Rewrite Transition Validation',
      '',
      `- Packet: ${packet}`,
      `- Generated: ${result.generatedAt}`,
      `- success: ${result.success}`,
      '',
      '## Failures',
      ...(failures.length ? failures.map((item) => `- ${item}`) : ['- none']),
      '',
    ].join('\n'),
  )

  if (!success) {
    console.error('Live deployment CI rewrite transition not yet verified.')
    process.exit(1)
  }

  console.log(`Live deployment CI rewrite transition verified for packet ${packet}.`)
}

main()
