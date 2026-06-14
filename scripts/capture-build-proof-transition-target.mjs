import fs from 'fs'
import path from 'path'

const TARGET_FILES = [
  'build-evidence-report.json',
  'build-proof-lane-validation.json',
  'build-proof-lane-report.json',
  'packet-letter-lock-validation.json',
  'packet-letter-lock-report.json',
]

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
  const proofDir = path.join(repoRoot, 'docs', 'runtime-proof', 'build-validation')
  const generatedDir = path.join(repoRoot, 'generated')
  fs.mkdirSync(generatedDir, { recursive: true })

  const runId = process.env.GITHUB_RUN_ID || null
  const sha = process.env.GITHUB_SHA || null
  const records = TARGET_FILES.map((file) => {
    const data = readJson(path.join(proofDir, file))
    return {
      file,
      exists: Boolean(data),
      provenance: data?.provenance || null,
      ciPersisted: data?.ciPersisted === true,
      ciRunId: data?.ciRunId || null,
      ciCommitSha: data?.ciCommitSha || null,
    }
  })

  const targetReached = records.every((item) => item.exists && item.provenance === 'github_actions_ci' && item.ciPersisted)

  const result = {
    packet,
    generatedAt: new Date().toISOString(),
    currentRunId: runId,
    currentSha: sha,
    targetReached,
    records,
  }

  fs.writeFileSync(path.join(generatedDir, 'build-proof-transition-target.json'), JSON.stringify(result, null, 2))
  fs.writeFileSync(
    path.join(generatedDir, 'build-proof-transition-target.md'),
    [
      '# Build Proof Transition Target',
      '',
      `- Packet: ${packet}`,
      `- Generated: ${result.generatedAt}`,
      `- currentRunId: ${runId || 'none'}`,
      `- currentSha: ${sha || 'none'}`,
      `- targetReached: ${targetReached}`,
      '',
      '## Records',
      ...records.map((item) => `- ${item.file} | exists=${item.exists} | provenance=${item.provenance || 'none'} | ciPersisted=${item.ciPersisted} | ciRunId=${item.ciRunId || 'none'} | ciCommitSha=${item.ciCommitSha || 'none'}`),
      '',
    ].join('\n'),
  )

  console.log(`Build proof transition target captured for packet ${packet}.`)
}

main()
