export function getAcademyAuthoritySnapshot({ meta, loading, mutationState }) {
  const warning = meta?.warning || mutationState?.error || null;
  const authoritative = Boolean(!loading && meta?.authoritativeState && !warning);

  if (loading) {
    return {
      state: "loading",
      badgeLabel: "Provider syncing",
      badgeBackground: "#dbeafe",
      badgeColor: "#1d4ed8",
      bannerTone: "warning",
      bannerTitle: "Academy truth boundary / API caution",
      bannerDetail: "Academy LMS state is still loading. Do not treat the current surface as fully authoritative until the API sync resolves.",
    };
  }

  if (authoritative) {
    return {
      state: "authoritative",
      badgeLabel: mutationState?.activeAction ? `Mutation active · ${mutationState.activeAction}` : "Authoritative provider active",
      badgeBackground: mutationState?.activeAction ? "#dbeafe" : "#dcfce7",
      badgeColor: mutationState?.activeAction ? "#1d4ed8" : "#166534",
      bannerTone: "ok",
      bannerTitle: "Authoritative Academy state active",
      bannerDetail: "Academy transcript, cohort, credential, and lesson progression surfaces are currently reading from the API-backed LMS spine for this session.",
    };
  }

  return {
    state: "caution",
    badgeLabel: "Fallback / caution state",
    badgeBackground: "#fef3c7",
    badgeColor: "#92400e",
    bannerTone: "warning",
    bannerTitle: "Academy truth boundary / API caution",
    bannerDetail: warning || "Academy API state is degraded or unverified. Treat the current screen as non-authoritative until backend state is restored.",
  };
}
