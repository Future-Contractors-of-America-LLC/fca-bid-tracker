const CENTRAL_API =
  process.env.AURICRUX_CENTRAL_API ||
  "https://api.futurecontractorsofamerica.com/api";

async function readCentralResponse(response: Response) {
  const text = await response.text();
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    return { ok: false, error: text };
  }
}

export async function GET(req: Request) {
  const query = new URL(req.url).search;
  const response = await fetch(`${CENTRAL_API}/auricrux${query}`, {
    method: "GET",
    headers: { Accept: "application/json" },
  });
  const payload = await readCentralResponse(response);
  return Response.json(payload, { status: response.status });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const response = await fetch(`${CENTRAL_API}/auricrux`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(body),
  });
  const payload = await readCentralResponse(response);
  return Response.json(payload, { status: response.status });
}
