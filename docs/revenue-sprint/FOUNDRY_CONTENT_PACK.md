# Revenue Sprint — Foundry Agent Content Pack

Generated for the 7-day hands-off revenue sprint. Agents can refine and publish.

## website-builder — Hero and pricing framing

**Headline:** Run commercial jobs from one contractor operating system.

**Subhead:** FCA Contractor Command connects leads, bids, plan room, billing, field training, and Auricrux intelligence — without stitching together five disconnected tools.

**CTA rail:** Demo ? Buy Pilot ($2,500) ? Startup ($99/mo) ? Contact enterprise

## comms-builder — Digital product descriptions

See `public/products/catalog.json` for live catalog entries. Launch post draft:

> Future Contractors of America now ships downloadable estimator and field kits alongside FCA Contractor Command. Start with the GC Bid Quick Start Kit, then activate your workspace for bids, projects, and Academy on one spine.

## academy-builder — FCA Workspace Quick Start

Program key: `fca-workspace-quick-start` (wired in `src/academyCatalog.js`)

1. Create your first project at `/portal/projects`
2. Add and qualify a bid at `/portal/bids`
3. Upload plan room files at `/portal/files`
4. Package a proposal at `/portal/proposals`

## saas-builder — Customer provisioning runbook

1. Stripe `checkout.session.completed` hits `/api/stripe-webhook`
2. Payment record persists to Azure Table `Payments`
3. Provision customer via intake `client_reference_id`
4. Email credentials from founder test pattern in `FOUNDER_PRODUCT_TEST_ACCESS.md`

## numarqon — Pricing messaging

| Tier | Price | Best for |
|------|-------|----------|
| Digital kits | $29–$149 | Templates and checklists |
| Startup | $99/mo | Owner-operators |
| Pilot | $2,500 | White-glove rollout |
