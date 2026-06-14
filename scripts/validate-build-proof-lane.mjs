import fs from 'fs'
import path from 'path'

function expectIncludes(source, fragment, sourceName, failures) {
  if (!source.includes(fragment)) {
    failures.push(`Missing required fragment in ${sourceName}: ${fragment}`)
  }
}

function read(repoRoot, relativePath) {
  return fs.readFileSync(path.join(repoRoot, relativePath), 'utf8')
}

function readContinuityPacket(repoRoot) {
  const ledgerPath = path.join(repoRoot, 'docs', 'FCA_EXECUTION_CONTINUITY_LEDGER.md')
  const fallbackPacket = 'UNLOCKED'

  if (!fs.existsSync(ledgerPath)) {
    return fallbackPacket
  }

  const ledger = fs.readFileSync(ledgerPath, 'utf8')
  const match = ledger.match(/- Active packet: `([^`]+)`/)
  return match ? match[1] : fallbackPacket
}

function main() {
  const repoRoot = path.join(path.dirname(new URL(import.meta.url).pathname), '..')
  const packageSource = read(repoRoot, 'package.json')
  const workflowSource = read(repoRoot, '.github/workflows/build-validation.yml')
  const failures = []

  expectIncludes(packageSource, '"validate:build-proof-lane"', 'package.json', failures)
  expectIncludes(packageSource, '"generate:build-proof-lane-report"', 'package.json', failures)

  expectIncludes(workflowSource, 'name: FCA Build Validation', '.github/workflows/build-validation.yml', failures)
  expectIncludes(workflowSource, 'npm run capture:build-evidence', '.github/workflows/build-validation.yml', failures)
  expectIncludes(workflowSource, 'npm run validate:build-proof-lane', '.github/workflows/build-validation.yml', failures)
  expectIncludes(workflowSource, 'npm run generate:build-proof-lane-report', '.github/workflows/build-validation.yml', failures)
  expectIncludes(workflowSource, 'docs/runtime-proof/build-validation/build-proof-lane-report.json', '.github/workflows/build-validation.yml', failures)
  expectIncludes(workflowSource, 'docs/runtime-proof/build-validation/build-proof-lane-report.md', '.github/workflows/build-validation.yml', failures)
  expectIncludes(workflowSource, 'generated/build-proof-lane-report.json', '.github/workflows/build-validation.yml', failures)
  expectIncludes(workflowSource, 'generated/build-proof-lane-report.md', '.github/workflows/build-validation.yml', failures)

  const packet = readContinuityPacket(repoRoot)
  const result = {
    packet,
    generatedAt: new Date().toISOString(),
    success: failures.length === 0,
    failures,
  }

  const generatedDir = path.join(repoRoot, 'generated')
  fs.mkdirSync(generatedDir, { recursive: true })
  fs.writeFileSync(path.join(generatedDir, 'build-proof-lane-validation.json'), JSON.stringify(result, null, 2))
  fs.writeFileSync(
    path.join(generatedDir, 'build-proof-lane-validation.md'),
    [
      '# Build Proof Lane Validation',
      '',
      `- Packet: ${packet}`,
      `- Generated: ${result.generatedAt}`,
      `- Success: ${result.success}`,
      '',
      '## Failures',
      ...(failures.length ? failures.map((item) => `- ${item}`) : ['- none']),
      '',
    ].join('\n'),
  )

  if (failures.length > 0) {
    console.error('Build proof lane validation failed:')
    for (const failure of failures) {
      console.error(`- ${failure}`)
    }
    process.exit(1)
  }

  console.log(`Build proof lane validation passed for packet ${packet}.`)
}

main()
