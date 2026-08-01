# Applying the auricrux-app hardening patches

The six patches in [`patches/`](patches/) are a `git format-patch` series against
[`Auricrux/auricrux-app`](https://github.com/Auricrux/auricrux-app) at commit `987c2a0`
(`main`, "Wave 5 lockdown: MAUI Browse/Agent/Calc/Vision tools and VisionModel default").

They live here rather than in a pull request on that repository because the automation account has
no write access to the `Auricrux` GitHub account.

## Apply

```bash
git clone https://github.com/Auricrux/auricrux-app.git
cd auricrux-app
git checkout -b enterprise-hardening

git am /path/to/fca-bid-tracker/docs/auricrux-app/patches/*.patch
```

`git am` preserves the commit messages, each of which explains why that change was made.

If `git am` fails because `main` has moved on:

```bash
git am --abort
git apply --3way /path/to/.../patches/0001-*.patch   # resolve, commit, repeat per patch
```

## Verify

```bash
dotnet build AuricruxApp.sln -c Release
dotnet test Auricrux.Tests/Auricrux.Tests.csproj -c Release --no-build
dotnet list AuricruxApp.sln package --vulnerable --include-transitive
```

Expected: build succeeds with 0 errors, **143 tests pass**, and the audit reports no vulnerable
packages in any of the four projects.

Requires the .NET 10 SDK (verified against 10.0.302). The solution excludes the MAUI project, so no
mobile workload is needed.

## Before deploying

**One breaking change.** Plan upgrades are now fail-closed. `POST /api/account/{email}/upgrade`
requires either the `X-Auricrux-Provisioning-Key` header matching `Billing:ProvisioningKey`, or an
authenticated caller listed in `Auth:AdminEmails`. A deployment with neither configured returns
`503` for every upgrade.

Set the provisioning key before or with the deploy:

```bash
az webapp config appsettings set \
  --name <app> --resource-group <rg> \
  --settings Billing__ProvisioningKey="<generated secret>"
```

and have the checkout backend send it:

```
X-Auricrux-Provisioning-Key: <the same secret>
```

To keep the previous open behaviour on a single-tenant install, set
`Billing:AllowUnauthenticatedPlanChanges: true` instead. It is reported as a warning at startup and
in `/api/capabilities`.

## Confirm the deployment

```bash
curl -s https://<host>/api/capabilities | jq '.securityPosture'
```

An empty `warnings` array is the goal. Each warning names a setting leaving the deployment more
open than recommended. The same warnings appear in the startup logs.

Full configuration reference: `docs/SECURITY_HARDENING.md`, added by patch 0006.

## The patches

| # | Commit |
|---|---|
| 0001 | Harden API authorization, tenancy, and SSRF controls |
| 0002 | Add regression coverage for the hardened boundaries |
| 0003 | Stream chat answers incrementally over server-sent events |
| 0004 | Publish an OpenAPI contract and report deployment security posture |
| 0005 | Clear dependency advisories and add security scanning to CI |
| 0006 | Document the security model, configuration, and streaming contract |

Patches 0001 and 0002 are the security fixes and should be applied together — 0002 is what keeps
0001 from regressing. The rest are independent and can be applied selectively if needed.
