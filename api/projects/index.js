const { CreateProjectPayloadSchema } = require('../_lib/validation/fcaSchemas')
const { assertValid } = require('../_lib/validation/assertValid')
const { makeApiSuccess, makeApiError } = require('../_lib/contracts/fcaContracts')
const { listProjects, createProject } = require('../_lib/runtime/fcaRuntimeStore')

module.exports = async function handler(req, res) {
  if (req.method === 'GET') {
    const items = listProjects()

    return res.status(200).json(
      makeApiSuccess(
        {
          route: '/api/projects',
          items,
          count: items.length,
        },
        {
          packet: '059Q',
          timestamp: new Date().toISOString(),
          backingSource: 'fca-runtime-store',
        },
      ),
    )
  }

  if (req.method === 'POST') {
    try {
      const payload = assertValid(CreateProjectPayloadSchema, req.body || {})
      const item = createProject(payload)

      return res.status(201).json(
        makeApiSuccess(
          {
            route: '/api/projects',
            item,
          },
          {
            packet: '059Q',
            timestamp: new Date().toISOString(),
            backingSource: 'fca-runtime-store',
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
