"use client"

import { TrendingUp, TrendingDown } from "lucide-react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

interface ChartDataPoint {
  month: string;
  mrr: number;
  revenue?: number;
  daysWithRevenue?: number;
}

interface MRRChartProps {
  data: ChartDataPoint[]
  title?: string
  description?: string
}

const chartConfig = {
  mrr: {
    label: "MRR",
    color: "hsl(var(--chart-1))",
  },
  newMRR: {
    label: "New MRR",
    color: "hsl(var(--chart-2))",
  },
  churnedMRR: {
    label: "Churned MRR",
    color: "hsl(var(--chart-3))",
  },
} satisfies ChartConfig

export function MRRChart({ data, title = "Monthly Recurring Revenue", description }: MRRChartProps) {
  // Calculate trend
  const lastMonth = data[data.length - 1]?.mrr || 0
  const previousMonth = data[data.length - 2]?.mrr || 0
  const percentChange = previousMonth ? ((lastMonth - previousMonth) / previousMonth * 100).toFixed(1) : 0
  const isTrendingUp = lastMonth > previousMonth

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  // Get date range for description
  const startDate = data[0]?.month
  const endDate = data[data.length - 1]?.month
  const dateRange = startDate && endDate ? `${startDate} - ${endDate}` : "Last 12 months"

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description || dateRange}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart
            data={data}
            margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
          >
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="month"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => {
                const date = new Date(value)
                return date.toLocaleDateString('en-US', { month: 'short' })
              }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
            />
            <ChartTooltip
              cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }}
              content={
                <ChartTooltipContent
                  formatter={(value) => formatCurrency(Number(value))}
                />
              }
            />
            <Bar
              dataKey="mrr"
              fill="var(--color-mrr)"
              radius={[8, 8, 0, 0]}
              animationDuration={1000}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 items-center font-medium">
          {isTrendingUp ? (
            <>
              <span className="text-green-600">Trending up by {percentChange}% this month</span>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </>
          ) : (
            <>
              <span className="text-red-600">Trending down by {Math.abs(Number(percentChange))}% this month</span>
              <TrendingDown className="h-4 w-4 text-red-600" />
            </>
          )}
        </div>
        <div className="text-muted-foreground">
          Current MRR: {formatCurrency(lastMonth)}
        </div>
      </CardFooter>
    </Card>
  )
}