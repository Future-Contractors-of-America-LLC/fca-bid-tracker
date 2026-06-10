# Durable State Service Deployment

## Purpose
This service is the intended target behind `FCA_DURABLE_STATE_API_URL` for the main FCA app when app-side repository mode is switched to `external-durable`.

## Minimum required service env
- `FCA_DURABLE_STATE_SERVICE_API_KEY`
- `FCA_DURABLE_SERVICE_REPOSITORY_MODE`

## Filesystem mode
Use when standing up the service for bounded validation first.

```env
FCA_DURABLE_STATE_SERVICE_API_KEY=<shared-key>
FCA_DURABLE_SERVICE_REPOSITORY_MODE=filesystem
```

## Database-ready mode
Use only when an upstream durable authority exists.

```env
FCA_DURABLE_STATE_SERVICE_API_KEY=<shared-key>
FCA_DURABLE_SERVICE_REPOSITORY_MODE=database-ready
FCA_DATABASE_READY_STATE_API_URL=<upstream-durable-service>
FCA_DATABASE_READY_STATE_API_KEY=<upstream-key>
```

## App-side cutover env
Set on the main FCA app runtime:

```env
FCA_STATE_REPOSITORY_MODE=external-durable
FCA_DURABLE_STATE_API_URL=<deployed-durable-service>
FCA_DURABLE_STATE_API_KEY=<shared-key>
```

## Validation sequence
1. Deploy service in filesystem mode.
2. Verify GET 404 for unknown customer.
3. Verify PUT persists canonical state.
4. Verify subsequent GET returns state.
5. Cut app runtime to `external-durable`.
6. Verify protected reads and writes.
7. Confirm repository mode reports `external-durable` in app routes.
