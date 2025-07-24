import React from "react";
import { Info, TrendingUp } from "lucide-react";

const WorkTimeCard = () => {
  return (
    <div className="bg-indigo-50 rounded-xl p-4 sm:p-6 shadow-sm">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <h3 className="font-semibold text-gray-900 text-sm sm:text-base">Average work time</h3>
        <div className="flex items-center gap-1 text-green-600 text-xs sm:text-sm">
          <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />
          +0.5%
        </div>
      </div>
      
      <div className="flex items-baseline gap-2 mb-3 sm:mb-4">
        <span className="text-2xl sm:text-3xl font-bold text-gray-900">46</span>
        <span className="text-base sm:text-lg text-gray-600">hours</span>
        <Info className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
      </div>
      
      {/* Line Graph */}
      <div className="mb-3 sm:mb-4">
        <div className="flex items-end justify-between h-16 sm:h-20 mb-2">
          <div className="text-xs text-gray-500">10H</div>
          <div className="text-xs text-gray-500">8H</div>
          <div className="text-xs text-gray-500">6H</div>
          <div className="text-xs text-gray-500">4H</div>
        </div>
        
        <div className="relative h-12 sm:h-16 bg-gray-100 rounded-lg overflow-hidden">
          {/* Line Graph */}
          <svg className="w-full h-full" viewBox="0 0 200 60">
            <polyline
              points="10,50 40,45 70,35 100,30 130,25 160,20 190,15"
              fill="none"
              stroke="#3b82f6"
              strokeWidth="2"
            />
            {/* Highlighted point */}
            <circle cx="100" cy="30" r="4" fill="#3b82f6" />
            <circle cx="100" cy="30" r="6" fill="#3b82f6" fillOpacity="0.2" />
          </svg>
          
          {/* Tooltip */}
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded">
            8 Hours
          </div>
        </div>
      </div>
      
      <p className="text-xs text-gray-500">Total work hours include extra hours</p>
    </div>
  );
};

export default WorkTimeCard; 