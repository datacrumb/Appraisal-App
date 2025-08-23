"use client"

import React, { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { Label, PieChart, Pie, Cell, Tooltip } from "recharts";
import { Button } from "../ui/button";
import Link from "next/link";

interface Employee {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  department: string | null;
  role: string | null;
  isManager: boolean;
  isLead: boolean;
  profilePictureUrl: string | null;
  createdAt: string;
}

interface EmployeeStats {
  [key: string]: number;
}

const TotalEmployeeCard = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Color mapping for different categories - matching the image colors
  const getCategoryColor = (index: number) => {
    const colors = ['#10b981', '#00838F', '#d1d5db']; // Light green, teal/dark blue, light gray
    return colors[index % colors.length];
  };

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/employees/hierarchy');
        
        if (!response.ok) {
          throw new Error('Failed to fetch employee data');
        }
        
        const data = await response.json();
        setEmployees(data.employees || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, []);

  // Calculate employee statistics by department/role
  const calculateEmployeeStats = (): { chartData: any[], totalMembers: number, stats: EmployeeStats } => {
    const stats: EmployeeStats = {};
    
    employees.forEach(employee => {
      let category = 'Other';
      
      // Categorize by department first, then by role
      if (employee.department) {
        category = employee.department;
      } else if (employee.role) {
        category = employee.role;
      } else if (employee.isManager) {
        category = 'Management';
      } else if (employee.isLead) {
        category = 'Team Lead';
      }
      
      stats[category] = (stats[category] || 0) + 1;
    });

    // Get top 3 categories by count
    const sortedCategories = Object.entries(stats)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3);

    // Create chart data - each department as a separate slice
    const chartData = sortedCategories.map(([category, count], index) => ({
      name: category,
      value: count,
      color: getCategoryColor(index)
    }));

    const totalMembers = employees.length;

    return { chartData, totalMembers, stats };
  };

  const { chartData, totalMembers, stats } = calculateEmployeeStats();

  // Get top 3 categories for legend
  const topCategories = Object.entries(stats)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3);

  // Custom tooltip content for chart segments
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="text-sm font-medium text-gray-900">
            {data.payload.name}: {data.value} employees
          </p>
        </div>
      );
    }
    return null;
  };

  // Loading state
  if (loading) {
    return (
      <div className="bg-indigo-50 rounded-xl p-4 sm:p-6 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-gray-900 text-sm sm:text-base">Total employee</h3>
          <Link href="/management">
            <Button className="bg-white hover:bg-white/80 p-1 sm:p-2 rounded-xl">
              <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
            </Button>
          </Link>
        </div>

        <p className="text-gray-600 mb-3 text-sm sm:text-base">Track your team</p>

        {/* Loading skeleton for chart */}
        <div className="flex justify-center mb-2">
          <div className="w-40 h-32 sm:w-52 sm:h-40 bg-gray-200 rounded-lg animate-pulse"></div>
        </div>

        {/* Loading skeleton for legend */}
        <div className="space-y-1">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 sm:w-6 sm:h-6 bg-gray-300 rounded-md"></div>
                <div className="h-3 bg-gray-300 rounded w-16"></div>
              </div>
              <div className="h-3 bg-gray-300 rounded w-12"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-indigo-50 rounded-xl p-4 sm:p-6 shadow-sm h-fit">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-gray-900 text-sm sm:text-base">Total employee</h3>
          <Button className="bg-white hover:bg-white/80 p-1 sm:p-2 rounded-xl">
            <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
          </Button>
        </div>

        <p className="text-gray-600 mb-3 text-sm sm:text-base">Track your team</p>

        <div className="text-center text-gray-500 text-sm">
          Unable to load employee data
        </div>
      </div>
    );
  }

  return (
    <div className="bg-indigo-50 rounded-xl p-4 sm:p-6 shadow-sm h-fit">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-gray-900 text-sm sm:text-base">Total employee</h3>
        <Link href="/management">
          <Button className="bg-white hover:bg-white/80 p-1 sm:p-2 rounded-xl">
            <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
          </Button>
        </Link>
      </div>

      <p className="text-gray-600 mb-3 text-sm sm:text-base">Track your team</p>

      {/* Semi-circular Pie Chart - Single chart split into sections */}
      <div className="flex justify-center">
        <div className="w-64 h-auto">
          <PieChart
            width={256}
            height={120}
            className="sm:w-80 sm:h-56"
          >
            <Pie
              data={chartData}
              cx={128}
              cy={96}
              startAngle={180}
              endAngle={0}
              innerRadius={60}
              outerRadius={90}
              paddingAngle={2}
              dataKey="value"
              cornerRadius={8}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </div>
      </div>

      {/* Total employees count directly below chart */}
      <div className="text-center mb-3">
        <div className="text-2xl sm:text-3xl font-bold text-gray-900">{totalMembers}</div>
        <div className="text-sm text-gray-500">Total members</div>
      </div>

      {/* Legend - Each department with its color */}
      <div className="space-y-1">
        {topCategories.map(([category, count], index) => (
          <div key={category} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div 
                className="w-4 h-4 sm:w-6 sm:h-6 rounded-md"
                style={{ backgroundColor: getCategoryColor(index) }}
              ></div>
              <span className="text-sm text-gray-600 capitalize">
                {category.toLowerCase()}
              </span>
            </div>
            <span className="text-sm font-medium">{count} members</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TotalEmployeeCard;