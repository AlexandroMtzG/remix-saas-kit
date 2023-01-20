import Stripe from "stripe";
import { SubscriptionBillingPeriod } from "~/application/enums/core/subscriptions/SubscriptionBillingPeriod";
const stripe = new Stripe(process.env.REMIX_STRIPE_SK?.toString() ?? "", {
  apiVersion: "2020-08-27",
});

export async function createStripeSession(customer: string, price: string) {
  const site = process.env.REMIX_SERVER_URL?.toString() ?? "";
  return await stripe.checkout.sessions.create({
    customer,
    success_url: site + "/app/settings/subscription?session_id={CHECKOUT_SESSION_ID}",
    cancel_url: site + "/app/settings/subscription",
    line_items: [{ price, quantity: 1 }],
    mode: "subscription",
  });
}

export async function getStripeSession(id: string) {
  return await stripe.checkout.sessions.retrieve(id);
}

export async function cancelStripeSubscription(subscriptionId: string) {
  return await stripe.subscriptions.del(subscriptionId);
}

export async function getStripeSubscription(id: string) {
  try {
    return await stripe.subscriptions.retrieve(id);
  } catch (e) {
    return null;
  }
}

export async function createStripeCustomer(email: string, name: string) {
  return await stripe.customers.create({
    email,
    name,
  });
}

export async function createStripeProduct(data: { title: string }) {
  return await stripe.products.create({
    name: data.title,
  });
}

export async function createStripePrice(productId: string, data: { billingPeriod: SubscriptionBillingPeriod; price: number; currency: string }) {
  let interval: "day" | "week" | "month" | "year" = "month";
  switch (data.billingPeriod) {
    case SubscriptionBillingPeriod.MONTHLY:
      interval = "month";
      break;
    case SubscriptionBillingPeriod.WEEKLY:
      interval = "week";
      break;
    case SubscriptionBillingPeriod.YEARLY:
      interval = "year";
      break;
    case SubscriptionBillingPeriod.DAILY:
      interval = "day";
      break;
  }
  return await stripe.prices.create({
    unit_amount: data.price * 100,
    currency: data.currency,
    recurring: { interval },
    product: productId,
    active: true,
  });
}
