const fs = require('fs')
const path = require('path')

const routes = [
  {
    name: 'projects_collection_get',
    file: path.join(__dirname, '..', 'api', 'projects', 'index.js'),
    req: { method: 'GET', query: {} },
    expectStatus: 200,
    expectType: 'success',
  },
  {
    name: 'projects_collection_post',
    file: path.join(__dirname, '..', 'api', 'projects', 'index.js'),
    req: {
      method: 'POST',
      query: {},
      body: { name: 'Demo Project', customerName: 'FCA Validation Customer' },
    },
    expectStatus: 202,
    expectType: 'success',
  },
  {
    name: 'project_item_get',
    file: path.join(__dirname, '..', 'api', 'projects', '[projectId].js'),
    req: { method: 'GET', query: { projectId: 'PRJ-001' } },
    expectStatus: 200,
    expectType: 'success',
  },
  {
    name: 'project_item_patch',
    file: path.join(__dirname, '..', 'api', 'projects', '[projectId].js'),
    req: { method: 'PATCH', query: { projectId: 'PRJ-001' }, body: { stage: 'qualified' } },
    expectStatus: 202,
    expectType: 'success',
  },
  {
    name: 'takeoffs_get',
    file: path.join(__dirname, '..', 'api', 'projects', '[projectId]', 'takeoffs', 'index.js'),
    req: { method: 'GET', query: { projectId: 'PRJ-001' } },
    expectStatus: 200,
    expectType: 'success',
  },
  {
    name: 'takeoffs_post',
    file: path.join(__dirname, '..', 'api', 'projects', '[projectId]', 'takeoffs', 'index.js'),
    req: {
      method: 'POST',
      query: { projectId: 'PRJ-001' },
      body: { description: 'Concrete slab', quantity: 100, unit: 'SF' },
    },
    expectStatus: 202,
    expectType: 'success',
  },
  {
    name: 'rfis_get',
    file: path.join(__dirname, '..', 'api', 'projects', '[projectId]', 'rfis', 'index.js'),
    req: { method: 'GET', query: { projectId: 'PRJ-001' } },
    expectStatus: 200,
    expectType: 'success',
  },
  {
    name: 'rfis_post',
    file: path.join(__dirname, '..', 'api', 'projects', '[projectId]', 'rfis', 'index.js'),
    req: {
      method: 'POST',
      query: { projectId: 'PRJ-001' },
      body: { question: 'Confirm wall assembly at grid A-3.' },
    },
    expectStatus: 202,
    expectType: 'success',
  },
  {
    name: 'auricrux_actions_post',
    file: path.join(__dirname, '..', 'api', 'auricrux', 'actions', 'index.js'),
    req: {
      method: 'POST',
      query: {},
      body: {
        mode: 'execute',
        targetObjectType: 'project',
        targetObjectId: 'PRJ-001',
        rationale: 'Runtime smoke validation continuity proof',
      },
    },
    expectStatus: 202,
    expectType: 'success',
  },
  {
    name: 'auricrux_actions_method_guard',
    file: path.join(__dirname, '..', 'api', 'auricrux', 'actions', 'index.js'),
    req: { method: 'GET', query: {} },
    expectStatus: 405,
    expectType: 'error',
  },
]

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

function createRes(name) {
  return {
    statusCode: 200,
    body: undefined,
    finished: false,
    status(code) {
      this.statusCode = code
      return this
    },
    json(payload) {
      this.body = payload
      this.finished = true
      return this
    },
    end(payload) {
      this.body = payload
      this.finished = true
      return this
    },
  }
}

function classifyBody(body) {
  if (!body || typeof body !== 'object') return 'unknown'
  if (Object.prototype.hasOwnProperty.call(body, 'success')) {
    return body.success ? 'success' : 'error'
  }
  return 'unknown'
}

async function invoke(def) {
  delete require.cache[require.resolve(def.file)]
  const handler = require(def.file)
  const res = createRes(def.name)
  await handler(def.req, res)
  const bodyType = classifyBody(res.body)
  const passed = res.statusCode === def.expectStatus && bodyType === def.expectType && res.finished

  return {
    name: def.name,
    statusCode: res.statusCode,
    expectStatus: def.expectStatus,
    bodyType,
    expectType: def.expectType,
    passed,
    body: res.body,
  }
}

async function main() {
  const repoRoot = path.join(__dirname, '..')
  const activePacket = readContinuityPacket(repoRoot)
  const results = []
  for (const route of routes) {
    results.push(await invoke(route))
  }

  const failed = results.filter((item) => !item.passed)
  const summary = {
    packet: activePacket,
    generatedAt: new Date().toISOString(),
    total: results.length,
    passed: results.length - failed.length,
    failed: failed.length,
    results: results.map((item) => ({
      name: item.name,
      statusCode: item.statusCode,
      expectStatus: item.expectStatus,
      bodyType: item.bodyType,
      expectType: item.expectType,
      passed: item.passed,
    })),
  }

  const generatedDir = path.join(repoRoot, 'generated')
  fs.mkdirSync(generatedDir, { recursive: true })
  fs.writeFileSync(path.join(generatedDir, 'runtime-smoke-check-report.json'), JSON.stringify(summary, null, 2))
  fs.writeFileSync(
    path.join(generatedDir, 'runtime-smoke-check-report.md'),
    [
      '# Runtime Smoke Check Report',
      '',
      `- Packet: ${summary.packet}`,
      `- Generated: ${summary.generatedAt}`,
      `- Total routes checked: ${summary.total}`,
      `- Passed: ${summary.passed}`,
      `- Failed: ${summary.failed}`,
      '',
      '| Route | Status | Expected | Body Type | Expected Type | Passed |',
      '|---|---:|---:|---|---|---|',
      ...results.map((item) => `| ${item.name} | ${item.statusCode} | ${item.expectStatus} | ${item.bodyType} | ${item.expectType} | ${item.passed ? 'yes' : 'no'} |`),
      '',
    ].join('\n'),
  )

  if (failed.length > 0) {
    console.error('Runtime smoke check failed for routes:', failed.map((item) => item.name).join(', '))
    process.exit(1)
  }

  console.log(`Runtime smoke check passed for all bounded routes in packet ${activePacket}.`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
