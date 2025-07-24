"use client"

import React from "react";
import { ArrowRight } from "lucide-react";
import { Label, PolarRadiusAxis, RadialBar, RadialBarChart } from "recharts";
import { Button } from "../ui/button";

const TotalEmployeeCard = () => {
  // Data for the chart - Designer (48), Developer (27), Project Manager (18)
  const chartData = [
    {
      name: "Team",
      designer: 48,
      developer: 27,
      projectManager: 18,
    },
  ];
  
  const totalMembers = chartData[0].designer + chartData[0].developer + chartData[0].projectManager;

  return (
    <div className="bg-indigo-50 rounded-xl p-4 sm:p-6 shadow-sm">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <h3 className="font-semibold text-gray-900 text-sm sm:text-base">Total employee</h3>
        <Button className="bg-white hover:bg-white/80 p-1 sm:p-2 rounded-xl">
          <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
        </Button>
      </div>

      <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base">Track your team</p>

      {/* Semi-circular Donut Chart */}
      <div className="flex justify-center mb-3 sm:mb-4">
        <div className="w-40 h-32 sm:w-52 sm:h-40">
          <RadialBarChart
            data={chartData}
            startAngle={180}
            endAngle={0}
            innerRadius={40}
            outerRadius={56}
            width={160}
            height={128}
            className="sm:w-52 sm:h-40"
          >
            <PolarRadiusAxis tick={false} axisLine={false}>
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox && viewBox.cy !== undefined) {
                    const { cx, cy } = viewBox;
                    return (
                      <text x={cx} y={cy} textAnchor="middle">
                        <tspan x={cx} y={cy - 8} className="fill-gray-900 text-2xl sm:text-3xl font-bold">
                          {totalMembers}
                        </tspan>
                        <tspan x={cx} y={cy + 10} className="fill-gray-500 text-xs sm:text-sm">
                          Total members
                        </tspan>
                      </text>
                    );
                  }
                  return null;
                }}
              />
            </PolarRadiusAxis>

            <RadialBar dataKey="designer" stackId="a" cornerRadius={8} fill="#10b981" />
            <RadialBar dataKey="developer" stackId="a" cornerRadius={8} fill="#1e3a8a" />
            <RadialBar dataKey="projectManager" stackId="a" cornerRadius={8} fill="#d1d5db" />
          </RadialBarChart>
        </div>
      </div>


      {/* Legend */}
      <div className="space-y-1 sm:space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 sm:gap-2">
            <div className="w-4 h-4 sm:w-6 sm:h-6 bg-[#10b981] rounded-md"></div>
            <span className="text-xs sm:text-sm text-gray-600">Designer</span>
          </div>
          <span className="text-xs sm:text-sm font-medium">48 members</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 sm:gap-2">
            <div className="w-4 h-4 sm:w-6 sm:h-6 bg-cyan-700 rounded-md"></div>
            <span className="text-xs sm:text-sm text-gray-600">Developer</span>
          </div>
          <span className="text-xs sm:text-sm font-medium">27 members</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 sm:gap-2">
            <div className="w-4 h-4 sm:w-6 sm:h-6 bg-gray-400 rounded-md"></div>
            <span className="text-xs sm:text-sm text-gray-600">Project manager</span>
          </div>
          <span className="text-xs sm:text-sm font-medium">18 members</span>
        </div>
      </div>
    </div>
  );
};

export default TotalEmployeeCard; 