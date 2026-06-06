import { app } from "@azure/functions";

const sampleBids = [
  {
    id: "bid-001",
    customer: "Future Contractors of America Pilot Workspace",
    status: "review",
    amount: 12500,
  },
  {
    id: "bid-002",
    customer: "Auricrux Demo Account",
    status: "submitted",
    amount: 21800,
  },
];

app.http("bids", {
  methods: ["GET", "POST"],
  authLevel: "anonymous",
  route: "bids",
  handler: async (request) => {
    if (request.method === "GET") {
      return {
        status: 200,
        jsonBody: {
          ok: true,
          items: sampleBids,
          count: sampleBids.length,
        },
      };
    }

    const body = await request.json().catch(() => ({}));
    const submissionId = body?.submissionId || body?.id || `bid-${Date.now()}`;

    return {
      status: 200,
      jsonBody: {
        ok: true,
        accepted: true,
        submissionId,
        message: "Bid submission accepted",
      },
    };
  },
});
