# Founder Completion Guide

Everything below requires **your** accounts, credentials, legal approval, or store enrollment for items that cannot be automated (primarily **app store publish**). Revenue, enterprise auth, M365 file sync, and transactional email are **wired through Auricrux-Central** — engineering completes the integration; you verify live configuration in Azure when needed.

**Last updated:** 2026-06-24  
**Repos:** `auricrux-central`, `fca-bid-tracker`, `fca-mobile-maui` (canonical mobile), `fca-mobile` (legacy � do not extend)

---

## Quick status � what is already done for you

| Area | Status |
|------|--------|
| .NET 8 SDK | Installed on your Windows machine (8.0.422) |
| MAUI workload | Installed (`dotnet workload install maui`) |
| Mobile app code | Complete in `fca-mobile-maui-work` � 14 screens, live API wiring |
| Web SPA | Live at https://futurecontractorsofamerica.com |
| Backend API | Live at https://auricrux-central.azurewebsites.net |
| GitHub CI for mobile | Workflow ready � builds after repo push |

**Local Android build still needs:** Android SDK (see Section 3). SDK + MAUI are installed; Android SDK is the remaining local gap.

---

## Section 1 � Revenue (highest priority)

### 1.1 FCA native payment rail (primary - no Stripe required)

**Why:** FCA is the product and the payment rail. Checkout, invoice payment, and subscription intake run through **FCA native payment surfaces on Auricrux-Central** - not external checkout silos. Website checkout and portal billing call POST /api/fca-payments/intake and POST /api/fca-payments/checkout; payments post to FCA Books via 
ecord-native-payment.

**Status:** Integration code is complete. No third-party processor is required for revenue completeness.

**Verify (no Stripe needed):**

1. Open https://futurecontractorsofamerica.com/checkout?plan=startup
2. Complete buyer details and continue to **FCA native payment**
3. Confirm payment intake ID and governed invoice are created
4. Record a test payment (ACH reference is fine for QC)
5. Confirm success page and portal billing show invoice **Paid**

**Optional Stripe acceleration (off by default):** Only enable if you explicitly want card processing via Stripe:

| Name | Value |
|------|-------|
| FCA_STRIPE_FALLBACK | 1 |
| STRIPE_SECRET_KEY | sk_live_... |
| VITE_FCA_STRIPE_FALLBACK | 1 on Static Web Apps (web only) |

When both server and web flags are set, checkout may fall back to Stripe Embedded Checkout. FCA native checkout remains the default path.

---

### 1.2 Stripe webhook (optional - only if optional Stripe path enabled)

**Why:** Confirms Stripe card payments when FCA_STRIPE_FALLBACK=1 is enabled.

**Skip this section** if you are running FCA native payments only (recommended default).

**Steps:**

1. Stripe Dashboard -> **Developers -> Webhooks -> Add endpoint**
2. **Endpoint URL:**  
   https://auricrux-central.azurewebsites.net/api/stripe/webhook
3. Select events (minimum):
   - checkout.session.completed
   - invoice.paid
   - customer.subscription.created
   - customer.subscription.updated
4. After creation, open the webhook -> **Signing secret** -> copy whsec_...
5. Set STRIPE_WEBHOOK_SECRET in Auricrux-Central app settings
6. Click **Send test webhook** -> confirm HTTP 200 in Azure logs

---

### 1.3 FCA native checkout paths (replaces Stripe Payment Links)

**Why:** Startup and pilot self-serve checkout use FCA native /checkout paths - not uy.stripe.com links.

**No Stripe Payment Link required.** Use:

| Plan | URL |
|------|-----|
| Pilot | https://futurecontractorsofamerica.com/checkout?plan=pilot |
| Startup | https://futurecontractorsofamerica.com/checkout?plan=startup |

**Verify:** From https://futurecontractorsofamerica.com/intake?plan=startup -> complete intake -> lands on FCA native checkout (not external Stripe).

**Legacy pilot Stripe link (deprecated):**  
https://buy.stripe.com/bJe14o0fQ5Pn8Tt7Bw5gc01

---

### 1.4 API subdomain DNS

**Why:** Clean `api.futurecontractorsofamerica.com` URL for enterprise buyers and future cookie/SSO alignment.

**Steps:**

1. Open your domain registrar (where `futurecontractorsofamerica.com` is managed).
2. Add **TXT** record for Azure SWA / App Service verification if prompted:
   - Host: `asuid.api`
   - Value: (from Azure Portal ? Custom domains ? Add custom domain)
3. Add **CNAME**:
   - Host: `api`
   - Points to: `auricrux-central.azurewebsites.net`
4. In **Azure Portal ? Auricrux-Central ? Custom domains**, add `api.futurecontractorsofamerica.com`
5. Enable HTTPS (managed certificate)

**Verify:**
```powershell
curl https://api.futurecontractorsofamerica.com/api/health
```

---

## Section 2 � Mobile app store submission (.NET MAUI)

> **Important:** Use **`fca-mobile-maui`**, not the legacy Expo repo. Mobile is pure C# � no JavaScript or Python.

### 2.1 Apple Developer Program

**Cost:** $99/year  
**URL:** https://developer.apple.com/programs/enroll/

**Steps:**

1. Enroll company **Future Contractors of America LLC**
2. After approval, go to **Certificates, Identifiers & Profiles**
3. **Identifiers ? App IDs ? Register**
   - Description: `FCA Contractor Command`
   - Bundle ID: `com.futurecontractorsofamerica.mobile` (must match app)
   - Enable: Push Notifications (optional), Sign in with Apple (if using SSO later)
4. Create **Distribution certificate** (Apple Distribution)
5. Create **App Store provisioning profile** for the App ID

**Save securely:** `.p12` certificate + password, provisioning profile UUID

---

### 2.2 Google Play Console

**Cost:** $25 one-time  
**URL:** https://play.google.com/console

**Steps:**

1. Create developer account for Future Contractors of America LLC
2. **Create app**
   - Name: `FCA Contractor Command`
   - Default language: English (US)
   - App / Game: App
   - Free or paid: Free (subscription is via Stripe/web)
3. Complete **Store listing** (draft OK until first upload):
   - Short description (80 chars): e.g. `Leads, jobs, plans, billing, and training for commercial contractors.`
   - Full description: use `fca-mobile-maui-work/README.md` product table as base
   - App icon: 512�512 PNG (export from `Resources/AppIcon/appicon.svg`)
   - Feature graphic: 1024�500 PNG
   - Screenshots: minimum 2 phone screenshots (see 2.5)
4. **App content** questionnaires: privacy policy URL, data safety, target audience
5. **Release ? Production ? Create new release** (after AAB upload from CI)

---

### 2.3 Android signing keystore (required for Play Store)

**Why:** Google requires a signed AAB. CI needs this secret.

**Steps (on your machine):**

```powershell
keytool -genkeypair -v -keystore fca-mobile-release.keystore -alias fca -keyalg RSA -keysize 2048 -validity 10000
```

- Store password: choose strong password, save in password manager
- CN: Future Contractors of America LLC
- **Do not commit** the keystore to git

**Add GitHub secrets** (repo `fca-mobile-maui`):

| Secret | Value |
|--------|-------|
| `ANDROID_KEYSTORE_BASE64` | Base64 of keystore file (see below) |
| `ANDROID_KEYSTORE_PASSWORD` | Keystore password |
| `ANDROID_KEY_ALIAS` | `fca` |
| `ANDROID_KEY_PASSWORD` | Key password (often same as keystore) |

Encode keystore:
```powershell
[Convert]::ToBase64String([IO.File]::ReadAllBytes("fca-mobile-release.keystore")) | Set-Clipboard
```

---

### 2.4 iOS signing for CI (GitHub Actions)

**Add GitHub secrets:**

| Secret | Value |
|--------|-------|
| `IOS_P12_BASE64` | Base64 of Apple Distribution .p12 |
| `IOS_P12_PASSWORD` | Certificate password |
| `IOS_PROVISION_PROFILE_BASE64` | Base64 of `.mobileprovision` |
| `APPLE_ID` | Apple ID email |
| `APPLE_APP_SPECIFIC_PASSWORD` | From appleid.apple.com ? App-Specific Passwords |

CI workflow for signed builds can be added after secrets exist (engineering can wire `dotnet publish` + `altool` / App Store Connect API).

---

### 2.5 Screenshots and store assets

**Capture on real devices** (recommended) or emulator:

| Screen | What to show |
|--------|----------------|
| Welcome | Value props � leads, jobs, training |
| Command Center | KPI tiles populated |
| Lead pipeline | List of opportunities |
| Jobs | Active job sites |
| Training | Academy programs |

**Sizes:**

- **iOS:** 6.7" (1290�2796) and 6.5" (1284�2778) � App Store Connect
- **Android:** Phone screenshots min 320px short edge; 1080�1920 typical

**Brand mark:** Source SVG at `fca-mobile-work/assets/source/fca-mark.svg` � export PNG at 512, 1024 as needed.

---

### 2.6 Local dev environment (optional but useful)

**.NET (done on your machine):**
```powershell
dotnet --version   # should show 8.0.x
dotnet workload list   # should include maui
```

**Android SDK (you still need this for local device deploy):**

1. Install [Android Studio](https://developer.android.com/studio)
2. Open Android Studio ? **SDK Manager**
3. Install: Android SDK Platform 34, Android SDK Build-Tools 34, Android Emulator
4. Set environment variable (PowerShell, permanent):
   ```powershell
   [Environment]::SetEnvironmentVariable("ANDROID_HOME", "$env:LOCALAPPDATA\Android\Sdk", "User")
   ```
5. Restart terminal, then:
   ```powershell
   cd fca-mobile-maui-work
   dotnet build src/FcaMobile/FcaMobile.csproj -c Debug -f net8.0-android
   dotnet build src/FcaMobile/FcaMobile.csproj -c Debug -f net8.0-android -t:Run
   ```

**iOS:** Requires macOS + Xcode 15+ for device/simulator deploy. CI builds iOS on `macos-latest` without your Mac.

---

### 2.7 Submit to stores (after signed builds exist)

**Google Play:**

1. Download signed `.aab` from GitHub Actions artifact (or local `dotnet publish`)
2. Play Console ? **Release ? Production ? Upload**
3. Complete content rating questionnaire
4. **Review and roll out**

**Apple App Store:**

1. Upload `.ipa` via Transporter app or CI
2. App Store Connect ? **TestFlight** ? internal testing first
3. Add compliance, privacy nutrition labels, review notes
4. **Submit for Review**

**Review notes template:**
> FCA Contractor Command is a B2B contractor operations app. Demo login: [provide launch customer email/password after SSO or use launch account]. App connects to our hosted API for leads, projects, billing, and training data.

---

## Section 3 � Enterprise authentication (Microsoft / Google SSO)

### 3.1 Azure Entra ID app registration (live via `/api/customer-entra`)

**Why:** Enterprise buyers sign in with Microsoft through Auricrux-Central OAuth — the web login page exposes **Sign in with Microsoft** when `AZURE_CLIENT_ID` and `AZURE_TENANT_ID` are set on Central.

**Status:** OAuth authorize/callback and session exchange are implemented. Verify redirect URIs match your deployment:

1. [Azure Portal](https://portal.azure.com) ? **Microsoft Entra ID ? App registrations ? New registration**
2. Name: `FCA Contractor Command`
3. Supported account types: **Accounts in any organizational directory + personal Microsoft accounts**
4. Redirect URIs:
   - Web: `https://futurecontractorsofamerica.com/login`
   - Web: `https://auricrux-central.azurewebsites.net/api/customer-login/callback` (if using backend OAuth)
5. **Certificates & secrets ? New client secret** ? copy value
6. **API permissions:** `openid`, `profile`, `email`, `User.Read`

**Set in Auricrux-Central:**

| Variable | Value |
|----------|-------|
| `AZURE_CLIENT_ID` | Application (client) ID |
| `AZURE_CLIENT_SECRET` | Client secret |
| `AZURE_TENANT_ID` | Directory (tenant) ID |

### 3.2 Production session secret

```powershell
# Generate a 64-char random secret
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 64 | ForEach-Object {[char]$_})
```

Set `FCA_SESSION_SECRET` in Auricrux-Central app settings.

### 3.3 Retire launch fallback account

After SSO works, disable or rotate:
- Email: `launch.customer@futurecontractorsofamerica.com`
- Document new demo account for App Store reviewers

---

## Section 4 � Azure / M365 / AI

### 4.1 Key Vault access

**Issue:** CLI user may get `ForbiddenByRbac` on `auricrux-kv`.

**Steps:**

1. Azure Portal ? **Key vaults ? auricrux-kv ? Access control (IAM)**
2. **Add role assignment ? Key Vault Secrets Officer**
3. Assign to your user or the Auricrux-Central managed identity
4. Retry secret reads from deployment scripts

### 4.2 M365 / SharePoint integration (live read bridge)

**Status:** Auricrux-Central exposes `/api/m365/sharepoint/*` endpoints. Portal Files surfaces governed SharePoint items when Graph credentials are configured.

1. Entra ID ? **App registrations** (same app as SSO or dedicated Graph app)
2. API permissions: `Sites.ReadWrite.All`, `Files.ReadWrite.All` (admin consent required)
3. Store client secret in Key Vault
4. Set Auricrux-Central env vars per `auricrux-central-work/docs/` SharePoint runbooks

### 4.3 Azure AI Foundry agents

1. [Azure AI Foundry](https://ai.azure.com) ? your project
2. Note agent IDs for intake, support, academy guidance
3. Set in Auricrux-Central:
   - `FOUNDRY_AGENT_INTAKE_ID`
   - `FOUNDRY_AGENT_SUPPORT_ID`
   - (others as documented in central repo)

---

## Section 5 � Legal / enterprise procurement

**Canonical drafts:** [legal/enterprise/LEGAL_ENTERPRISE_INDEX.md](./legal/enterprise/LEGAL_ENTERPRISE_INDEX.md)

| Item | Action | Owner |
|------|--------|-------|
| **Enterprise legal corpus** | Review full pack at `legal/enterprise/` (MSA, DPA, SLA, security, subprocessors, policies) | Legal counsel + you |
| **IP filing pack** | Trademark, copyright, patent prep � start at [legal/IP_MASTER_INDEX.md](./legal/IP_MASTER_INDEX.md) | Legal counsel + you |
| **Privacy policy** | Counsel approves `legal/enterprise/PRIVACY_POLICY.md`; publish at `/privacy` | Legal / you |
| **Terms of service** | Counsel approves `legal/enterprise/TERMS_OF_SERVICE.md`; publish at `/terms` | Legal / you |
| **DPA / MSA / SLA** | Execute templates in `legal/enterprise/` with Order Form | Legal counsel |
| **VA SCC certificate** | Download Certificate of Fact for Google verification | You |
| **SOC 2** | Roadmap + vendor (Vanta, Drata, etc.) if pursuing enterprise | Leadership |
| **Academy accreditation** | Sign-off on electrical apprenticeship content (NCCER alignment claims) | Trade / training lead |

---

## Section 6 � GitHub repo setup (if not yet pushed)

Engineering will push `fca-mobile-maui`. If you need to do it manually:

```powershell
cd "c:\Users\Auricrux\OneDrive - Future Contractors of America LLC\fca-mobile-maui-work"
git init
git add .
git commit -m "Initial FCA Contractor Command MAUI mobile app"
gh repo create Future-Contractors-of-America-LLC/fca-mobile-maui --public --source=. --remote=origin --push
```

**Verify CI:** https://github.com/Future-Contractors-of-America-LLC/fca-mobile-maui/actions

---

## Section 7 � End-to-end verification checklist

Run after completing relevant sections above:

```powershell
# Backend health
curl https://auricrux-central.azurewebsites.net/api/health

# Core APIs
curl https://auricrux-central.azurewebsites.net/api/bids
curl https://auricrux-central.azurewebsites.net/api/projects
curl https://auricrux-central.azurewebsites.net/api/academy-lms

# Web
Start-Process "https://futurecontractorsofamerica.com/intake?plan=startup"

# Mobile CI
# Open GitHub Actions ? MAUI Build ? green check on main
```

**Customer journey test:**

1. Visit `/intake?plan=startup` ? submit company profile
2. Complete Stripe checkout (live or test)
3. Sign in at `/login`
4. Open portal billing, messages, support
5. Install mobile app (TestFlight / internal track) ? same account ? see leads/jobs

---

## Priority order (recommended)

1. **Stripe live + Startup Payment Link** (revenue today)
2. **Push `fca-mobile-maui` + green CI** (mobile credibility)
3. **Android keystore + Play Console app** (Android first � faster review)
4. **Apple Developer + TestFlight** (iOS)
5. **API subdomain DNS** (enterprise polish)
6. **Entra SSO + session secret** (enterprise sales)
7. **Legal docs + DPA** (large deals)

---

## Support contacts / links

| Resource | URL |
|----------|-----|
| Live website | https://futurecontractorsofamerica.com |
| Live API | https://auricrux-central.azurewebsites.net |
| Pilot checkout | https://buy.stripe.com/bJe14o0fQ5Pn8Tt7Bw5gc01 |
| Mobile repo | https://github.com/Future-Contractors-of-America-LLC/fca-mobile-maui |
| Legacy mobile (deprecated) | https://github.com/Future-Contractors-of-America-LLC/fca-mobile |

Questions on engineering items: continue in Cursor with repo context. Store/legal items require your direct action in the portals above.
