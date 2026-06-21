# Runtime Smoke Check Report

- Packet: 062Y
- Generated: 2026-06-21T01:22:13.805Z
- Total routes checked: 10
- Passed: 8
- Failed: 2
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
| auricrux_actions_post | 504 | 202 | error | success | no | no |
| auricrux_actions_method_guard | 504 | 405 | unknown | error | no | no |
