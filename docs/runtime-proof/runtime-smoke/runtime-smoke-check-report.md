# Runtime Smoke Check Report

- Packet: 060Z
- Generated: 2026-06-14T14:57:21.879Z
- Total routes checked: 10
- Passed: 0
- Failed: 10
- Emission guaranteed: true

| Route | Status | Expected | Body Type | Expected Type | Passed | Error |
|---|---:|---:|---|---|---|---|
| projects_collection_get | ERR | 200 | exception | success | no | yes |
| projects_collection_post | ERR | 202 | exception | success | no | yes |
| project_item_get | 200 | 200 | unknown | success | no | no |
| project_item_patch | 200 | 202 | unknown | success | no | no |
| takeoffs_get | ERR | 200 | exception | success | no | yes |
| takeoffs_post | ERR | 202 | exception | success | no | yes |
| rfis_get | ERR | 200 | exception | success | no | yes |
| rfis_post | ERR | 202 | exception | success | no | yes |
| auricrux_actions_post | ERR | 202 | exception | success | no | yes |
| auricrux_actions_method_guard | ERR | 405 | exception | error | no | yes |
