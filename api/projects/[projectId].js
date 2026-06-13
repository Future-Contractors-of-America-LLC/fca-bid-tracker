const { makeApiSuccess, makeApiError } = require('../_lib/contracts/fcaContracts')

module.exports = async function handler(req, res) {
  const { projectId } = req.query || {}

  if (!projectId) {
    return res.status(400).json(makeApiError('MISSING_PROJECT_ID', 'projectId is required'))
  }

  if (req.method === 'GET') {
    return res.status(200).json(
      makeApiSuccess(
        {
          route: `/api/projects/${projectId}`,
          projectId,
          item: null,
          notYetImplemented: true,
        },
        {
          packet: '052K',
          timestamp: new Date().toISOString(),
        },
      ),
    )
  }

  if (req.method === 'PATCH') {
    return res.status(202).json(
      makeApiSuccess(
        {
          route: `/api/projects/${projectId}`,
          projectId,
          acceptedPayload: req.body || {},
          notYetImplemented: true,
        },
        {
          packet: '052K',
          timestamp: new Date().toISOString(),
        },
      ),
    )
  }

  return res.status(405).json(makeApiError('METHOD_NOT_ALLOWED', 'Method not allowed'))
}
