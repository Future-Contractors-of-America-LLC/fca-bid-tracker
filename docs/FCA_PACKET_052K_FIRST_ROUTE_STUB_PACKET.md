# FCA_PACKET_052K_FIRST_ROUTE_STUB_PACKET

Status: Active
Classification: Binding route-stub packet
Repository: `Future-Contractors-of-America-LLC/fca-bid-tracker`
Current Packet: `052K`
Next Packet: `052L`
Target Packet: `060A`

---

## Issue

`052J` fixed the first exact shared-contract and validation file contents.
`052K` must now provide exact route stub contents for the first project-spine execution layer so the codebase has canonical, validated entry points instead of only schema definitions.

---

## Truth Boundary

This packet provides exact starter route contents.

It does **not** claim:
- final business logic is complete
- persistence wiring is complete
- audit emission is fully implemented
- deployment/runtime verification has passed

It **does** provide exact repo-ready starter route stubs aligned to the 052H/052J contract layer.

---

## Apply Order

1. `api/projects/index.js`
2. `api/projects/[projectId].js`
3. `api/projects/[projectId]/takeoffs/index.js`
4. `api/projects/[projectId]/rfis/index.js`
5. `api/auricrux/actions/index.js`

---

## File 1 â€” `api/projects/index.js`

```js
const { CreateProjectPayloadSchema } = require('../_lib/validation/fcaSchemas')
const { assertValid } = require('../_lib/validation/assertValid')
const { makeApiSuccess, makeApiError } = require('../_lib/contracts/fcaContracts')

module.exports = async function handler(req, res) {
  if (req.method === 'GET') {
    return res.status(200).json(
      makeApiSuccess(
        {
          route: '/api/projects',
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
      const payload = assertValid(CreateProjectPayloadSchema, req.body || {})

      return res.status(202).json(
        makeApiSuccess(
          {
            route: '/api/projects',
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
```

---

## File 2 â€” `api/projects/[projectId].js`

```js
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
```

---

## File 3 â€” `api/projects/[projectId]/takeoffs/index.js`

```js
const { CreateTakeoffItemPayloadSchema } = require('../../../../_lib/validation/fcaSchemas')
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
          route: `/api/projects/${projectId}/takeoffs`,
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
      const payload = assertValid(CreateTakeoffItemPayloadSchema, req.body || {})

      return res.status(202).json(
        makeApiSuccess(
          {
            route: `/api/projects/${projectId}/takeoffs`,
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
```

---

## File 4 â€” `api/projects/[projectId]/rfis/index.js`

```js
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
```

---

## File 5 â€” `api/auricrux/actions/index.js`

```js
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
```

---

## Validation Commands

```bash
npm install
npm run lint
npm run build
```

Minimum smoke checks after apply:
- route import succeeds for all five files
- GET `/api/projects` returns 200 envelope
- POST `/api/projects` rejects invalid payload with 400
- POST `/api/projects/:projectId/takeoffs` rejects invalid payload with 400
- POST `/api/projects/:projectId/rfis` rejects invalid payload with 400
- POST `/api/auricrux/actions` rejects invalid payload with 400

---

## Non-Regression Rules

- Do not alter existing bid routes during first project-spine route insertion.
- Do not rename shared validation helpers.
- Do not introduce alternate success/error envelopes.
- Do not claim persistence completion from route-stub insertion.
- Keep `notYetImplemented: true` until real business logic replaces stub behavior.

---

## Acceptance Criteria

`052K` is complete only if:
- exact code exists for the first five canonical route stubs
- route files consume canonical validation helpers
- route files consume canonical response helpers
- method guards exist
- projectId guards exist where required
- validation and smoke checks are defined

---

## Next Packet

`052L = Route Apply Patch Packet`

Must deliver:
- file creation vs replacement classification against current repo tree
- exact apply notes for current repo structure
- import-path verification notes
- commit batch order
- non-regression patch boundaries

---

## Progress Lock

- Current packet: `052K`
- Next packet: `052L`
- Target packet: `060A`
- Save-after-every-prompt rule remains active
