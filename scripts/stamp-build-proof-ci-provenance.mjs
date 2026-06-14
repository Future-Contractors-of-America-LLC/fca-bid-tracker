import fs from 'fs'
import path from 'path'

const JSON_FILES = [
  'build-evidence-report.json',
  'build-proof-lane-validation.json',
  'build-proof-lane-report.json',
  'packet-letter-lock-validation.json',
  'packet-letter-lock-report.json',
]

const MD_FILES = [
  'build-evidence-report.md',
  'build-proof-lane-validation.md',
  'build-proof-lane-report.md',
  'packet-letter-lock-validation.md',
  'packet-letter-lock-report.md',
]

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
  const proofDir = path.join(repoRoot, 'docs', 'runtime-proof', 'build-validation')
  const generatedDir = path.join(repoRoot, 'generated')
  fs.mkdirSync(generatedDir, { recursive: true })

  const runId = process.env.GITHUB_RUN_ID || 'local'
  const commitSha = process.env.GITHUB_SHA || 'local'
  const stamped = []
  const missing = []

  for (const file of JSON_FILES) {
    const target = path.join(proofDir, file)
    if (!fs.existsSync(target)) {
      missing.push(file)
      continue
    }
    const data = JSON.parse(fs.readFileSync(target, 'utf8'))
    data.packet = packet
    data.provenance = 'github_actions_ci'
    data.ciPersisted = true
    data.ciRunId = runId
    data.ciCommitSha = commitSha
    fs.writeFileSync(target, JSON.stringify(data, null, 2))
    stamped.push(file)
  }

  for (const file of MD_FILES) {
    const target = path.join(proofDir, file)
    if (!fs.existsSync(target)) {
      missing.push(file)
      continue
    }
    const source = fs.readFileSync(target, 'utf8')
    const lines = source.split('\n')
    const filtered = lines.filter((line) => !line.startsWith('- provenance:') && !line.startsWith('- ciPersisted:') && !line.startsWith('- ciRunId:') && !line.startsWith('- ciCommitSha:'))
    const insertAt = filtered.findIndex((line) => line.startsWith('- Packet:'))
    const additions = [
      '- provenance: github_actions_ci',
      '- ciPersisted: true',
      `- ciRunId: ${runId}`,
      `- ciCommitSha: ${commitSha}`,
    ]
    if (insertAt >= 0) {
      filtered.splice(insertAt + 1, 0, ...additions)
    } else {
      filtered.push(...additions)
    }
    fs.writeFileSync(target, filtered.join('\n'))
    stamped.push(file)
  }

  const result = {
    packet,
    generatedAt: new Date().toISOString(),
    provenance: 'github_actions_ci',
    ciPersisted: true,
    ciRunId: runId,
    ciCommitSha: commitSha,
    stamped,
    missing,
    success: missing.length === 0,
  }

  fs.writeFileSync(path.join(generatedDir, 'build-proof-ci-provenance-stamp.json'), JSON.stringify(result, null, 2))
  fs.writeFileSync(
    path.join(generatedDir, 'build-proof-ci-provenance-stamp.md'),
    [
      '# Build Proof CI Provenance Stamp',
      '',
      `- Packet: ${packet}`,
      `- provenance: github_actions_ci`,
      `- ciPersisted: true`,
      `- ciRunId: ${runId}`,
      `- ciCommitSha: ${commitSha}`,
      `- success: ${result.success}`,
      '',
      '## Stamped files',
      ...(stamped.length ? stamped.map((item) => `- ${item}`) : ['- none']),
      '',
      '## Missing files',
      ...(missing.length ? missing.map((item) => `- ${item}`) : ['- none']),
      '',
    ].join('\n'),
  )

  if (missing.length > 0) {
    console.error('Unable to stamp CI provenance for all build proof artifacts.')
    process.exit(1)
  }

  console.log(`Build proof CI provenance stamped for packet ${packet}.`)
}

main()
