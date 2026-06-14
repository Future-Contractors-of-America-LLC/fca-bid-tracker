const { CreateTakeoffItemPayloadSchema } = require('../../../../_lib/validation/fcaSchemas')
const { assertValid } = require('../../../../_lib/validation/assertValid')
const { makeApiSuccess, makeApiError } = require('../../../../_lib/contracts/fcaContracts')

module.exports = async function handler(req, res) {
  const workflowStore = await import('../../../../workflow-store.js')
  const { projectId } = req.query || {}

  if (!projectId) {
    return res.status(400).json(makeApiError('MISSING_PROJECT_ID', 'projectId is required'))
  }

  if (req.method === 'GET') {
    const items = workflowStore.listTakeoffs('TEN-FCA-001', projectId)
    const summary = workflowStore.getWorkflowSummary('TEN-FCA-001')
    return res.status(200).json(
      makeApiSuccess(
        {
          route: `/api/projects/${projectId}/takeoffs`,
          projectId,
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
      const payload = assertValid(CreateTakeoffItemPayloadSchema, req.body || {})
      const result = workflowStore.createTakeoff('TEN-FCA-001', { ...payload, projectId })
      return res.status(201).json(
        makeApiSuccess(
          {
            route: `/api/projects/${projectId}/takeoffs`,
            projectId,
            item: result.takeoff,
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

  if (req.method === 'PATCH') {
    try {
      const result = workflowStore.updateTakeoff('TEN-FCA-001', { ...req.body, projectId })
      return res.status(200).json(
        makeApiSuccess(
          {
            route: `/api/projects/${projectId}/takeoffs`,
            projectId,
            item: result.takeoff,
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
      return res.status(400).json(makeApiError('TAKEOFF_MUTATION_FAILED', error.message, error.details))
    }
  }

  return res.status(405).json(makeApiError('METHOD_NOT_ALLOWED', 'Method not allowed'))
}
