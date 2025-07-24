import React, { useState } from "react";
import { TrendingUp, TrendingDown, Globe } from "lucide-react";
import { LuUserRoundCheck } from "react-icons/lu";
import { BsHourglassSplit } from "react-icons/bs";

const HoursWeeksCard = () => {
  const [activeTab, setActiveTab] = useState<'onsite' | 'remote'>('onsite');
  return (
    <div className="bg-indigo-50 rounded-xl p-3 sm:p-4 shadow-sm h-fit">
      <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
        {/* Left Panel: Average Hours / Weeks */}
        <div className="flex-1">
          <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-cyan-700 rounded-xl flex items-center justify-center">
              <BsHourglassSplit className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div className="flex items-baseline gap-1 sm:gap-2">
              <span className="text-2xl sm:text-3xl font-bold text-gray-900">46,5</span>
              <div className="flex items-center gap-1 text-green-600 text-xs sm:text-sm bg-green-100 px-1 sm:px-2 py-1 rounded-full">
                <TrendingUp className="w-2 h-2 sm:w-3 sm:h-3" />
                +0.5%
              </div>
            </div>
          </div>
          
          <p className="text-gray-600 mb-3 sm:mb-4 text-sm sm:text-base">avg hours / weeks</p>
          
          {/* Dot Chart */}
          <div className="mb-3 sm:mb-4">
            <div className="grid grid-cols-12 gap-1 h-20 sm:h-24">
              {Array.from({ length: 60 }, (_, i) => {
                const column = Math.floor(i / 5);
                const row = i % 5;
                const height = Math.floor(Math.random() * 4) + 1;
                const colors = ['bg-cyan-700', 'bg-cyan-600'];
                const colorIndex = Math.floor(Math.random() * colors.length);
                
                return row < height ? (
                  <div
                    key={i}
                    className={`w-3 h-3 sm:w-4 sm:h-4 rounded-xl ${colors[colorIndex]} ${
                      Math.random() > 0.7 ? 'opacity-0' : ''
                    }`}
                  />
                ) : (
                  <div key={i} className="w-1 h-1 sm:w-2 sm:h-2" />
                );
              })}
            </div>
            
            {/* Legend */}
            <div className="flex items-center gap-2 sm:gap-4 mt-4 sm:mt-6">
              <div className="flex items-center gap-1">
                <span className="text-xs text-gray-600">2H</span>
                <div className="w-4 h-4 sm:w-6 sm:h-6 bg-cyan-600 rounded-md"></div>
                <div className="w-4 h-4 sm:w-6 sm:h-6 bg-cyan-700 rounded-md"></div>
                <div className="w-4 h-4 sm:w-6 sm:h-6 bg-cyan-800 rounded-md"></div>
                <div className="w-4 h-4 sm:w-6 sm:h-6 bg-cyan-900 rounded-md"></div>
                <span className="text-xs text-gray-600">10H</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel: Team Distribution */}
        <div className="w-full lg:w-48 h-48 sm:h-60 bg-cyan-700 p-2 rounded-4xl relative overflow-hidden">
          {/* Animated Background Slider */}
          <div 
            className={`absolute top-2 left-2 right-2 h-24 sm:h-28 bg-white rounded-4xl transition-transform duration-500 ease-in-out ${
              activeTab === 'onsite' ? 'translate-y-0' : 'translate-y-24 sm:translate-y-28'
            }`}
          />
          
          {/* Onsite Team */}
          <div 
            className={`relative rounded-4xl p-3 sm:p-4 h-24 sm:h-28 cursor-pointer transition-all duration-300 ${
              activeTab === 'onsite' 
                ? 'text-gray-900' 
                : 'text-white hover:bg-white/10'
            }`}
            onClick={() => setActiveTab('onsite')}
          >
            <div className="flex items-center justify-between mb-1 sm:mb-2">
              <LuUserRoundCheck className="w-4 h-4 sm:w-5 sm:h-5" />
              <div className={`flex items-center gap-1 text-xs sm:text-sm ${
                activeTab === 'onsite' ? 'text-red-600' : 'text-red-300'
              }`}>
                <TrendingDown className="w-3 h-3 sm:w-4 sm:h-4" />
                +2.6%
              </div>
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
              <span className="text-xl sm:text-2xl font-bold">80%</span>
              <span className="text-xs sm:text-sm">Onsite team</span>
            </div>
          </div>
          
          {/* Remote Team */}
          <div 
            className={`relative rounded-4xl p-3 sm:p-4 h-24 sm:h-28 cursor-pointer transition-all duration-300 ${
              activeTab === 'remote' 
                ? 'text-gray-900' 
                : 'text-white hover:bg-white/10'
            }`}
            onClick={() => setActiveTab('remote')}
          >
            <div className="flex items-center justify-between mb-1 sm:mb-2">
              <Globe className="w-4 h-4 sm:w-5 sm:h-5" />
              <div className={`flex items-center gap-1 text-xs sm:text-sm ${
                activeTab === 'remote' ? 'text-green-600' : 'text-green-300'
              }`}>
                <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />
                +2.6%
              </div>
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
              <span className="text-xl sm:text-2xl font-bold">20%</span>
              <span className="text-xs sm:text-sm">Remote team</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HoursWeeksCard; 