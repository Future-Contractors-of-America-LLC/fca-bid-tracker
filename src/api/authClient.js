export async function fetchCustomerAuthState() {
  const response = await fetch("/api/customer-auth-state", {
    method: "GET",
    credentials: "same-origin",
    headers: {
      Accept: "application/json",
    },
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok || !payload?.ok) {
    throw new Error(payload?.error || "Unable to load customer auth state.");
  }

  return payload;
}
