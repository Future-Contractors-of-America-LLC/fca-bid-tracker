const { CreateProjectPayloadSchema } = require('../_lib/validation/fcaSchemas')
const { assertValid } = require('../_lib/validation/assertValid')
const { makeApiSuccess, makeApiError } = require('../_lib/contracts/fcaContracts')

module.exports = async function handler(req, res) {
  const workflowStore = await import('../workflow-store.js')

  if (req.method === 'GET') {
    const items = workflowStore.listProjects('TEN-FCA-001')
    const summary = workflowStore.getWorkflowSummary('TEN-FCA-001')

    return res.status(200).json(
      makeApiSuccess(
        {
          route: '/api/projects',
          items,
          count: items.length,
          backingSource: 'workflow-store',
        },
        {
          packet: '059Q',
          timestamp: new Date().toISOString(),
          summary,
        },
      ),
    )
  }

  if (req.method === 'POST') {
    try {
      const payload = assertValid(CreateProjectPayloadSchema, req.body || {})
      const result = workflowStore.createProject('TEN-FCA-001', payload)

      return res.status(201).json(
        makeApiSuccess(
          {
            route: '/api/projects',
            item: result.project,
            backingSource: 'workflow-store',
          },
          {
            packet: '059Q',
            timestamp: new Date().toISOString(),
            summary: result.summary,
          },
        ),
      )
    } catch (error) {
      return res.status(error.statusCode || 500).json(
        makeApiError(error.code || 'UNHANDLED_ERROR', error.message, error.details),
      )
    }
  }

  return res.status(405).json(makeApiError('METHOD_NOT_ALLOWED', 'Method not allowed'))
}
