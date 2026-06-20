import { CONTRACTOR_LEGAL_STORAGE_KEY, defaultContractorLegalState } from "./contractorLegalCatalog";

export function readContractorLegalState() {
  if (typeof window === "undefined") return defaultContractorLegalState;
  try {
    const raw = window.localStorage.getItem(CONTRACTOR_LEGAL_STORAGE_KEY);
    if (!raw) return { ...defaultContractorLegalState };
    const parsed = JSON.parse(raw);
    return {
      ...defaultContractorLegalState,
      ...parsed,
      checklist: mergeChecklist(parsed.checklist),
    };
  } catch {
    return { ...defaultContractorLegalState };
  }
}

function mergeChecklist(saved) {
  const savedMap = new Map((saved || []).map((item) => [item.id, item]));
  return defaultContractorLegalState.checklist.map((item) => ({
    ...item,
    ...(savedMap.get(item.id) || {}),
  }));
}

export function writeContractorLegalState(state) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(CONTRACTOR_LEGAL_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // best effort
  }
}

export function daysUntilExpiry(expiresIso) {
  if (!expiresIso) return null;
  const exp = new Date(expiresIso);
  if (Number.isNaN(exp.getTime())) return null;
  const diff = exp.getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function expiryTone(days) {
  if (days === null) return "#64748b";
  if (days < 0) return "#dc2626";
  if (days <= 30) return "#d97706";
  return "#16a34a";
}
