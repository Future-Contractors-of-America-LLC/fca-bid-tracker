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

function readJson(file) {
  if (!fs.existsSync(file)) return null
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'))
  } catch {
    return null
  }
}

function main() {
  const repoRoot = path.join(path.dirname(new URL(import.meta.url).pathname), '..')
  const packet = readContinuityPacket(repoRoot)
  const generatedDir = path.join(repoRoot, 'generated')
  fs.mkdirSync(generatedDir, { recursive: true })

  const target = readJson(path.join(generatedDir, 'build-proof-transition-target.json'))
  const success = Boolean(target?.targetReached)
  const failures = success
    ? []
    : (target?.records || []).filter((item) => !(item.exists && item.provenance === 'github_actions_ci' && item.ciPersisted)).map((item) => `rewrite not yet CI-backed: ${item.file}`)

  const result = {
    packet,
    generatedAt: new Date().toISOString(),
    success,
    failures,
  }

  fs.writeFileSync(path.join(generatedDir, 'build-proof-ci-rewrite-transition-validation.json'), JSON.stringify(result, null, 2))
  fs.writeFileSync(
    path.join(generatedDir, 'build-proof-ci-rewrite-transition-validation.md'),
    [
      '# Build Proof CI Rewrite Transition Validation',
      '',
      `- Packet: ${packet}`,
      `- Generated: ${result.generatedAt}`,
      `- success: ${success}`,
      '',
      '## Failures',
      ...(failures.length ? failures.map((item) => `- ${item}`) : ['- none']),
      '',
    ].join('\n'),
  )

  if (!success) {
    console.error('Build proof CI rewrite transition not yet verified.')
    process.exit(1)
  }

  console.log(`Build proof CI rewrite transition verified for packet ${packet}.`)
}

main()
