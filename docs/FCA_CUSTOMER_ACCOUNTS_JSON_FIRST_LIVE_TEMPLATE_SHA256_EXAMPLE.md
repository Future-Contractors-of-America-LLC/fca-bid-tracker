# FCA Customer Accounts JSON — First Live Template (SHA-256 Example)

Use this if you want to supply `passwordHash` instead of plain `password`.

## JSON Template

```json
[
  {
    "email": "owner@customercompany.com",
    "passwordHash": "PUT_SHA256_HEX_HERE",
    "company": "Customer Company LLC",
    "role": "Owner / Admin",
    "customerId": "CUST-CUSTOMER-001",
    "workspaceLabel": "Customer Company Workspace",
    "selectedPlan": "enterprise",
    "enabledProducts": {
      "saas": true,
      "lms": true,
      "auricrux": true
    },
    "enabledComms": {
      "chat": true,
      "sms": true,
      "phone": true,
      "email": true,
      "teams": true,
      "conference": true,
      "lecture": true
    }
  }
]
```

## How to produce the SHA-256 hex value

### PowerShell

```powershell
$plain = "ReplaceThisWithAStrongUniqueCustomerPassword1!"
$bytes = [System.Text.Encoding]::UTF8.GetBytes($plain)
$hash = [System.Security.Cryptography.SHA256]::Create().ComputeHash($bytes)
-join ($hash | ForEach-Object { $_.ToString("x2") })
```

### Node.js

```js
const crypto = require("crypto");
const password = "ReplaceThisWithAStrongUniqueCustomerPassword1!";
console.log(crypto.createHash("sha256").update(password).digest("hex"));
```

## Recommended first-live posture

- one owner/admin account
- enterprise plan
- all products enabled
- all communications enabled
- use `FCA_ALLOW_SEEDED_LOGIN_FALLBACK=true` for first activation
- switch fallback to `false` only after managed login verifies live
