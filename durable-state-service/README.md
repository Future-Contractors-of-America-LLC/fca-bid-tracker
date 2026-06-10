# FCA Durable State Service

## Purpose
External durable state service starter for FCA Contractor Command / Auricrux customer-scoped state.

This service is designed to sit behind `FCA_DURABLE_STATE_API_URL` and provide:
- `GET /api/customer-state/{customerId}`
- `PUT /api/customer-state/{customerId}`

## Repository modes
### filesystem
Default bounded mode for local/dev continuity.

### database-ready
Forwards state authority to a configured durable backend service.

Required env:
- `FCA_DURABLE_SERVICE_REPOSITORY_MODE=database-ready`
- `FCA_DATABASE_READY_STATE_API_URL`
- `FCA_DATABASE_READY_STATE_API_KEY`

## Required env
- `FCA_DURABLE_STATE_SERVICE_API_KEY`

Optional env:
- `FCA_DURABLE_SERVICE_STATE_DIR`
- `FCA_DURABLE_SERVICE_REPOSITORY_MODE`
- `FCA_DATABASE_READY_STATE_API_URL`
- `FCA_DATABASE_READY_STATE_API_KEY`

## API contract
### GET
```http
GET /api/customer-state/CUST-123
x-fca-state-api-key: <key>
```

### PUT
```http
PUT /api/customer-state/CUST-123
x-fca-state-api-key: <key>
content-type: application/json
```

Body:
```json
{
  "customer": {
    "company": "Example Contracting"
  },
  "workspace": {
    "title": "FCA Contractor Command Workspace"
  }
}
```

## Truth boundary
This is a durable-service starter artifact. It is implementation-ready, but it does not by itself prove production deployment or live database backing.
