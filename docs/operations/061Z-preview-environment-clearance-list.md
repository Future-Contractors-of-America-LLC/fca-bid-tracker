# 061Z preview environment clearance list

Status: active  
Date: 2026-06-15

## Purpose

These preview environments are stale capacity consumers and should be removed before the next deliberate production promotion run.

## Remove these preview environments

- `#26 - Fix governed build wiring and sharpen flagship product qualification spine`
- `#29 - Add FCA coverage matrix for flagship spine enforcement`
- `#30 - Add FCA Contractor Command build sequence and Project/File spine packet`
- `#47 - Add project persistence authority alignment packet`
- `#50 - Add file persistence authority alignment packet`
- `#60 - Auricrux: add static live proof routes for control-plane visibility`
- `#64 - Auricrux: align customer login with active auth boundary`
- `#65 - Add Packet 046 for unified SaaS and LMS spine continuation`
- `#66 - Add Packet 047 for complete spine and single coordinated release`
- `#67 - Packet 048Q: deepen FCA Academy into real LMS content and progression`

## Do not remove

- Do not remove the production environment.
- Do not trigger new preview deployments while clearing capacity.

## Rule after clearance

After these are removed, the next Azure Static Web Apps action should be one deliberate production promotion from `main` via `workflow_dispatch` or the next intended `main` push only.
