import React from "react";
import { ArrowRight, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const HiringStatisticsCard = () => {
  return (
    <div className="bg-indigo-50 rounded-xl p-4 sm:p-6 shadow-sm h-fit">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <h3 className="font-semibold text-gray-900 text-sm sm:text-base">Hiring statistics</h3>
        <Button className="bg-white hover:bg-white/80 p-1 sm:p-2 rounded-xl">
          <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
        </Button>
      </div>

      <p className="text-gray-600 mb-3 sm:mb-4 text-sm sm:text-base">Talent recruitment</p>

      {/* Profile Images */}
      <div className="flex items-center justify-between mb-3 sm:mb-4 gap-2 sm:gap-3">
        <Avatar className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 rounded-2xl flex-shrink-0">
          <AvatarImage src="/images/picture2.jpg" />
          <AvatarFallback>W</AvatarFallback>
        </Avatar>
        <Avatar className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 rounded-2xl flex-shrink-0">
          <AvatarImage src="/images/picture3.jpg" />
          <AvatarFallback>M</AvatarFallback>
        </Avatar>
        {/* Join Call Button */}
        <Button className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 text-white bg-cyan-700 hover:bg-cyan-800 rounded-2xl flex-shrink-0">
          <Video className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
          <span className="text-xs sm:text-sm">Join call</span>
        </Button>
      </div>

      {/* Talent Numbers */}
      <div className="flex justify-between mb-3 sm:mb-4">
        <span className="text-xs sm:text-sm font-medium">120 Talent</span>
        <span className="text-xs sm:text-sm font-medium">80 Talent</span>
      </div>

      {/* Bar Chart */}
      <div className="mb-3 sm:mb-4">
        <div className="flex gap-1 h-16 sm:h-20">
          {Array.from({ length: 20 }, (_, i) => (
            <div
              key={i}
              className={`flex-1 w-2 rounded-full ${i < 12 ? 'bg-green-500' : 'bg-gray-300'
                }`}
            />
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-2 sm:gap-4">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded-full"></div>
          <span className="text-xs text-gray-600">Matched</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 sm:w-3 sm:h-3 bg-gray-300 rounded-full"></div>
          <span className="text-xs text-gray-600">Not match</span>
        </div>
      </div>
    </div>
  );
};

export default HiringStatisticsCard; 