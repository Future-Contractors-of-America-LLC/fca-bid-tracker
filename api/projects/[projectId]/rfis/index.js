const { CreateRFIPayloadSchema } = require('../../../../_lib/validation/fcaSchemas')
const { assertValid } = require('../../../../_lib/validation/assertValid')
const { makeApiSuccess, makeApiError } = require('../../../../_lib/contracts/fcaContracts')

module.exports = async function handler(req, res) {
  const { projectId } = req.query || {}

  if (!projectId) {
    return res.status(400).json(makeApiError('MISSING_PROJECT_ID', 'projectId is required'))
  }

  if (req.method === 'GET') {
    return res.status(200).json(
      makeApiSuccess(
        {
          route: `/api/projects/${projectId}/rfis`,
          projectId,
          items: [],
          notYetImplemented: true,
        },
        {
          packet: '052K',
          timestamp: new Date().toISOString(),
        },
      ),
    )
  }

  if (req.method === 'POST') {
    try {
      const payload = assertValid(CreateRFIPayloadSchema, req.body || {})

      return res.status(202).json(
        makeApiSuccess(
          {
            route: `/api/projects/${projectId}/rfis`,
            projectId,
            acceptedPayload: payload,
            notYetImplemented: true,
          },
          {
            packet: '052K',
            timestamp: new Date().toISOString(),
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
