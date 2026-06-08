# FCA Launch Single-User Subscription Packet

## Objective
Create a truthful, launch-ready single-user company access path that can be exercised in the current frontend shell while production identity and billing infrastructure finish hardening.

## What is now present
- seeded launch customer profile in `src/customerAccounts.js`
- launch-ready login surface in `src/pages/website/Login.jsx`
- SaaS + Auricrux enabled by default for the launch customer
- enterprise plan posture attached to the launch profile

## Launch profile
- Company: Future Contractors of America Launch Customer
- Customer ID: CUST-FCA-LAUNCH-001
- Workspace label: FCA Launch Customer Workspace
- Role: Owner / Admin
- Enabled products: SaaS, Auricrux
- Enabled comms: chat, sms, phone, email, teams, conference

## Truth boundary
This is not yet a production identity-provider-backed account. It is a launch-ready seeded customer profile inside the current shell.

What is still externally blocked:
- real payment collection / subscription billing activation
- production identity provider and password reset flow
- server-backed customer authentication endpoint
- tenant provisioning tied to backend persistence

## Next required external steps for a real paid single user
1. connect billing provider and paid subscription plan mapping
2. deploy real `/api/customer-login` backend and identity store
3. provision tenant creation on successful checkout
4. issue production credentials through the real auth system
5. verify live workspace entry on deployed production domain

## Near-term product value
This packet gives FCA a concrete single-user launch path for demos, sales walkthroughs, and launch rehearsal without falsely claiming production auth is already complete.
