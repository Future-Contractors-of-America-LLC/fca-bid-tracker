const { CreateProjectPayloadSchema } = require('../_lib/validation/fcaSchemas')
const { assertValid } = require('../_lib/validation/assertValid')
const { makeApiSuccess, makeApiError } = require('../_lib/contracts/fcaContracts')
const { listProjects, createProject, backingSource } = require('../_lib/runtime/fcaRuntimeStore')

module.exports = async function handler(req, res) {
  if (req.method === 'GET') {
    const items = await listProjects()

    return res.status(200).json(
      makeApiSuccess(
        {
          route: '/api/projects',
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
      const payload = assertValid(CreateProjectPayloadSchema, req.body || {})
      const item = await createProject(payload)

      return res.status(202).json(
        makeApiSuccess(
          {
            route: '/api/projects',
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
