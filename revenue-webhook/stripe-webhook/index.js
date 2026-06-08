import { app } from "@azure/functions";
import Stripe from "stripe";
import fs from "fs";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

function writeJson(path, obj) {
  fs.mkdirSync(path.split("/").slice(0, -1).join("/"), { recursive: true });
  fs.writeFileSync(path, JSON.stringify(obj, null, 2), "utf-8");
}

app.http("stripe-webhook", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "stripe-webhook",
  handler: async (request) => {
    const sig = request.headers.get("stripe-signature");
    const rawBody = await request.text();

    let event;
    try {
      event = stripe.webhooks.constructEvent(
        rawBody,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch {
      return { status: 400, body: "Invalid signature" };
    }

    // We care about checkout completion (Payment Links use Checkout under the hood)
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;

      const intakeId = session.client_reference_id || "";
      if (!intakeId) {
        return { status: 200, body: "No intakeId; ignored" };
      }

      // Write payment proof artifact (Auricrux will read this from the repo)
      // NOTE: This function is deployed separately; it does not commit to GitHub itself.
      // It writes to storage in production; Auricrux pulls and mirrors it into repo pipeline.
      // We'll implement this as durable proof by writing into the Function App filesystem for now.
      // (Next step: store in Azure Table/Cosmos and mirror to repo.)
      writeJson(`payments/${intakeId}.json`, {
        intakeId,
        paidUtc: new Date().toISOString(),
        stripeEventId: event.id,
        amount_total: session.amount_total,
        currency: session.currency,
        customer_email: session.customer_details?.email || ""
      });

      return { status: 200, jsonBody: { ok: true, intakeId } };
    }

    return { status: 200, body: "ok" };
  }
});
