async function readJsonSafe(response) {
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.toLowerCase().includes("application/json")) return null;

  try {
    return await response.json();
  } catch {
    return null;
  }
}

function formatApiError(response, payload, fallbackMessage) {
  const statusSuffix = response.status ? ` (status ${response.status})` : "";
  return payload?.error || `${fallbackMessage}${statusSuffix}.`;
}

export async function fetchAcademyLms() {
  const response = await fetch("/api/academy-lms", {
    method: "GET",
    credentials: "same-origin",
    headers: {
      Accept: "application/json",
    },
  });

  const payload = await readJsonSafe(response);
  if (!response.ok || !payload?.ok) {
    throw new Error(formatApiError(response, payload, "Unable to load academy state"));
  }

  return payload;
}

export async function mutateAcademyLms(action, body = {}) {
  if (!action || typeof action !== "string") {
    throw new Error("Unable to mutate academy state: action is required.");
  }

  const response = await fetch("/api/academy-lms", {
    method: "PATCH",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ action, ...body }),
  });

  const payload = await readJsonSafe(response);
  if (!response.ok || !payload?.ok) {
    throw new Error(formatApiError(response, payload, "Unable to mutate academy state"));
  }

  return payload;
}
