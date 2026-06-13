const { CreateAuricruxActionPayloadSchema } = require('../../_lib/validation/fcaSchemas')
const { assertValid } = require('../../_lib/validation/assertValid')
const { makeApiSuccess, makeApiError } = require('../../_lib/contracts/fcaContracts')

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json(makeApiError('METHOD_NOT_ALLOWED', 'Method not allowed'))
  }

  try {
    const payload = assertValid(CreateAuricruxActionPayloadSchema, req.body || {})

    return res.status(202).json(
      makeApiSuccess(
        {
          route: '/api/auricrux/actions',
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
