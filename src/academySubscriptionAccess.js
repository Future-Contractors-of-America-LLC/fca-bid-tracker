/** Operator guides and member-only academy surfaces require an active workspace subscription. */

export function hasAcademySubscription(session) {
  if (!session?.authenticated) return false;
  if (session.enabledProducts?.lms === false) return false;
  return Boolean(session.email || session.customerId);
}

export const MEMBER_ONLY_PATHWAY_KEYS = new Set(["fca-how-to"]);

export function shouldShowMemberOnlyPathway(pathwayKey, session) {
  if (!MEMBER_ONLY_PATHWAY_KEYS.has(pathwayKey)) return true;
  return hasAcademySubscription(session);
}

export function filterVisiblePathways(pathways, session) {
  return (pathways || []).filter((pathway) => shouldShowMemberOnlyPathway(pathway.key, session));
}

export function filterVisibleLanes(lanes, session) {
  return (lanes || []).filter((lane) => shouldShowMemberOnlyPathway(lane.key, session));
}
