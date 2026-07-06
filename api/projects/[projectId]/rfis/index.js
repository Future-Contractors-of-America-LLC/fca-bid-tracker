const { CreateRFIPayloadSchema } = require('../../../_lib/validation/fcaSchemas')
const { assertValid } = require('../../../_lib/validation/assertValid')
const { makeApiSuccess, makeApiError } = require('../../../_lib/contracts/fcaContracts')
const { getProject, listRFIs, createRFI, respondRFI } = require('../../../_lib/runtime/fcaRuntimeStore')

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

  const project = getProject(projectId)
  if (!project) {
    return res.status(404).json(contractEnvelope(makeApiError('PROJECT_NOT_FOUND', `Project not found: ${projectId}`), 404))
  }

  if (req.method === 'GET') {
    const items = listRFIs(projectId)
    return res.status(200).json(
      contractEnvelope(
        makeApiSuccess(
        {
          route: `/api/projects/${projectId}/rfis`,
          projectId,
          items,
          count: items.length,
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

  if (req.method === 'POST') {
    try {
      const payload = assertValid(CreateRFIPayloadSchema, req.body || {})
      const item = createRFI(projectId, payload)

      return res.status(202).json(
        contractEnvelope(
          makeApiSuccess(
          {
            route: `/api/projects/${projectId}/rfis`,
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
    } catch (error) {
      return res.status(error.statusCode || 500).json(
        contractEnvelope(makeApiError(error.code || 'UNHANDLED_ERROR', error.message, error.details), error.statusCode || 500),
      )
    }
  }

  if (req.method === 'PATCH') {
    try {
      const body = req.body || {}
      const rfiId = body.rfiId || body.id
      const response = String(body.response || '').trim()
      if (!rfiId || !response) {
        return res.status(400).json(makeApiError('INVALID_RFI_RESPONSE', 'rfiId and response are required'))
      }
      const item = respondRFI(projectId, rfiId, { response })
      return res.status(200).json(
        contractEnvelope(
          makeApiSuccess(
          {
            route: `/api/projects/${projectId}/rfis`,
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
    } catch (error) {
      return res.status(error.statusCode || 500).json(
        contractEnvelope(makeApiError(error.code || 'UNHANDLED_ERROR', error.message, error.details), error.statusCode || 500),
      )
    }
  }

  return res.status(405).json(contractEnvelope(makeApiError('METHOD_NOT_ALLOWED', 'Method not allowed'), 405))
}
