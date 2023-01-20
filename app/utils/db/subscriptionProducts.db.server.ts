import { db } from "../db.server";

export async function getAllSubscriptionProducts() {
  return await db.subscriptionProduct.findMany({
    where: {
      active: true,
    },
    include: {
      prices: true,
      features: true,
    },
    orderBy: {
      tier: "asc",
    },
  });
}

export async function getSubscriptionProduct(id: string) {
  return await db.subscriptionProduct.findUnique({
    where: {
      id,
    },
    include: {
      prices: true,
      features: true,
    },
  });
}

export async function getSubscriptionPrice(id: string) {
  return await db.subscriptionPrice.findUnique({
    where: { id },
    include: {
      subscriptionProduct: true,
    },
  });
}

export async function getSubscriptionPriceByStripeId(stripeId: string) {
  return await db.subscriptionPrice.findFirst({
    where: { stripeId },
    include: {
      subscriptionProduct: true,
    },
  });
}

export async function createSubscriptionProduct(data: {
  stripeId: string;
  tier: number;
  title: string;
  description: string;
  badge: string;
  active: boolean;
  contactUs: boolean;
  maxWorkspaces: number;
  maxUsers: number;
  maxLinks: number;
  maxStorage: number;
  monthlyContracts: number;
}) {
  return await db.subscriptionProduct.create({
    data,
  });
}

export async function createSubscriptionPrice(data: {
  subscriptionProductId: string;
  stripeId: string;
  type: number;
  billingPeriod: number;
  price: number;
  currency: string;
  trialDays: number;
  active: boolean;
}) {
  return await db.subscriptionPrice.create({ data });
}

export async function createSubscriptionFeature(data: { subscriptionProductId: string; order: number; key: string; value: string; included: boolean }) {
  return await db.subscriptionFeature.create({ data });
}
