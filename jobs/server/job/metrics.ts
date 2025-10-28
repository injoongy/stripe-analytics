// server/job/metrics/stripeMetrics.ts
import Stripe from "stripe";

type Money = number; // amounts in cents

type DailyMap = Record<string, Money>;

type MRRBreakdown = {
  priceId: string;
  nickname?: string | null;
  currency: string;
  interval: "day" | "week" | "month" | "year";
  unitAmount: Money;
  quantityTotal: number;
  mrr: Money;
};

export type StripeMetrics = {
  currency: string;
  totals: {
    grossSalesTotal: Money; // lifetime: charges - refunds
    ytd: Money;
    mtd: Money;
    last30d: Money;
    today: Money;
  };
  dailyRevenue: DailyMap; // YYYY-MM-DD -> cents
  mrr: {
    total: Money;
    arr: Money;
    asOf: string;
    breakdown: MRRBreakdown[];
  };
  rawCounts: {
    charges: number;
    refunds: number;
    invoices: number;
    subscriptions: number;
  };
};

function startOfUTCYear(d = new Date()) {
  return new Date(Date.UTC(d.getUTCFullYear(), 0, 1, 0, 0, 0));
}
function startOfUTCMonth(d = new Date()) {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1, 0, 0, 0));
}
function daysAgoUTC(n: number) {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - n);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}
function toYMD(date: Date): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
function normalizeToMonthly(interval: "day"|"week"|"month"|"year"): number {
  switch (interval) {
    case "day":  return 30;
    case "week": return 52 / 12;
    case "month":return 1;
    case "year": return 1 / 12;
  }
}

/**
 * Fetches sales KPIs (YTD/MTD/daily) and MRR from Stripe.
 * NOTE: For production, don't pass raw keys from the client. Use Stripe Connect
 * or look up the key on the server. This function assumes a valid secret key.
 */
export async function getStripeMetrics(stripeApiKey: string): Promise<StripeMetrics> {
  const stripe = new Stripe(stripeApiKey, { apiVersion: "2025-08-27.basil" });

  const ytdStart = Math.floor(startOfUTCYear().getTime() / 1000);
  const mtdStart = Math.floor(startOfUTCMonth().getTime() / 1000);
  const last30Start = Math.floor(daysAgoUTC(30).getTime() / 1000);
  const todayStart = Math.floor(daysAgoUTC(0).getTime() / 1000);

  let grossTotal = 0;
  let grossYTD = 0;
  let grossMTD = 0;
  let gross30d = 0;
  let grossToday = 0;
  const daily: DailyMap = {};
  let primaryCurrency: string | undefined;

  let chargesCount = 0;
  {
    let starting_after: string | undefined;
    do {
      const page = await stripe.charges.list({
        limit: 100,
        ...(starting_after ? { starting_after } : {}),
      });

      for (const ch of page.data) {
        if (ch.paid !== true || ch.status !== "succeeded") continue;
        if (!primaryCurrency) primaryCurrency = ch.currency;
        chargesCount++;

        const created = new Date(ch.created * 1000);
        const amt = ch.amount ?? 0;

        grossTotal += amt;
        const ts = ch.created;
        if (ts >= ytdStart) grossYTD += amt;
        if (ts >= mtdStart) grossMTD += amt;
        if (ts >= last30Start) gross30d += amt;
        if (ts >= todayStart) grossToday += amt;

        const key = toYMD(created);
        daily[key] = (daily[key] ?? 0) + amt;
      }

      starting_after = page.has_more ? page.data.at(-1)?.id : undefined;
    } while (starting_after);
  }

  let refundsCount = 0;
  {
    let starting_after: string | undefined;
    do {
      const page = await stripe.refunds.list({
        limit: 100,
        ...(starting_after ? { starting_after } : {}),
      });

      for (const rf of page.data) {
        refundsCount++;
        const created = new Date(rf.created * 1000);
        const amt = rf.amount ?? 0;

        grossTotal -= amt;
        const ts = rf.created;
        if (ts >= ytdStart) grossYTD -= amt;
        if (ts >= mtdStart) grossMTD -= amt;
        if (ts >= last30Start) gross30d -= amt;
        if (ts >= todayStart) grossToday -= amt;

        const key = toYMD(created);
        daily[key] = (daily[key] ?? 0) - amt;
      }

      starting_after = page.has_more ? page.data.at(-1)?.id : undefined;
    } while (starting_after);
  }

  let invoicesCount = 0;
  {
    let starting_after: string | undefined;
    do {
      const page = await stripe.invoices.list({
        limit: 100,
        ...(starting_after ? { starting_after } : {}),
      });
      invoicesCount += page.data.length;
      starting_after = page.has_more ? page.data.at(-1)?.id : undefined;
    } while (starting_after);
  }

  // MRR (active/trialing/past_due subs, normalized monthly)
  let mrrTotal = 0;
  const breakdownMap = new Map<string, MRRBreakdown>();
  let subscriptionsCount = 0;

  {
    let starting_after: string | undefined;
    do {
      const page = await stripe.subscriptions.list({
        limit: 100,
        status: "all",
        expand: ["data.items.data.price"],
        ...(starting_after ? { starting_after } : {}),
      });

      for (const sub of page.data) {
        subscriptionsCount++;
        if (!["active", "trialing", "past_due"].includes(sub.status)) continue;

        for (const item of sub.items.data) {
          const price = item.price;
          if (!price?.recurring || price.unit_amount == null) continue;
          if (!primaryCurrency) primaryCurrency = price.currency;

          const qty = item.quantity ?? 1;
          const factor = normalizeToMonthly(price.recurring.interval);
          const unit = price.unit_amount;

          const itemMRR = Math.round(unit * factor * qty);
          mrrTotal += itemMRR;

          const key = price.id;
          const rec = breakdownMap.get(key) ?? {
            priceId: price.id,
            nickname: price.nickname ?? null,
            currency: price.currency,
            interval: price.recurring.interval,
            unitAmount: unit,
            quantityTotal: 0,
            mrr: 0,
          };
          rec.quantityTotal += qty;
          rec.mrr += itemMRR;
          breakdownMap.set(key, rec);
        }
      }

      starting_after = page.has_more ? page.data.at(-1)?.id : undefined;
    } while (starting_after);
  }

  const mrrBreakdown = Array.from(breakdownMap.values()).sort((a, b) => b.mrr - a.mrr);
  const arr = mrrTotal * 12;

  return {
    currency: primaryCurrency ?? "usd",
    totals: {
      grossSalesTotal: grossTotal,
      ytd: grossYTD,
      mtd: grossMTD,
      last30d: gross30d,
      today: grossToday,
    },
    dailyRevenue: daily,
    mrr: {
      total: mrrTotal,
      arr,
      asOf: new Date().toISOString(),
      breakdown: mrrBreakdown,
    },
    rawCounts: {
      charges: chargesCount,
      refunds: refundsCount,
      invoices: invoicesCount,
      subscriptions: subscriptionsCount,
    },
  };
}

export default getStripeMetrics;
