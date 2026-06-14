const { makeApiSuccess, makeApiError } = require('../_lib/contracts/fcaContracts')
const { getProject, updateProject } = require('../_lib/runtime/fcaRuntimeStore')

module.exports = async function handler(req, res) {
  const { projectId } = req.query || {}

  if (!projectId) {
    return res.status(400).json(makeApiError('MISSING_PROJECT_ID', 'projectId is required'))
  }

  if (req.method === 'GET') {
    const item = getProject(projectId)

    if (!item) {
      return res.status(404).json(makeApiError('PROJECT_NOT_FOUND', `Project not found: ${projectId}`))
    }

    return res.status(200).json(
      makeApiSuccess(
        {
          route: `/api/projects/${projectId}`,
          projectId,
          item,
        },
        {
          packet: '059Q',
          timestamp: new Date().toISOString(),
          backingSource: 'fca-runtime-store',
        },
      ),
    )
  }

  if (req.method === 'PATCH') {
    const item = updateProject(projectId, req.body || {})

    if (!item) {
      return res.status(404).json(makeApiError('PROJECT_NOT_FOUND', `Project not found: ${projectId}`))
    }

    return res.status(200).json(
      makeApiSuccess(
        {
          route: `/api/projects/${projectId}`,
          projectId,
          item,
        },
        {
          packet: '059Q',
          timestamp: new Date().toISOString(),
          backingSource: 'fca-runtime-store',
        },
      ),
    )
  }

  return res.status(405).json(makeApiError('METHOD_NOT_ALLOWED', 'Method not allowed'))
}
