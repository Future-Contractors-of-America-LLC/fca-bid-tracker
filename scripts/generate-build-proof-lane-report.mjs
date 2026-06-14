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

  if (!fs.existsSync(ledgerPath)) {
    return fallbackPacket
  }

  const ledger = fs.readFileSync(ledgerPath, 'utf8')
  const match = ledger.match(/- Active packet: `([^`]+)`/)
  return match ? match[1] : fallbackPacket
}

function main() {
  const repoRoot = path.join(path.dirname(new URL(import.meta.url).pathname), '..')
  const generatedDir = path.join(repoRoot, 'generated')
  const packet = readContinuityPacket(repoRoot)
  const buildEvidence = readJson(path.join(generatedDir, 'build-evidence-report.json'))
  const validation = readJson(path.join(generatedDir, 'build-proof-lane-validation.json'))

  const report = {
    packet,
    generatedAt: new Date().toISOString(),
    lane: 'build-validation',
    artifactPresence: {
      buildEvidencePresent: Boolean(buildEvidence),
      validationPresent: Boolean(validation),
    },
    gateAssessment: {
      buildEvidenceReady: Boolean(buildEvidence),
      proofLaneWired: Boolean(validation?.success),
    },
    workflowTruth: buildEvidence?.workflowChecks || null,
    validationFailures: validation?.failures || [],
  }

  fs.mkdirSync(generatedDir, { recursive: true })
  fs.writeFileSync(path.join(generatedDir, 'build-proof-lane-report.json'), JSON.stringify(report, null, 2))
  fs.writeFileSync(
    path.join(generatedDir, 'build-proof-lane-report.md'),
    [
      '# Build Proof Lane Report',
      '',
      `- Packet: ${report.packet}`,
      `- Generated: ${report.generatedAt}`,
      `- Lane: ${report.lane}`,
      '',
      '## Artifact presence',
      `- buildEvidencePresent: ${report.artifactPresence.buildEvidencePresent}`,
      `- validationPresent: ${report.artifactPresence.validationPresent}`,
      '',
      '## Gate assessment',
      `- buildEvidenceReady: ${report.gateAssessment.buildEvidenceReady}`,
      `- proofLaneWired: ${report.gateAssessment.proofLaneWired}`,
      '',
      '## Validation failures',
      ...(report.validationFailures.length ? report.validationFailures.map((item) => `- ${item}`) : ['- none']),
      '',
    ].join('\n'),
  )

  console.log(`Build proof lane report generated for packet ${packet}.`)
}

main()
