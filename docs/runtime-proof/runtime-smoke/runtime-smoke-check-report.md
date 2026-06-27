# Runtime Smoke Check Report

- Packet: 062Y
- Generated: 2026-06-27T18:40:13.190Z
- Total routes checked: 10
- Passed: 8
- Failed: 2
- Emission guaranteed: true

| Route | Status | Expected | Body Type | Expected Type | Passed | Error |
|---|---:|---:|---|---|---|---|
| projects_collection_get | 200 | 200 | unknown | success | no | no |
| projects_collection_post | 200 | 202 | unknown | success | no | no |
| project_item_get | 200 | 200 | success | success | yes | no |
| project_item_patch | 202 | 202 | success | success | yes | no |
| takeoffs_get | 200 | 200 | success | success | yes | no |
| takeoffs_post | 202 | 202 | success | success | yes | no |
| rfis_get | 200 | 200 | success | success | yes | no |
| rfis_post | 202 | 202 | success | success | yes | no |
| auricrux_actions_post | 202 | 202 | success | success | yes | no |
| auricrux_actions_method_guard | 405 | 405 | error | error | yes | no |
