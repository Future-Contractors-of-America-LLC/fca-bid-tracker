# FCA Packet 062I — Stacked Run Truth Classes

## Definitions

### repo-wired
The workflow or validation surface exists in repository truth.
This does not imply it has run successfully on the current stack.

### stack-head observed
A run result has been observed for the current stacked branch or pull request head.
This does not imply `main` truth.

### main observed
A run result has been observed on `main` after merge.
This does not imply live deployment truth unless the deployed target was also exercised successfully.

### live deployment observed
A deployed target was exercised successfully and evidence was observed for that deployed target.
This is the highest truth class in the sequence.

## Forbidden shortcuts
- repo-wired -> main observed
- repo-wired -> live deployment observed
- stack-head observed -> live deployment observed
- `062*` repo truth -> `061Z` closed

## Required statement form
Every future packet in this range must state each relevant lane using one of the four classes above.