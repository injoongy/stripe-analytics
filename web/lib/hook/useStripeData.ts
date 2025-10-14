import { useQuery } from "@tanstack/react-query";
import { client } from "../api";

type StripeMetrics = {
    finishedAt?: string;
    metrics?: {
        currency?: string;
        totals?: {
            grossSalesTotal?: number;
            last30d?: number;
            mtd?: number;
        };
        mrr?: {
            total?: number;
            arr?: number;
        };
    };
};

type ScrapedData = {
    id: string;
    userId: string;
    jobId: string;
    data: StripeMetrics;
    createdAt: string | Date;
    updatedAt: string | Date;
};

type StripeDataResponse = {
    result: ScrapedData[];
};

async function fetchStripeData(): Promise<StripeDataResponse> {
    const { data, error } = await client.api.stripe.data.get();
    if (error) throw new Error(error.value || "Failed to fetch data");

    const mapped = (data?.data || []).map((item) => ({
        ...item,
        createdAt:
            item.createdAt instanceof Date ? item.createdAt.toISOString() : item.createdAt,
        updatedAt:
            item.updatedAt instanceof Date ? item.updatedAt.toISOString() : item.updatedAt,
    }));

    return { result: mapped as ScrapedData[] };
}

export const useStripeData = () =>
    useQuery<StripeDataResponse>({
        queryKey: ["stripeResults"],
        queryFn: fetchStripeData,
        staleTime: 5 * 60 * 1000, // 5 minutes - data doesn't change often
        refetchInterval: false, // Don't poll - rely on manual invalidation after job completion
        refetchOnWindowFocus: false, // Don't refetch on tab switch
    });
