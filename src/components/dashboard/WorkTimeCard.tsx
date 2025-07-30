"use client"
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

const WorkTimeCard = () => {
  // Data matching the image: Item 1-5 with hours 18, 26, 23, 35, 36
  const chartData = [
    { item: "Item 1", hours: 18 },
    { item: "Item 2", hours: 26 },
    { item: "Item 3", hours: 23 },
    { item: "Item 4", hours: 35 },
    { item: "Item 5", hours: 36 },
  ]

  // Calculate average (7 hours as shown in image)
  const averageHours = 7

  const chartConfig = {
    hours: {
      label: "Hours",
      color: "#6b7280",
    },
  } satisfies ChartConfig

  return (
    <Card className="bg-slate-100 border-0 shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold text-gray-900">Average work time</CardTitle>
          <div className="text-2xl font-bold text-gray-900">{averageHours} Hours</div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <ChartContainer config={chartConfig} className="h-56 w-full">
          <LineChart
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
              dataKey="item"
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
              domain={[0, 40]}
              ticks={[0, 10, 20, 30, 40]}
              width={30}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <Line
              dataKey="hours"
              type="linear"
              stroke="#10b981"
              strokeWidth={2}
              dot={{ fill: "#10b981", strokeWidth: 2, r: 3 }}
              activeDot={{ r: 5, stroke: "#10b981", strokeWidth: 2 }}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

export default WorkTimeCard
