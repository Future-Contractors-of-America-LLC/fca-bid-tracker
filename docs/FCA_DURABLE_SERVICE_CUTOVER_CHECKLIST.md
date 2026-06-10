# FCA Durable Service Cutover Checklist

## Pre-cutover
- [ ] durable-state-service exists in target deployment surface
- [ ] `FCA_DURABLE_STATE_SERVICE_API_KEY` set
- [ ] service responds to healthable HTTP execution path
- [ ] shared key stored only in runtime secrets, not repo files
- [ ] app runtime still in `filesystem` mode before cutover

## Durable service smoke test
- [ ] `GET /api/customer-state/test-cutover-customer` returns `404`
- [ ] `PUT /api/customer-state/test-cutover-customer` returns `200`
- [ ] second `GET` returns the written canonical state
- [ ] response shows repository mode truth

## App cutover
- [ ] `FCA_STATE_REPOSITORY_MODE=external-durable`
- [ ] `FCA_DURABLE_STATE_API_URL` set to deployed durable service
- [ ] `FCA_DURABLE_STATE_API_KEY` matches service key
- [ ] app runtime redeployed

## Protected route verification
- [ ] `/api/customer-workspace-summary` works under token auth
- [ ] `/api/customer-academy-overview` works under token auth
- [ ] `/api/customer-auricrux-guidance` works under token auth
- [ ] `/api/customer-bid-action` mutates state
- [ ] `/api/customer-project-action` mutates state
- [ ] `/api/customer-academy-action` mutates state
- [ ] follow-up protected reads reflect mutations
- [ ] repository mode reads `external-durable`

## Rollback if needed
- [ ] revert app runtime to `FCA_STATE_REPOSITORY_MODE=filesystem`
- [ ] redeploy app runtime
- [ ] verify protected routes recover
- [ ] leave durable service deployed for later retry
