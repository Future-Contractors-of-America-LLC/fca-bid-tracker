# Issue #6 Phase 1 validation note

Minimal execution validation for the link-generation patch in `auricrux_engine.js`.

## Run

```bash
node auricrux_engine.js
```

## Confirm generated surfaces

- `public/product/index.html`
- `public/offers/pilot.html`
- `public/offers/starter.html`
- `public/onboarding/index.html`
- `public/pipeline/index.html`

## Spot-check

Open each generated page and confirm the visible navigation renders as working anchor tags for:

- offers
- intake
- onboarding lookup
- pipeline
- product-shell return links
- pilot checkout link on generated onboarding pages when `checkoutUrl` is present

## Expected console evidence

- `AURICRUX_EXEC_COMPLETE`
- `PIPELINE_UPDATED: public/auricrux/pipeline/pipeline.json`
