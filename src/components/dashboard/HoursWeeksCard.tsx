import React, { useState } from "react";
import { TrendingUp, TrendingDown, Globe, ChevronDown } from "lucide-react";
import { LuUserRoundCheck } from "react-icons/lu";
import { BsHourglassSplit } from "react-icons/bs";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const HoursWeeksCard = () => {
  const [activeTab, setActiveTab] = useState<'onsite' | 'remote'>('onsite');

  // Generate attendance data for the entire year (12 months x 30 days each)
  const generateYearlyAttendanceData = () => {
    const yearlyData = [];

    for (let month = 1; month <= 12; month++) {
      const monthData = [];
      for (let day = 1; day <= 30; day++) {
        const random = Math.random();
        let status;
        if (random > 0.7) {
          status = 'present'; // 30% chance
        } else if (random > 0.4) {
          status = 'leave'; // 30% chance (yellow)
        } else {
          status = 'holiday'; // 40% chance (gray)
        }
        monthData.push({ day, status });
      }
      yearlyData.push({ month, data: monthData });
    }

    return yearlyData;
  };

  const yearlyAttendanceData = generateYearlyAttendanceData();

  const getAttendanceColor = (status: string) => {
    switch (status) {
      case 'present':
        return 'bg-[#10b981]';
      case 'leave':
        return 'bg-yellow-200';
      case 'holiday':
      default:
        return 'bg-gray-300';
    }
  };

  return (
    <div className="bg-indigo-50 rounded-xl p-3 sm:p-4 shadow-sm h-fit">
      <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
        {/* Left Panel: Attendance Streak */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-cyan-700 rounded-xl flex items-center justify-center">
                <BsHourglassSplit className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div className="flex items-baseline gap-1 sm:gap-2">
                <span className="text-2xl sm:text-3xl font-bold text-gray-900">Attendance streak</span>
              </div>
            </div>
          </div>

          {/* GitHub-style Attendance Grid */}
          <div className="mb-3 sm:mb-4">
            <ScrollArea className="w-full">
              <TooltipProvider>
                <div className="flex gap-4 pb-4">
                  {yearlyAttendanceData.map((monthData, monthIndex) => (
                    <div key={monthData.month} className="flex-shrink-0">
                      <div className="text-xs text-gray-600 mb-2 text-center">
                        {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][monthData.month - 1]}
                      </div>
                      <div className="grid grid-cols-6 gap-0.5 h-20 sm:h-24">
                        {monthData.data.map((item, index) => (
                          <Tooltip key={index}>
                            <TooltipTrigger asChild>
                              <div
                                className={`w-3 h-3 sm:w-4 sm:h-4 rounded-sm ${getAttendanceColor(item.status)} cursor-pointer`}
                              />
                            </TooltipTrigger>
                            <TooltipContent className="bg-black text-white rounded-xl">
                              <p>{`${['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][monthData.month - 1]} Day ${item.day}: ${item.status === 'present' ? 'Present' : item.status === 'leave' ? 'Leave' : 'Absent'}`}</p>
                            </TooltipContent>
                          </Tooltip>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </TooltipProvider>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>

            {/* Legend */}
            <div className="flex items-center gap-2 sm:gap-4 mt-4 sm:mt-6">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 sm:w-4 sm:h-4 bg-[#10b981] rounded-sm"></div>
              </div>
              <span className="text-xs text-gray-600">Present</span>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 sm:w-4 sm:h-4 bg-yellow-200 rounded-sm"></div>
              </div>
              <span className="text-xs text-gray-600">Leave</span>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 sm:w-4 sm:h-4 bg-gray-300 rounded-sm"></div>
              </div>
              <span className="text-xs text-gray-600">Holiday</span>
            </div>
          </div>
        </div>

        {/* Right Panel: Team Distribution */}
        <div className="w-full lg:w-44 h-48 sm:h-60 bg-cyan-700 p-2 rounded-4xl relative overflow-hidden">
          {/* Animated Background Slider */}
          <div
            className={`absolute top-2 left-2 right-2 h-24 sm:h-28 bg-white rounded-4xl transition-transform duration-500 ease-in-out ${activeTab === 'onsite' ? 'translate-y-0' : 'translate-y-24 sm:translate-y-28'
              }`}
          />

          {/* Onsite Team */}
          <div
            className={`relative rounded-4xl p-3 sm:p-4 h-24 sm:h-28 cursor-pointer transition-all duration-300 ${activeTab === 'onsite'
                ? 'text-gray-900'
                : 'text-white hover:bg-white/10'
              }`}
            onClick={() => setActiveTab('onsite')}
          >
            <div className="flex items-center justify-between mb-1 sm:mb-2">
              <LuUserRoundCheck className="w-4 h-4 sm:w-5 sm:h-5" />
              <div className={`flex items-center gap-1 text-xs sm:text-sm ${activeTab === 'onsite' ? 'text-red-600' : 'text-red-300'
                }`}>
                <TrendingDown className="w-3 h-3 sm:w-4 sm:h-4" />
                +2.6%
              </div>
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
              <span className="text-xl sm:text-2xl font-bold">80%</span>
              <span className="text-xs sm:text-sm">Onsite</span>
            </div>
          </div>

          {/* Remote Team */}
          <div
            className={`relative rounded-4xl p-3 sm:p-4 h-24 sm:h-28 cursor-pointer transition-all duration-300 ${activeTab === 'remote'
                ? 'text-gray-900'
                : 'text-white hover:bg-white/10'
              }`}
            onClick={() => setActiveTab('remote')}
          >
            <div className="flex items-center justify-between mb-1 sm:mb-2">
              <Globe className="w-4 h-4 sm:w-5 sm:h-5" />
              <div className={`flex items-center gap-1 text-xs sm:text-sm ${activeTab === 'remote' ? 'text-green-600' : 'text-green-300'
                }`}>
                <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />
                +2.6%
              </div>
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
              <span className="text-xl sm:text-2xl font-bold">20%</span>
              <span className="text-xs sm:text-sm">Remote</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HoursWeeksCard; 