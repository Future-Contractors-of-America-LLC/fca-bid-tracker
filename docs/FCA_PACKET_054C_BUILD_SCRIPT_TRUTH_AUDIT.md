# FCA_PACKET_054C_BUILD_SCRIPT_TRUTH_AUDIT

Status: Active
Classification: Build script truth audit
Repository: `Future-Contractors-of-America-LLC/fca-bid-tracker`
Current Packet: `054C`
Next Packet: `054D`
Target Packet: `060A`

---

## Repo-Visible Script Chain
From repo-visible package and shell truth:

- `npm run build:system` → `npm run build`
- `npm run build` → `bash ./build.sh`

## Build Script Behavior
The repo-visible `build.sh` currently proves this build path:

1. clear `dist`
2. create `dist`
3. copy `public/.` into `dist/`
4. generate `dist/styles.css`
5. generate `dist/data/live-workspace-pack.json`
6. generate public pages for home, features, solutions, pricing, contact, auricrux, intake, checkout, login, platform, projects, files, audit, and live-proof surfaces
7. generate deployment and continuity witness files
8. emit terminal message `FCA live proof data pack v5 build completed`

## Product Truth Impact
The build script is not an empty placeholder. It is a concrete static-site assembly path that directly affects customer-facing surfaces and live-proof routes.

## Truth Boundary
### Repo-proven
- build output is intended to materialize a real `dist` site
- platform-proof routes are baked into the build script
- shared workspace JSON proof is baked into the build script

### Not yet repo-proven
- successful execution of the script on the current head
- exact generated `dist` artifact contents for the current head
- public deployment of the newest generated output

## Required Behavior
Any future deployment claim must distinguish between:

- script-defined build intent
- build execution proof
- deployment proof
- live-domain proof

## Progress Lock
- Current packet: `054C`
- Next packet: `054D`
- Target packet: `060A`
