# FCA Packet 062M — Blocker Reduction Gate Binding

## Issue
062L isolated the exact unresolved workflow lanes and their promotion dependencies, but the stack still needed an explicit gate that says what counts as meaningful progress versus cosmetic motion.

## Fix
062M binds the blocker-reduction gate directly to the stacked observation model and continuity ledger.

## Meaningful progress conditions
A change may count as meaningful reduction of the unresolved `061Z` blocker set only if at least one critical lane moves from `repo-wired` to a higher truth class with exact evidence bound into the canonical observation surface.

### Eligible lane promotions
- build validation → `stack-head observed`
- alignment proof governance → `stack-head observed`
- static web app deploy → `stack-head observed`
- runtime smoke validation → `stack-head observed`
- live deployment proof stamp → `stack-head observed`
- live deployment run witness → `stack-head observed`

## Still insufficient by itself
The following do **not** reduce the unresolved `061Z` blocker set by themselves:
- workflow existence only
- packet documentation only
- additional public/site slice expansion only
- PR-head reviewer automation only
- branch existence only
- route-truth hardening only
- LMS completion hardening only

## Stronger but still not closeout
The following may count as real progress but still do not equal `061Z` closeout by themselves:
- one or more critical lanes reaching `stack-head observed`
- one or more critical lanes reaching `main observed`
- deploy lane observed without live runtime proof
- runtime smoke observed without proof-stamp/witness alignment

## Result
The stack now has an explicit yes/no gate for whether a claimed improvement is actually relevant to `061Z` reduction.

## Next build step
062N should persist this gate into the durable observation report so the report itself can declare whether meaningful blocker reduction has or has not occurred.