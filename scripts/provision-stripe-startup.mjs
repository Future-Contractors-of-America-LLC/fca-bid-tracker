#!/usr/bin/env node
/**
 * Provision Stripe Payment Link for $99/mo Startup plan when STRIPE_SECRET_KEY is set.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

const secretKey = process.env.STRIPE_SECRET_KEY || "";

async function main() {
  if (!secretKey) {
    console.log("STRIPE_SECRET_KEY not set — skipping live link creation.");
    console.log("Set the key and re-run, or set VITE_STRIPE_STARTUP_CHECKOUT_URL in SWA app settings.");
    process.exit(0);
  }

  const Stripe = (await import("stripe")).default;
  const stripe = new Stripe(secretKey);

  let product;
  const existing = await stripe.products.search({ query: "name:'FCA Startup Workspace'" });
  if (existing.data.length) {
    product = existing.data[0];
  } else {
    product = await stripe.products.create({
      name: "FCA Startup Workspace",
      description: "Monthly SaaS workspace for owner-operators — bids, projects, Academy, Auricrux.",
    });
  }

  let price;
  const prices = await stripe.prices.list({ product: product.id, active: true, limit: 10 });
  price = prices.data.find((p) => p.recurring?.interval === "month" && p.unit_amount === 9900);
  if (!price) {
    price = await stripe.prices.create({
      product: product.id,
      unit_amount: 9900,
      currency: "usd",
      recurring: { interval: "month" },
    });
  }

  const link = await stripe.paymentLinks.create({
    line_items: [{ price: price.id, quantity: 1 }],
    allow_promotion_codes: true,
  });

  const offersPath = path.join(root, "auricrux/system/offers.json");
  const offers = JSON.parse(fs.readFileSync(offersPath, "utf8"));
  const startup = offers.offers.find((o) => o.id === "startup");
  if (startup) {
    startup.checkoutBase = link.url;
    startup.status = "active";
    startup.notes = "Provisioned by revenue sprint automation.";
  }
  offers.updatedUtc = new Date().toISOString();
  fs.writeFileSync(offersPath, JSON.stringify(offers, null, 2));

  console.log("Startup Payment Link:", link.url);
  console.log("Set SWA env: VITE_STRIPE_STARTUP_CHECKOUT_URL=" + link.url);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
