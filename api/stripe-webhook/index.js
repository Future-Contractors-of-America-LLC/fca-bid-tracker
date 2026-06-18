const { TableClient } = require("@azure/data-tables");

const PAYMENTS_TABLE = "Payments";

function connectionString() {
  return (
    process.env.FCA_TABLE_STORAGE_CONNECTION ||
    process.env.AzureWebJobsStorage ||
    process.env.AZURE_WEBJOBS_STORAGE ||
    ""
  );
}

async function persistPayment(record) {
  const cs = connectionString();
  if (!cs) return false;

  const client = TableClient.fromConnectionString(cs, PAYMENTS_TABLE);
  try {
    await client.createTable();
  } catch (error) {
    if (error?.statusCode !== 409) throw error;
  }

  const rowKey = record.intakeId || record.stripeEventId || `payment-${Date.now()}`;
  await client.upsertEntity(
    {
      partitionKey: "payments",
      rowKey,
      payload: JSON.stringify(record),
      paidUtc: record.paidUtc || new Date().toISOString(),
    },
    "Replace"
  );
  return true;
}

module.exports = async function (context, req) {
  const secretKey = process.env.STRIPE_SECRET_KEY || "";
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "";

  if (!secretKey || !webhookSecret) {
    context.res = {
      status: 503,
      headers: { "Content-Type": "application/json" },
      body: {
        ok: false,
        error: "Stripe not configured. Set STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET.",
      },
    };
    return;
  }

  const Stripe = require("stripe");
  const stripe = new Stripe(secretKey);
  const signature = req.headers["stripe-signature"];
  const rawBody = req.rawBody || req.body;

  let event;
  try {
    const payload = typeof rawBody === "string" ? rawBody : JSON.stringify(rawBody || {});
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (error) {
    context.res = {
      status: 400,
      headers: { "Content-Type": "application/json" },
      body: { ok: false, error: error?.message || "Invalid Stripe signature" },
    };
    return;
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const intakeId = session.client_reference_id || session.metadata?.intakeId || "";
    const record = {
      intakeId,
      paidUtc: new Date().toISOString(),
      stripeEventId: event.id,
      amount_total: session.amount_total,
      currency: session.currency,
      customer_email: session.customer_details?.email || "",
      payment_status: session.payment_status || "paid",
    };

    const persisted = await persistPayment(record);
    context.res = {
      status: 200,
      headers: { "Content-Type": "application/json" },
      body: { ok: true, intakeId, persisted },
    };
    return;
  }

  context.res = {
    status: 200,
    headers: { "Content-Type": "application/json" },
    body: { ok: true, ignored: event.type },
  };
};
