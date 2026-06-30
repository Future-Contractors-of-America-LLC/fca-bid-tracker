# FCA Academy — Auth Hardening Requirements for CHPS Compliance

**Branch:** `chps/auth-hardening`  
**Priority:** CRITICAL — must be complete before committee review URL is shared  
**Linked compliance:** FERPA, COPPA, SOPIPA, Va. Code § 22.1-287.02

---

## Problem Statement

The current FCA Academy site has a critical security gap:
- Visiting the site from **any computer** shows progress and data as if logged in
- Clicking backend-linked features either **auto-logs in** or **treats the user as already authenticated**
- Protected API routes accept **unauthenticated requests** via a seeded fallback (`TEN-FCA-001`)

This is a **FERPA violation** if any student education records are behind those routes, and a **SOPIPA violation** because it means student data could be viewed without authorization.

---

## Required Changes

### 1. Remove ALL seeded fallbacks from read routes
Current state: `resolveTenantContextFromRequest` with `allowSeededFallback: true` means unauthenticated GET requests receive real data under `TEN-FCA-001`.

Required: ALL routes serving student data (academy, portal, files, projects, bids, workflow) must return `401` for unauthenticated requests. Only truly public routes (home, pricing, legal pages) remain accessible without login.

### 2. Enforce strict session cookie requirements
- Cookie flags: `HttpOnly; Secure; SameSite=Strict`
- No token in localStorage, sessionStorage, or URL parameters
- Session secret must be set via `FCA_SESSION_SECRET` env var — no default secret in production

### 3. Student account idle timeout
- Accounts with role `student` must have a 30-minute idle timeout
- Accounts with role `instructor` or `admin` use the existing 8-hour TTL
- Idle timeout implemented via `lastActiveAt` timestamp in session payload

### 4. Login/logout audit log
- Every authentication event must be written to the audit store:
  - `event_type`: `login_success`, `login_failure`, `logout`, `session_expired`, `session_idle_timeout`
  - `timestamp`: ISO 8601
  - `role`: student / instructor / admin
  - `sessionId`: first 8 chars of hashed session ID (not full token)
  - `ipHash`: SHA-256 of IP address (COPPA: no raw IP stored for student accounts)

### 5. Role-based data isolation
- Students may only read their own progress records
- Instructors may read progress for their enrolled cohort only
- Admins have full read access with audit log on every read
- No cross-tenant or cross-student data leakage

### 6. Student account provisioning flow
- Admin creates accounts via `/portal/admin/students`
- System generates non-identifying username (`student-NNN`) and one-time access code
- Student uses access code to set their own password on first login
- No email, name, or PII collected at any point
- Access code expires after first use

---

## File Targets

| File | Change |
|---|---|
| `api/auth-boundary.js` | Enforce strict cookies; remove seeded fallback default; add idle timeout logic |
| `api/academy-lms.js` | `allowSeededFallback: false` on GET |
| `api/bids.js` | `allowSeededFallback: false` on GET |
| `api/projects.js` | `allowSeededFallback: false` on GET |
| `api/files.js` | `allowSeededFallback: false` on GET |
| `api/leads.js` | `allowSeededFallback: false` on GET |
| `api/workflow-audit.js` | `allowSeededFallback: false` |
| `api/audit-events-summary.js` | `allowSeededFallback: false` |
| `api/files-summary.js` | `allowSeededFallback: false` |
| `api/projects-workspace.js` | `allowSeededFallback: false` |
| `api/opportunities-workspace.js` | `allowSeededFallback: false` |
| `api/session.js` | Add idle timeout check; add audit log write on session events |
| `api/login.js` | Add audit log write on login success/failure |
| `src/hooks/useAuth.js` | Remove any ambient session assumption; hard redirect to /login on 401 |
| `src/pages/website/Privacy.jsx` | Add COPPA/SOPIPA/FERPA disclosures |
| `src/pages/website/Terms.jsx` | Add FERPA school official language and data use terms |

---

## Acceptance Criteria

- [ ] Visiting any `/portal/*` or `/academy/*` route without a valid session cookie returns HTTP 401 and redirects to `/login`
- [ ] No data is visible on academy or portal pages without completing the login flow
- [ ] Session cookies have `HttpOnly`, `Secure`, `SameSite=Strict` flags set
- [ ] Student session expires after 30 minutes of inactivity
- [ ] Login, logout, and session expiry events appear in the audit log
- [ ] 80 student accounts can be provisioned from the admin panel without collecting any PII
- [ ] Each account generates a unique one-time access code
- [ ] All existing Bugbot/Copilot review issues on impacted files are resolved

---

## Review URL (after deployment)

Once auth hardening is deployed and 80 student accounts are provisioned:

```
https://futurecontractorsofamerica.com/academy
```

This URL will be shared with the CHPS Innovative Learning Team committee for review.
