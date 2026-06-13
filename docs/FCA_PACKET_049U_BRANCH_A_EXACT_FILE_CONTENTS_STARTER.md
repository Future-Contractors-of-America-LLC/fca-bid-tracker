# FCA_PACKET_049U_BRANCH_A_EXACT_FILE_CONTENTS_STARTER

Status: Proposed  
Sequence: Follows 049T  
Scope: Exact starter contents for Branch A files, including export signatures, canonical status enums, degraded warning helper shape, and selector entrypoint starter content  
Truth boundary: This packet provides repo-ready starter file contents for Branch A. It does not claim the files already exist in `main`, that they compile against the current codebase without inspection adjustments, or that later consumer adoption is already complete.

---

## 1. Issue

049T fixed the first execution branch and file order, but Branch A can still drift if exact starter content is not frozen before implementation begins.

Without exact contents:
- canonical type files may diverge in shape
- status values may fork immediately
- degraded-warning handling may remain ambiguous
- selector entrypoint may expose unstable or duplicated contracts

---

## 2. Decision

Freeze exact starter contents for Branch A as the canonical implementation starter for the first Wave 1 execution branch:

- `packet-049r-branch-a-shared-contracts-normalization`

This packet defines starter contents only for the Branch A shared contract layer.

---

## 3. File 1 — `src/lib/academy/authorityConsumerState.ts`

```ts
export type AuthorityWarningCode =
  | 'UNRESOLVED_AUTHORITY_SOURCE'
  | 'STALE_AUTHORITY_STATE'
  | 'MISSING_READINESS_INPUT'
  | 'MISSING_CREDENTIAL_INPUT'
  | 'MISSING_RECOMMENDATION_INPUT'
  | 'DEGRADED_EVIDENCE_LINKAGE'
  | 'UNKNOWN_AUTHORITY_ERROR';

export interface AuthorityWarning {
  code: AuthorityWarningCode;
  message: string;
  severity: 'info' | 'warning' | 'critical';
  source?: string;
  blocking?: boolean;
}

export interface AuthorityConsumerState {
  tenantId: string;
  userId: string;
  academyContextId?: string | null;
  authorityStatus: 'resolved' | 'degraded' | 'unavailable';
  authorityWarnings: AuthorityWarning[];
  readinessSummary?: {
    normalizedStatus: NormalizedAcademyStatus;
    completionPercent?: number;
  } | null;
  credentialSummary?: {
    normalizedStatus: NormalizedAcademyStatus;
    count?: number;
  } | null;
  recommendationSummary?: {
    total?: number;
    blocking?: number;
  } | null;
  lastVerifiedAt?: string | null;
}

export function buildDegradedAuthorityConsumerState(input: {
  tenantId: string;
  userId: string;
  academyContextId?: string | null;
  warnings?: AuthorityWarning[];
  source?: string;
}): AuthorityConsumerState {
  const warnings = input.warnings?.length
    ? input.warnings
    : [
        {
          code: 'UNRESOLVED_AUTHORITY_SOURCE',
          message: 'Authority source could not be fully resolved.',
          severity: 'warning',
          source: input.source,
          blocking: false,
        },
      ];

  return {
    tenantId: input.tenantId,
    userId: input.userId,
    academyContextId: input.academyContextId ?? null,
    authorityStatus: 'degraded',
    authorityWarnings: warnings,
    readinessSummary: null,
    credentialSummary: null,
    recommendationSummary: null,
    lastVerifiedAt: null,
  };
}

export function hasAuthorityWarnings(state: AuthorityConsumerState | null | undefined): boolean {
  return Boolean(state?.authorityWarnings?.length);
}

import type { NormalizedAcademyStatus } from './normalizeAcademyStatus';
```

### Required notes
- `authorityStatus` is **not** a replacement for readiness/credential status.
- degraded state must remain explicit.
- warnings are render-safe structured objects, not raw strings.

---

## 4. File 2 — `src/lib/academy/readinessState.ts`

```ts
import type { NormalizedAcademyStatus } from './normalizeAcademyStatus';

export type NormalizedReadinessStatus = NormalizedAcademyStatus;

export interface ReadinessState {
  id: string;
  tenantId: string;
  userId: string;
  academyContextId?: string | null;
  domain: string;
  normalizedStatus: NormalizedReadinessStatus;
  completionPercent?: number | null;
  blockingReasons: string[];
  supportingEvidenceIds: string[];
  recommendedActionIds: string[];
  updatedAt?: string | null;
}
```

### Required notes
- do not define a readiness-only alternate enum.
- `supportingEvidenceIds` is the canonical Wave 1 evidence hook.

---

## 5. File 3 — `src/lib/academy/credentialState.ts`

```ts
import type { NormalizedAcademyStatus } from './normalizeAcademyStatus';

export type NormalizedCredentialStatus = NormalizedAcademyStatus;

export interface CredentialState {
  id: string;
  tenantId: string;
  userId: string;
  credentialType: string;
  normalizedStatus: NormalizedCredentialStatus;
  awardedAt?: string | null;
  expiresAt?: string | null;
  evidenceFileIds: string[];
  reviewStatus?: 'not_required' | 'pending' | 'approved' | 'rejected' | null;
  updatedAt?: string | null;
}
```

### Required notes
- `reviewStatus` supplements but does not replace `normalizedStatus`.
- `evidenceFileIds` must later resolve through shared file/evidence selectors.

---

## 6. File 4 — `src/lib/academy/recommendationState.ts`

```ts
export type RecommendationPriority = 'low' | 'medium' | 'high' | 'critical';

export type RecommendationActionState =
  | 'available'
  | 'in_progress'
  | 'completed'
  | 'blocked'
  | 'dismissed';

export interface RecommendationState {
  id: string;
  tenantId: string;
  userId: string;
  sourceType: string;
  sourceId: string;
  recommendationType: string;
  title: string;
  detail?: string | null;
  priority: RecommendationPriority;
  linkedReadinessId?: string | null;
  linkedCredentialId?: string | null;
  linkedFileIds: string[];
  linkedLessonId?: string | null;
  actionState: RecommendationActionState;
  generatedAt?: string | null;
}
```

### Required notes
- recommendation state must remain attributable to `sourceType` + `sourceId`.
- recommendation objects must not be display-only fabricated UI text.

---

## 7. File 5 — `src/lib/academy/academyEvidenceLink.ts`

```ts
export type LinkedObjectType =
  | 'readiness_state'
  | 'credential_state'
  | 'recommendation_state'
  | 'lesson_asset'
  | 'academy_context'
  | 'project_context';

export type EvidenceRelation =
  | 'supports'
  | 'requires_review'
  | 'remediates'
  | 'references'
  | 'verifies';

export interface AcademyEvidenceLink {
  id: string;
  tenantId: string;
  linkedObjectType: LinkedObjectType;
  linkedObjectId: string;
  fileId: string;
  relation: EvidenceRelation;
  createdAt?: string | null;
  createdBy?: string | null;
}
```

### Required notes
- this is a shared academy-to-file linkage object, not a separate storage schema.
- `fileId` must align with the shared file spine, not an academy-local file lane.

---

## 8. File 6 — `src/lib/academy/normalizeAcademyStatus.ts`

```ts
export const NORMALIZED_ACADEMY_STATUSES = [
  'ready',
  'in_progress',
  'blocked',
  'expired',
  'missing_evidence',
  'needs_review',
  'unavailable',
] as const;

export type NormalizedAcademyStatus = (typeof NORMALIZED_ACADEMY_STATUSES)[number];

export function normalizeAcademyStatus(value: unknown): NormalizedAcademyStatus {
  if (typeof value !== 'string') {
    return 'unavailable';
  }

  const normalized = value.trim().toLowerCase();

  switch (normalized) {
    case 'ready':
    case 'complete':
    case 'completed':
    case 'active_ready':
      return 'ready';

    case 'in_progress':
    case 'in-progress':
    case 'progressing':
    case 'pending_completion':
      return 'in_progress';

    case 'blocked':
    case 'gated':
    case 'locked':
      return 'blocked';

    case 'expired':
    case 'lapsed':
      return 'expired';

    case 'missing_evidence':
    case 'missing-evidence':
    case 'needs_evidence':
      return 'missing_evidence';

    case 'needs_review':
    case 'needs-review':
    case 'pending_review':
    case 'under_review':
      return 'needs_review';

    case 'unavailable':
    case 'unknown':
    default:
      return 'unavailable';
  }
}
```

### Required notes
- no component may define competing normalization.
- all later readiness and credential rendering must consume this vocabulary.

---

## 9. File 7 — `src/lib/academy/normalizeAuthorityWarnings.ts`

```ts
import type { AuthorityWarning, AuthorityWarningCode } from './authorityConsumerState';

const DEFAULT_WARNING_MESSAGES: Record<AuthorityWarningCode, string> = {
  UNRESOLVED_AUTHORITY_SOURCE: 'Authority source could not be resolved.',
  STALE_AUTHORITY_STATE: 'Authority state appears stale.',
  MISSING_READINESS_INPUT: 'Readiness input is missing.',
  MISSING_CREDENTIAL_INPUT: 'Credential input is missing.',
  MISSING_RECOMMENDATION_INPUT: 'Recommendation input is missing.',
  DEGRADED_EVIDENCE_LINKAGE: 'Evidence linkage is degraded or incomplete.',
  UNKNOWN_AUTHORITY_ERROR: 'An unknown authority error occurred.',
};

export function normalizeAuthorityWarnings(input: unknown): AuthorityWarning[] {
  if (!Array.isArray(input)) {
    return [];
  }

  return input.map((item) => {
    const code = typeof item?.code === 'string'
      ? (item.code as AuthorityWarningCode)
      : 'UNKNOWN_AUTHORITY_ERROR';

    return {
      code,
      message:
        typeof item?.message === 'string' && item.message.trim().length > 0
          ? item.message
          : DEFAULT_WARNING_MESSAGES[code] ?? DEFAULT_WARNING_MESSAGES.UNKNOWN_AUTHORITY_ERROR,
      severity:
        item?.severity === 'info' || item?.severity === 'warning' || item?.severity === 'critical'
          ? item.severity
          : 'warning',
      source: typeof item?.source === 'string' ? item.source : undefined,
      blocking: typeof item?.blocking === 'boolean' ? item.blocking : false,
    };
  });
}
```

### Required notes
- output must be render-safe and structurally predictable.
- unresolved input must degrade safely to empty array, not throw.

---

## 10. File 8 — `src/lib/academy/selectors/index.ts`

```ts
export * from '../authorityConsumerState';
export * from '../readinessState';
export * from '../credentialState';
export * from '../recommendationState';
export * from '../academyEvidenceLink';
export * from '../normalizeAcademyStatus';
export * from '../normalizeAuthorityWarnings';

export * from './selectAuthorityConsumerState';
export * from './selectReadinessState';
export * from './selectCredentialState';
export * from './selectRecommendationState';
export * from './selectAcademyEvidenceLinks';
```

### Required notes
- this is the single export surface for Branch A starter selectors.
- do not fork parallel selector index files.

---

## 11. File 9 — `src/lib/academy/selectors/selectAuthorityConsumerState.ts`

```ts
import {
  AuthorityConsumerState,
  buildDegradedAuthorityConsumerState,
} from '../authorityConsumerState';
import { normalizeAcademyStatus } from '../normalizeAcademyStatus';
import { normalizeAuthorityWarnings } from '../normalizeAuthorityWarnings';

export function selectAuthorityConsumerState(input: any): AuthorityConsumerState {
  if (!input?.tenantId || !input?.userId) {
    return buildDegradedAuthorityConsumerState({
      tenantId: input?.tenantId ?? 'unknown-tenant',
      userId: input?.userId ?? 'unknown-user',
      academyContextId: input?.academyContextId ?? null,
      source: 'selectAuthorityConsumerState',
    });
  }

  const warnings = normalizeAuthorityWarnings(input?.authorityWarnings);

  return {
    tenantId: input.tenantId,
    userId: input.userId,
    academyContextId: input?.academyContextId ?? null,
    authorityStatus: warnings.length > 0 ? 'degraded' : (input?.authorityStatus ?? 'resolved'),
    authorityWarnings: warnings,
    readinessSummary: input?.readinessSummary
      ? {
          normalizedStatus: normalizeAcademyStatus(input.readinessSummary.normalizedStatus),
          completionPercent: input.readinessSummary.completionPercent ?? null,
        }
      : null,
    credentialSummary: input?.credentialSummary
      ? {
          normalizedStatus: normalizeAcademyStatus(input.credentialSummary.normalizedStatus),
          count: input.credentialSummary.count ?? null,
        }
      : null,
    recommendationSummary: input?.recommendationSummary
      ? {
          total: input.recommendationSummary.total ?? 0,
          blocking: input.recommendationSummary.blocking ?? 0,
        }
      : null,
    lastVerifiedAt: input?.lastVerifiedAt ?? null,
  };
}
```

---

## 12. File 10 — `src/lib/academy/selectors/selectReadinessState.ts`

```ts
import { ReadinessState } from '../readinessState';
import { normalizeAcademyStatus } from '../normalizeAcademyStatus';

export function selectReadinessState(input: any): ReadinessState {
  return {
    id: String(input?.id ?? ''),
    tenantId: String(input?.tenantId ?? ''),
    userId: String(input?.userId ?? ''),
    academyContextId: input?.academyContextId ?? null,
    domain: String(input?.domain ?? 'unknown'),
    normalizedStatus: normalizeAcademyStatus(input?.normalizedStatus),
    completionPercent: input?.completionPercent ?? null,
    blockingReasons: Array.isArray(input?.blockingReasons) ? input.blockingReasons : [],
    supportingEvidenceIds: Array.isArray(input?.supportingEvidenceIds) ? input.supportingEvidenceIds : [],
    recommendedActionIds: Array.isArray(input?.recommendedActionIds) ? input.recommendedActionIds : [],
    updatedAt: input?.updatedAt ?? null,
  };
}
```

---

## 13. File 11 — `src/lib/academy/selectors/selectCredentialState.ts`

```ts
import { CredentialState } from '../credentialState';
import { normalizeAcademyStatus } from '../normalizeAcademyStatus';

export function selectCredentialState(input: any): CredentialState {
  return {
    id: String(input?.id ?? ''),
    tenantId: String(input?.tenantId ?? ''),
    userId: String(input?.userId ?? ''),
    credentialType: String(input?.credentialType ?? 'unknown'),
    normalizedStatus: normalizeAcademyStatus(input?.normalizedStatus),
    awardedAt: input?.awardedAt ?? null,
    expiresAt: input?.expiresAt ?? null,
    evidenceFileIds: Array.isArray(input?.evidenceFileIds) ? input.evidenceFileIds : [],
    reviewStatus: input?.reviewStatus ?? null,
    updatedAt: input?.updatedAt ?? null,
  };
}
```

---

## 14. File 12 — `src/lib/academy/selectors/selectRecommendationState.ts`

```ts
import { RecommendationState } from '../recommendationState';

export function selectRecommendationState(input: any): RecommendationState {
  return {
    id: String(input?.id ?? ''),
    tenantId: String(input?.tenantId ?? ''),
    userId: String(input?.userId ?? ''),
    sourceType: String(input?.sourceType ?? 'unknown'),
    sourceId: String(input?.sourceId ?? ''),
    recommendationType: String(input?.recommendationType ?? 'unknown'),
    title: String(input?.title ?? ''),
    detail: input?.detail ?? null,
    priority: input?.priority ?? 'medium',
    linkedReadinessId: input?.linkedReadinessId ?? null,
    linkedCredentialId: input?.linkedCredentialId ?? null,
    linkedFileIds: Array.isArray(input?.linkedFileIds) ? input.linkedFileIds : [],
    linkedLessonId: input?.linkedLessonId ?? null,
    actionState: input?.actionState ?? 'available',
    generatedAt: input?.generatedAt ?? null,
  };
}
```

---

## 15. File 13 — `src/lib/academy/selectors/selectAcademyEvidenceLinks.ts`

```ts
import { AcademyEvidenceLink } from '../academyEvidenceLink';

export function selectAcademyEvidenceLinks(input: any): AcademyEvidenceLink[] {
  if (!Array.isArray(input)) {
    return [];
  }

  return input.map((item) => ({
    id: String(item?.id ?? ''),
    tenantId: String(item?.tenantId ?? ''),
    linkedObjectType: item?.linkedObjectType ?? 'academy_context',
    linkedObjectId: String(item?.linkedObjectId ?? ''),
    fileId: String(item?.fileId ?? ''),
    relation: item?.relation ?? 'references',
    createdAt: item?.createdAt ?? null,
    createdBy: item?.createdBy ?? null,
  }));
}
```

---

## 16. Starter Non-Regression Rules

- Do not add dashboard, recommendation rail, readiness panel, or credential panel JSX rewrites in Branch A.
- Do not create a second academy status normalization file.
- Do not create academy-local file objects that bypass the shared file spine.
- Do not replace structured warnings with plain strings.
- Do not imply that these starter contents are already integrated everywhere.

---

## 17. Apply Order

Apply exactly in this order:
1. `normalizeAcademyStatus.ts`
2. `authorityConsumerState.ts`
3. `readinessState.ts`
4. `credentialState.ts`
5. `recommendationState.ts`
6. `academyEvidenceLink.ts`
7. `normalizeAuthorityWarnings.ts`
8. selector files
9. selector index

Reason: foundational types and normalization must exist before selector content references them.

---

## 18. Validation Expectations for Branch A Starter

Branch A starter is valid only when:
- all canonical starter files exist
- no duplicate local status enum is introduced in the same patch
- degraded authority helper exists
- selector entrypoint exists
- no consumer UI convergence is bundled into the same patch

---

## 19. Definition of Done

049U is complete when:
- exact starter contents for Branch A files are frozen
- export signatures are frozen
- normalized status vocabulary is frozen
- degraded warning helper shape is frozen
- selector entrypoint starter content is frozen
- next artifact is identified

---

## 20. Next Artifact

**FCA_PACKET_049V_BRANCH_A_REPO_APPLY_PLAN.md**

This next artifact must convert 049U into:
- exact repo apply sequence
- commit split plan for Branch A
- first PR creation sequence
- first validation checklist application
- first merge readiness confirmation flow
```