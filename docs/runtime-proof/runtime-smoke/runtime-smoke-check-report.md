# Runtime Smoke Check Report

- Packet: 062Y
- Generated: 2026-06-20T18:07:56.177Z
- Total routes checked: 10
- Passed: 9
- Failed: 1
- Emission guaranteed: true

| Route | Status | Expected | Body Type | Expected Type | Passed | Error |
|---|---:|---:|---|---|---|---|
| projects_collection_get | 200 | 200 | success | success | yes | no |
| projects_collection_post | 202 | 202 | success | success | yes | no |
| project_item_get | 200 | 200 | success | success | yes | no |
| project_item_patch | 202 | 202 | success | success | yes | no |
| takeoffs_get | 200 | 200 | success | success | yes | no |
| takeoffs_post | 202 | 202 | success | success | yes | no |
| rfis_get | 200 | 200 | success | success | yes | no |
| rfis_post | 202 | 202 | success | success | yes | no |
| auricrux_actions_post | 202 | 202 | success | success | yes | no |
| auricrux_actions_method_guard | 200 | 405 | unknown | error | no | no |
