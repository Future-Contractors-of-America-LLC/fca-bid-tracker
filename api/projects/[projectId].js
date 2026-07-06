const { makeApiSuccess, makeApiError } = require('../_lib/contracts/fcaContracts')
const { getProject, updateProject } = require('../_lib/runtime/fcaRuntimeStore')

function contractEnvelope(payload, status) {
  const safeStatus = Number(status) || 500
  return {
    ...(payload || {}),
    status: safeStatus,
    ok: safeStatus >= 200 && safeStatus < 400,
    error: safeStatus >= 200 && safeStatus < 400 ? null : payload?.error || 'REQUEST_FAILED',
  }
}

module.exports = async function handler(req, res) {
  const { projectId } = req.query || {}

  if (!projectId) {
    return res.status(400).json(contractEnvelope(makeApiError('MISSING_PROJECT_ID', 'projectId is required'), 400))
  }

  if (req.method === 'GET') {
    const item = getProject(projectId)

    if (!item) {
      return res.status(404).json(contractEnvelope(makeApiError('PROJECT_NOT_FOUND', `Project not found: ${projectId}`), 404))
    }

    return res.status(200).json(
      contractEnvelope(
        makeApiSuccess(
        {
          route: `/api/projects/${projectId}`,
          projectId,
          item,
        },
        {
          packet: '061A',
          timestamp: new Date().toISOString(),
          backingSource: 'fca-runtime-store',
        },
      ),
      200,
      ),
    )
  }

  if (req.method === 'PATCH') {
    const item = updateProject(projectId, req.body || {})

    if (!item) {
      return res.status(404).json(contractEnvelope(makeApiError('PROJECT_NOT_FOUND', `Project not found: ${projectId}`), 404))
    }

    return res.status(202).json(
      contractEnvelope(
        makeApiSuccess(
        {
          route: `/api/projects/${projectId}`,
          projectId,
          item,
        },
        {
          packet: '061A',
          timestamp: new Date().toISOString(),
          backingSource: 'fca-runtime-store',
        },
      ),
      202,
      ),
    )
  }

  return res.status(405).json(contractEnvelope(makeApiError('METHOD_NOT_ALLOWED', 'Method not allowed'), 405))
}
