export async function fetchAcademyLms() {
  const response = await fetch("/api/academy-lms", {
    method: "GET",
    credentials: "same-origin",
    headers: {
      Accept: "application/json",
    },
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok || !payload?.ok) {
    throw new Error(payload?.error || "Unable to load academy state.");
  }

  return payload;
}

export async function mutateAcademyLms(action, body = {}) {
  const response = await fetch("/api/academy-lms", {
    method: "PATCH",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ action, ...body }),
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok || !payload?.ok) {
    throw new Error(payload?.error || "Unable to mutate academy state.");
  }

  return payload;
}
