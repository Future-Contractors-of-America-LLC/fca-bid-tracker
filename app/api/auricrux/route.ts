export async function POST(req: Request) {
  const body = await req.json();

  return Response.json({
    response: "Auricrux responding",
    input: body
  });
}
