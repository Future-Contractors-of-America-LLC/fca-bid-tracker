const { CreateTakeoffItemPayloadSchema } = require('../../../_lib/validation/fcaSchemas')
const { assertValid } = require('../../../_lib/validation/assertValid')
const { makeApiSuccess, makeApiError } = require('../../../_lib/contracts/fcaContracts')
const { getProject, listTakeoffs, createTakeoff, backingSource } = require('../../../_lib/runtime/fcaRuntimeStore')

module.exports = async function handler(req, res) {
  const { projectId } = req.query || {}

  if (!projectId) {
    return res.status(400).json(makeApiError('MISSING_PROJECT_ID', 'projectId is required'))
  }

  const project = await getProject(projectId)
  if (!project) {
    return res.status(404).json(makeApiError('PROJECT_NOT_FOUND', `Project not found: ${projectId}`))
  }

  if (req.method === 'GET') {
    const items = await listTakeoffs(projectId)
    return res.status(200).json(
      makeApiSuccess(
        {
          route: `/api/projects/${projectId}/takeoffs`,
          projectId,
          items,
          count: items.length,
        },
        {
          packet: '061A',
          timestamp: new Date().toISOString(),
          backingSource: backingSource(),
        },
      ),
    )
  }

  if (req.method === 'POST') {
    try {
      const payload = assertValid(CreateTakeoffItemPayloadSchema, req.body || {})
      const item = await createTakeoff(projectId, payload)

      return res.status(202).json(
        makeApiSuccess(
          {
            route: `/api/projects/${projectId}/takeoffs`,
            projectId,
            item,
          },
          {
            packet: '061A',
            timestamp: new Date().toISOString(),
            backingSource: backingSource(),
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
