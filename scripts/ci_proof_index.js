const fs = require('fs')
const path = require('path')

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true })
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
  const generatedDir = path.join(__dirname, '..', 'generated')
  ensureDir(generatedDir)

  const buildEvidence = readJson(path.join(generatedDir, 'build-evidence-report.json'))
  const runtimeSmoke = readJson(path.join(generatedDir, 'runtime-smoke-check-report.json'))

  const proof = {
    packet: '060F',
    generatedAt: new Date().toISOString(),
    github: {
      repository: process.env.GITHUB_REPOSITORY || 'Future-Contractors-of-America-LLC/fca-bid-tracker',
      ref: process.env.GITHUB_REF || null,
      sha: process.env.GITHUB_SHA || null,
      runId: process.env.GITHUB_RUN_ID || null,
      workflow: process.env.GITHUB_WORKFLOW || null,
    },
    artifacts: {
      buildEvidencePresent: Boolean(buildEvidence),
      runtimeSmokePresent: Boolean(runtimeSmoke),
    },
    buildEvidenceSummary: buildEvidence
      ? {
          buildSystem: buildEvidence.packageScripts?.buildSystem || null,
          build: buildEvidence.packageScripts?.build || null,
          hasBuildValidationWorkflow: buildEvidence.workflowChecks?.hasBuildValidationWorkflow || false,
          invokesBuildSystem: buildEvidence.workflowChecks?.invokesBuildSystem || false,
        }
      : null,
    runtimeSmokeSummary: runtimeSmoke
      ? {
          total: runtimeSmoke.total,
          passed: runtimeSmoke.passed,
          failed: runtimeSmoke.failed,
        }
      : null,
    gateAssessment: {
      buildEvidenceReady: Boolean(buildEvidence),
      runtimeSmokeReady: Boolean(runtimeSmoke),
      runtimeSmokePass: runtimeSmoke ? runtimeSmoke.failed === 0 : false,
    },
  }

  fs.writeFileSync(path.join(generatedDir, 'ci-proof-index.json'), JSON.stringify(proof, null, 2))
  fs.writeFileSync(
    path.join(generatedDir, 'ci-proof-index.md'),
    [
      '# CI Proof Index',
      '',
      `- Packet: ${proof.packet}`,
      `- Generated: ${proof.generatedAt}`,
      `- Repository: ${proof.github.repository}`,
      `- Ref: ${proof.github.ref}`,
      `- SHA: ${proof.github.sha}`,
      `- Run ID: ${proof.github.runId}`,
      `- Workflow: ${proof.github.workflow}`,
      '',
      '## Artifact presence',
      `- build-evidence-report.json: ${proof.artifacts.buildEvidencePresent}`,
      `- runtime-smoke-check-report.json: ${proof.artifacts.runtimeSmokePresent}`,
      '',
      '## Gate assessment',
      `- buildEvidenceReady: ${proof.gateAssessment.buildEvidenceReady}`,
      `- runtimeSmokeReady: ${proof.gateAssessment.runtimeSmokeReady}`,
      `- runtimeSmokePass: ${proof.gateAssessment.runtimeSmokePass}`,
      '',
    ].join('\n'),
  )

  console.log('CI proof index captured.')
}

main()
