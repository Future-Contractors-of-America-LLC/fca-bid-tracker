/** Azure Functions v4 helper — forward requests to Auricrux Central. */
export const CENTRAL_API =
  process.env.AURICRUX_CENTRAL_API ||
  "https://api.futurecontractorsofamerica.com/api";

export async function proxyCentralRequest(request, resourcePath) {
  const url = new URL(request.url);
  const target = `${CENTRAL_API}${resourcePath}${url.search}`;

  const init = {
    method: request.method,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  };

  if (request.method !== "GET" && request.method !== "HEAD") {
    const body = await request.text();
    if (body) init.body = body;
  }

  const response = await fetch(target, init);
  const text = await response.text();
  let jsonBody = {};
  if (text) {
    try {
      jsonBody = JSON.parse(text);
    } catch {
      jsonBody = { ok: false, error: text };
    }
  }

  return { status: response.status, jsonBody };
}
