async function requestJson(url, options = {}) {
  const response = await fetch(url, {
    credentials: "same-origin",
    headers: {
      Accept: "application/json",
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...(options.headers || {}),
    },
    ...options,
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || !payload?.ok) {
    throw new Error(payload?.error || `Request failed for ${url}`);
  }
  return payload;
}

export function fetchEstimates() {
  return requestJson("/api/estimates");
}

export function mutateEstimate(action, body = {}) {
  return requestJson("/api/estimates", {
    method: "PATCH",
    body: JSON.stringify({ action, ...body }),
  });
}

export function fetchProposals() {
  return requestJson("/api/proposals");
}

export function mutateProposal(action, body = {}) {
  return requestJson("/api/proposals", {
    method: "PATCH",
    body: JSON.stringify({ action, ...body }),
  });
}
