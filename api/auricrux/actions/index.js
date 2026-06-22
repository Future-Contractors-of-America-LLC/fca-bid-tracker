const { CreateAuricruxActionPayloadSchema } = require('../../_lib/validation/fcaSchemas')
const { assertValid } = require('../../_lib/validation/assertValid')
const { makeApiSuccess, makeApiError } = require('../../_lib/contracts/fcaContracts')

const CENTRAL_API =
  process.env.AURICRUX_CENTRAL_API ||
  'https://api.futurecontractorsofamerica.com/api'

module.exports = async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const response = await fetch(`${CENTRAL_API}/auricrux/actions`, { method: 'GET' })
      const payload = await response.json().catch(() => ({}))
      return res.status(response.status).json(payload)
    } catch (error) {
      return res.status(502).json(makeApiError('PROXY_FAILURE', error.message || 'Auricrux actions proxy failed.'))
    }
  }

  if (req.method !== 'POST') {
    return res.status(405).json(makeApiError('METHOD_NOT_ALLOWED', 'Method not allowed'))
  }

  try {
    const payload = assertValid(CreateAuricruxActionPayloadSchema, req.body || {})
    if (process.env.FCA_RUNTIME_SMOKE === '1') {
      return res.status(202).json(
        makeApiSuccess(
          {
            route: '/api/auricrux/actions',
            acceptedPayload: payload,
            central: { boundedSmoke: true },
            backingSource: 'fca-runtime-smoke-stub',
            notYetImplemented: false,
          },
          {
            packet: '061L',
            timestamp: new Date().toISOString(),
          },
        ),
      )
    }

    const response = await fetch(`${CENTRAL_API}/auricrux/actions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    const centralPayload = await response.json().catch(() => ({}))
    if (!response.ok) {
      return res.status(response.status).json(
        makeApiError(
          centralPayload?.code || 'CENTRAL_ACTION_FAILED',
          centralPayload?.error || 'Auricrux action request failed.',
          centralPayload?.details,
        ),
      )
    }

    return res.status(202).json(
      makeApiSuccess(
        {
          route: '/api/auricrux/actions',
          acceptedPayload: payload,
          central: centralPayload,
          notYetImplemented: false,
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
