# FCA Packet 062W — Observed Run Lock Matrix and Readiness Depth

## Issue
Alignment proof and deployment remain primary. The next packet must explicitly define the observed-run lock matrix so future execution does not confuse repo-wired gates with main-branch observed proof.

## Risk
- stacked branch progress can be mistaken for observed deployment truth
- `061Z` can be overclaimed if build-validation, governance, and live-proof lanes are not separated clearly
- future packet work can drift from the strict truth hierarchy of repo truth, branch-run truth, main-run truth, and live-deployment truth

## Fix
062W creates the explicit observed-run lock matrix artifact and readiness packet for the next proof phase.

## Observed-run lock matrix
### Repo-wired only
- build-validation workflow contains route-truth and packet-minimum checks
- alignment-proof-governance workflow exists and emits the observation manifest
- public package route truth source exists
- public conversion surfaces are wired to shared package-route truth

### Branch-run truth required before merge confidence
- latest stacked PR branch run for build-validation
- latest stacked PR branch run for alignment-proof-governance
- generated reports/artifacts present for packet minimums and route truth

### Main-run truth required before 061Z reduction claims
- first post-merge build-validation run on `main`
- first post-merge alignment-proof-governance run on `main`
- repo-visible generated artifact surfaces persisted or uploaded from those runs

### Live deployment truth required before 061Z closeout
- current-head live verifier success on `main`
- proof bundle readiness success on `main`
- managed auth runtime proof observed
- Academy runtime parity proof observed
- commercial runtime path proof observed

## Readiness rule
No assistant response may treat branch-run or repo-wired truth as equivalent to main-run truth or live deployment truth.

## Next build step
062X should operate as a merge-sequencing and run-observation packet, using this matrix to log exactly what has and has not been observed after each merge step.
