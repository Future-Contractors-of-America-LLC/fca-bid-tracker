const fs = require('fs')
const path = require('path')

function main() {
  const repoRoot = path.join(__dirname, '..')
  const packageJsonPath = path.join(repoRoot, 'package.json')
  const buildScriptPath = path.join(repoRoot, 'build.sh')
  const workflowPath = path.join(repoRoot, '.github', 'workflows', 'build-validation.yml')

  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))
  const buildScript = fs.readFileSync(buildScriptPath, 'utf8')
  const workflow = fs.readFileSync(workflowPath, 'utf8')

  const evidence = {
    packet: '055A',
    generatedAt: new Date().toISOString(),
    packageScripts: {
      buildSystem: packageJson.scripts['build:system'],
      build: packageJson.scripts.build,
      validateRuntimeSmoke: packageJson.scripts['validate:runtime-smoke'],
      captureBuildEvidence: packageJson.scripts['capture:build-evidence'],
    },
    workflowChecks: {
      hasBuildValidationWorkflow: workflow.includes('name: FCA Build Validation'),
      invokesBuildSystem: workflow.includes('npm run build:system'),
      invokesNpmCi: workflow.includes('npm ci'),
      uploadsArtifacts: workflow.includes('actions/upload-artifact@v6'),
    },
    buildScriptChecks: {
      createsDist: buildScript.includes('mkdir -p dist'),
      generatesStyles: buildScript.includes("dist/styles.css"),
      generatesWorkspacePack: buildScript.includes('live-workspace-pack.json'),
      generatesPlatformProof: buildScript.includes('/portal/platform/'),
      emitsCompletionLine: buildScript.includes('FCA live proof data pack v5 build completed'),
    },
  }

  const generatedDir = path.join(repoRoot, 'generated')
  fs.mkdirSync(generatedDir, { recursive: true })
  fs.writeFileSync(path.join(generatedDir, 'build-evidence-report.json'), JSON.stringify(evidence, null, 2))
  fs.writeFileSync(
    path.join(generatedDir, 'build-evidence-report.md'),
    [
      '# Build Evidence Report',
      '',
      `- Packet: ${evidence.packet}`,
      `- Generated: ${evidence.generatedAt}`,
      '',
      '## Package scripts',
      `- build:system → ${evidence.packageScripts.buildSystem}`,
      `- build → ${evidence.packageScripts.build}`,
      `- validate:runtime-smoke → ${evidence.packageScripts.validateRuntimeSmoke}`,
      `- capture:build-evidence → ${evidence.packageScripts.captureBuildEvidence}`,
      '',
      '## Workflow checks',
      ...Object.entries(evidence.workflowChecks).map(([key, value]) => `- ${key}: ${value}`),
      '',
      '## Build script checks',
      ...Object.entries(evidence.buildScriptChecks).map(([key, value]) => `- ${key}: ${value}`),
      '',
    ].join('\n'),
  )

  console.log('Build evidence captured.')
}

main()
