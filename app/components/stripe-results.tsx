"use client";

import Link from "next/link";
import { Card } from "./ui/card";
import { useStripeData } from "@/lib/hook/useStripeData";

export default function StripeResults() {
  const { data } = useStripeData();

  const formatCurrency = (amount: number, currency: string) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: (currency || "USD").toUpperCase(),
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format((amount ?? 0) / 100);

  const formatDate = (iso?: string) => {
    if (!iso) return "—";
    const date = new Date(iso);
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const month = months[date.getUTCMonth()];
    const day = date.getUTCDate();
    const year = date.getUTCFullYear();
    const hours = date.getUTCHours().toString().padStart(2, "0");
    const minutes = date.getUTCMinutes().toString().padStart(2, "0");
    return `${month} ${day}, ${year} at ${hours}:${minutes}`;
  };

  if (!data || data.result.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No results yet. Submit a Stripe API key to see metrics.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Recent Scrapes</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {data.result.map((result) => (
          <Link key={result.id} href={`/dashboard/${result.jobId}`}>
            <Card className="p-4 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs text-gray-500">
                      {formatDate(result.data?.finishedAt)}
                    </p>
                    <p className="text-2xl font-bold">
                      {formatCurrency(
                        result.data?.metrics?.totals?.grossSalesTotal ?? 0,
                        result.data?.metrics?.currency ?? "USD"
                      )}
                    </p>
                    <p className="text-sm text-gray-600">Total Revenue</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-gray-500">MRR</p>
                    <p className="font-medium">
                      {formatCurrency(
                        result.data?.metrics?.mrr?.total ?? 0,
                        result.data?.metrics?.currency ?? "USD"
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">ARR</p>
                    <p className="font-medium">
                      {formatCurrency(
                        result.data?.metrics?.mrr?.arr ?? 0,
                        result.data?.metrics?.currency ?? "USD"
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Last 30d</p>
                    <p className="font-medium">
                      {formatCurrency(
                        result.data?.metrics?.totals?.last30d ?? 0,
                        result.data?.metrics?.currency ?? "USD"
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">MTD</p>
                    <p className="font-medium">
                      {formatCurrency(
                        result.data?.metrics?.totals?.mtd ?? 0,
                        result.data?.metrics?.currency ?? "USD"
                      )}
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t">
                  <p className="text-xs text-blue-600 hover:text-blue-800">
                    View Details →
                  </p>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
