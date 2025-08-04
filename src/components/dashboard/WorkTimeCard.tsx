"use client"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

const WorkTimeCard = () => {
  // Data with days and hours
  const chartData = [
    { day: "Mon", hours: 8 },
    { day: "Tue", hours: 6 },
    { day: "Wed", hours: 7 },
    { day: "Thu", hours: 5 },
    { day: "Fri", hours: 8 },
  ]

  // Calculate average (7 hours as shown in image)
  const averageHours = 7

  const chartConfig = {
    hours: {
      label: "Hours",
      color: "#10b981",
    },
  } satisfies ChartConfig

  return (
    <Card className="bg-slate-100 border-0 shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold text-gray-900">Average work time</CardTitle>
          <div className="text-sm font-bold text-gray-900">{averageHours} Hours</div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <ChartContainer config={chartConfig} className="h-56 w-full">
          <BarChart
            data={chartData}
            margin={{
              left: 0,
              right: 12,
              top: 12,
              bottom: 12,
            }}
          >
            <CartesianGrid vertical={false} horizontal={true} strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="day"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tick={{ fontSize: 10, fill: "#6b7280" }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tick={{ fontSize: 10, fill: "#6b7280" }}
              domain={[0, 10]}
              ticks={[0, 2, 4, 6, 8, 10]}
              width={30}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <Bar
              dataKey="hours"
              fill="#10b981"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

export default WorkTimeCard
