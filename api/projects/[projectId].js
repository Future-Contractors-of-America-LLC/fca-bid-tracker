const { makeApiSuccess, makeApiError } = require('../_lib/contracts/fcaContracts')

module.exports = async function handler(req, res) {
  const workflowStore = await import('../workflow-store.js')
  const { projectId } = req.query || {}

  if (!projectId) {
    return res.status(400).json(makeApiError('MISSING_PROJECT_ID', 'projectId is required'))
  }

  if (req.method === 'GET') {
    try {
      const item = workflowStore.getProjectById('TEN-FCA-001', projectId)
      const summary = workflowStore.getWorkflowSummary('TEN-FCA-001')
      return res.status(200).json(
        makeApiSuccess(
          {
            route: `/api/projects/${projectId}`,
            projectId,
            item,
            backingSource: 'workflow-store',
          },
          {
            packet: '059Q',
            timestamp: new Date().toISOString(),
            summary,
          },
        ),
      )
    } catch (error) {
      return res.status(404).json(makeApiError('PROJECT_NOT_FOUND', error.message))
    }
  }

  if (req.method === 'PATCH') {
    try {
      const action = req.body?.action || 'advance-stage'
      const result = workflowStore.mutateProject('TEN-FCA-001', action, { ...req.body, projectId })
      return res.status(200).json(
        makeApiSuccess(
          {
            route: `/api/projects/${projectId}`,
            projectId,
            item: result.project,
            activeProjectId: result.activeProjectId,
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
      return res.status(400).json(makeApiError('PROJECT_MUTATION_FAILED', error.message, error.details))
    }
  }

  return res.status(405).json(makeApiError('METHOD_NOT_ALLOWED', 'Method not allowed'))
}
