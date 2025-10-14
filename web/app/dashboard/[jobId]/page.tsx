import { MRRChart } from "@/components/charts/mrr-chart"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { createServerClient } from "@/lib/api"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

type StripeMetrics = {
    metrics: {
        currency: string;
        totals: {
            grossSalesTotal: number;
            ytd: number;
            mtd: number;
            last30d: number;
            today: number;
        };
        dailyRevenue: Record<string, number>;
        mrr: {
            total: number;
            arr: number;
            asOf: string;
            breakdown: Array<{ month: string; mrr: number }>;
        };
        rawCounts: {
            charges: number;
            refunds: number;
            invoices: number;
            subscriptions: number;
        };
    };
    finishedAt: string;
};

type PageProps = {
    params: { jobId: string };
};

function processStripeData(rawData: StripeMetrics) {
    // Extract metrics data from the response
    const metrics = rawData?.metrics || {};
    const dailyRevenue = metrics?.dailyRevenue || {};
    const totals = metrics?.totals || {};
    const mrr = metrics?.mrr || {};

    // Group daily revenue by month
    const monthlyData = new Map();

    Object.entries(dailyRevenue).forEach(([date, revenue]) => {
        const dateObj = new Date(date);
        const monthKey = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}`;

        if (!monthlyData.has(monthKey)) {
            monthlyData.set(monthKey, {
                month: monthKey,
                mrr: 0,
                revenue: 0,
                daysWithRevenue: 0
            });
        }

        const monthData = monthlyData.get(monthKey);
        monthData.revenue += Number(revenue) / 100; // Convert from cents to dollars
        monthData.daysWithRevenue += 1;
    });

    // Convert map to sorted array and calculate monthly averages
    let chartData = Array.from(monthlyData.values())
        .sort((a, b) => a.month.localeCompare(b.month))
        .map(month => ({
            ...month,
            // For display purposes, use total revenue as MRR approximation
            mrr: month.revenue
        }))
        .slice(-12); // Last 12 months

    // If we have MRR breakdown data, use it instead
    if (mrr.breakdown && mrr.breakdown.length > 0) {
        const mrrByMonth = new Map();
        mrr.breakdown.forEach((item: { month: string; mrr: number }) => {
            const monthKey = item.month;
            mrrByMonth.set(monthKey, item.mrr / 100);
        });

        chartData = chartData.map(month => ({
            ...month,
            mrr: mrrByMonth.get(month.month) || month.revenue
        }));
    }

    const currentMonthRevenue = totals.mtd / 100;
    const last30dRevenue = totals.last30d / 100;
    const totalRevenue = totals.grossSalesTotal / 100;
    const ytdRevenue = totals.ytd / 100;

    return {
        chartData,
        totalRevenue,
        currentMonthRevenue,
        last30dRevenue,
        ytdRevenue,
        totalCharges: metrics.rawCounts?.charges || 0,
        currency: metrics.currency || 'usd',
        growthRate: calculateGrowthRate(chartData)
    };
}


function calculateGrowthRate(chartData: Array<{ mrr: number }>): number {
    if (chartData.length < 2) return 0;

    const currentMRR = chartData[chartData.length - 1]?.mrr || 0;
    const previousMRR = chartData[chartData.length - 2]?.mrr || 0;

    if (previousMRR === 0) return 0;
    return Number((((currentMRR - previousMRR) / previousMRR) * 100).toFixed(1));
}

export default async function JobDetailPage({ params }: PageProps) {
    const { jobId } = await params;
    const cookieStore = await cookies();

    // Create server-side client with cookies
    const serverClient = createServerClient(cookieStore);

    // Fetch job data on the server
    const response = await serverClient.api.stripe.data({ jobId }).get();

    if (response.error || !response.data) {
        console.error('Error fetching data:', response.error);
        redirect('/dashboard');
    }

    // Type guard to ensure we have the correct data structure
    if ('status' in response.data) {
        console.error('Error status:', response.data);
        redirect('/dashboard');
    }

    const rawData = response.data.data as StripeMetrics;

    if (!rawData) {
        return (
            <div className="flex flex-col w-full p-6 space-y-6">
                <div className="text-center">
                    <h2 className="text-2xl font-bold">No data available</h2>
                    <p className="text-muted-foreground mt-2">
                        Job {jobId} has no data yet. Please check back later.
                    </p>
                </div>
            </div>
        );
    }

    const {
        chartData,
        totalRevenue,
        currentMonthRevenue,
        last30dRevenue,
        ytdRevenue,
        totalCharges,
        currency,
        growthRate
    } = processStripeData(rawData);

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency.toUpperCase(),
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(value);
    };

    return (
        <div className="flex flex-col w-full p-6 space-y-4">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Revenue Analytics</h1>
            </div>

            {/* Key Metrics Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between ">
                        <CardTitle className="text-sm font-medium">
                            Total Revenue
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {formatCurrency(totalRevenue)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            All-time gross sales
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between ">
                        <CardTitle className="text-sm font-medium">
                            YTD Revenue
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {formatCurrency(ytdRevenue)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Year to date
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between ">
                        <CardTitle className="text-sm font-medium">
                            MTD Revenue
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {formatCurrency(currentMonthRevenue)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Month to date
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between ">
                        <CardTitle className="text-sm font-medium">
                            Last 30 Days
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {formatCurrency(last30dRevenue)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {growthRate > 0 ? '+' : ''}{growthRate}% vs prev month
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="flex flex-row justify-start items-start gap-2">

                <div className="max-w-[50%] w-full">
                    {/* Main Chart */}
                    {chartData.length > 0 ? (
                        <MRRChart
                            data={chartData}
                            title="Monthly Revenue"
                            description="Revenue trends over the past 12 months"
                        />
                    ) : (
                        <Card>
                            <CardContent className="h-[400px] flex items-center justify-center text-muted-foreground">
                                No subscription data available to display
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Additional Charts Grid */}
                <div className="flex flex-col gap-2 w-full">
                    <Card>
                        <CardHeader>
                            <CardTitle>Revenue Summary</CardTitle>
                            <CardDescription>
                                Current period performance
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <div className="flex justify-between">
                                <span className="text-sm font-medium">Today</span>
                                <span className="text-sm">
                                    {formatCurrency(rawData.metrics?.totals?.today / 100 || 0)}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm font-medium">This Month</span>
                                <span className="text-sm text-green-600">
                                    {formatCurrency(currentMonthRevenue)}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm font-medium">Last 30 Days</span>
                                <span className="text-sm">
                                    {formatCurrency(last30dRevenue)}
                                </span>
                            </div>
                            <div className="flex justify-between pt-2 border-t">
                                <span className="text-sm font-bold">YTD Total</span>
                                <span className="text-sm font-bold">
                                    {formatCurrency(ytdRevenue)}
                                </span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Transaction Stats</CardTitle>
                            <CardDescription>
                                Processing metrics
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <div className="flex justify-between">
                                <span className="text-sm">Total Charges</span>
                                <span className="text-sm font-medium">
                                    {totalCharges} transactions
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm">Average Transaction</span>
                                <span className="text-sm font-medium">
                                    {formatCurrency(totalRevenue / (totalCharges || 1))}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm">Currency</span>
                                <span className="text-sm font-medium">
                                    {currency.toUpperCase()}
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}