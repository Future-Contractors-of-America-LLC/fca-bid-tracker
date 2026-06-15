# 061Z run-boundary correction

Status: active  
Date: 2026-06-15

## Issue

A failed `Build, Deploy, and Smoke Verify Job` was inspected after preview environments had already been cleared.
The log showed:

- checkout of `refs/pull/107/merge`
- use of `skip_api_build`
- deployment to preview host `delightful-mushroom-0de67860f-107.eastus2.7.azurestaticapps.net`
- smoke verification expecting production hosts and SHA `493a30770e184838577bf8faa7e69be84f3f67f7`
- live hosts still serving production SHA `6695d7b4ee452425f5b677490fc2ba1502b5f0e5`

## Correction

This failed run is not the current `main` production workflow truth.
It is a stale PR-context run from PR `#107`.

Current `main` workflow truth differs in two critical ways:

1. `skip_api_build` is no longer present in `.github/workflows/azure-static-web-apps-delightful-mushroom-0de67860f.yml`
2. `pull_request` runs are validation-only and do not execute the real SWA deploy or live-domain smoke verification steps

## Operational consequence

Do not treat the pasted PR-107 run as proof that the current `main` deployment policy is still wrong.
Treat it as historical PR-snapshot evidence.

## Current deploy truth boundary

At this checkpoint:

- production environment exists and is marked `Ready`
- preview environments are cleared
- the pasted failure is tied to a PR merge ref, not the current `main` workflow file
- live production host continuity is still on SHA `6695d7b4ee452425f5b677490fc2ba1502b5f0e5`
- a fresh controlled `main` or `workflow_dispatch` run is required for truthful deployment verification

## Required next action

Trigger exactly one fresh run of `Azure Static Web Apps CI/CD` against `main` after this correction artifact lands, then judge only that run.