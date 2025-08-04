import React from "react";
import { FileText, CreditCard } from "lucide-react";

const PaymentSummaryCard = () => {
  return (
    <div className="bg-cyan-700 text-white rounded-xl lg:max-w-sm w-full p-4 sm:p-6 shadow-sm">
      {/* Payment Breakdown */}
      <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
        <div className="bg-[#10b981] rounded-full px-2 sm:px-3 py-4 sm:py-4 flex items-center justify-between">
          <span className="text-xs sm:text-sm text-white">Basic salary</span>
          <span className="text-xs sm:text-sm font-medium text-white">$2.040</span>
        </div>
        <div className="bg-[#1e3a8a] rounded-full px-2 sm:px-3 py-4 sm:py-4 flex items-center justify-between">
          <span className="text-xs sm:text-sm text-white">Perform</span>
          <span className="text-xs sm:text-sm font-medium text-white">$300</span>
        </div>
        <div className="bg-[#9fa0a1] rounded-full px-2 sm:px-3 py-4 sm:py-4 flex items-center justify-between">
          <span className="text-xs sm:text-sm text-white">Gift</span>
          <span className="text-xs sm:text-sm font-medium text-white">$200</span>
        </div>
      </div>
      
      {/* Payment Status */}
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <div className="flex items-center gap-1 sm:gap-2">
          <div className="w-6 h-6 sm:w-8 sm:h-8 bg-white rounded-full flex items-center justify-center">
            <FileText className="w-3 h-3 sm:w-4 sm:h-4 text-blue-900" />
          </div>
          <div className="relative">
            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-100 rounded-full flex items-center justify-center">
              <CreditCard className="w-3 h-3 sm:w-4 sm:h-4 text-blue-900" />
            </div>
            <div className="absolute -top-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 bg-blue-900 text-white text-xs rounded-full flex items-center justify-center border-2 border-white">
              2
            </div>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs sm:text-sm">Payment</p>
          <p className="text-base sm:text-lg font-bold">100%</p>
        </div>
      </div>
      
      {/* Take Home Pay */}
      <div className="border-t border-white pt-3 sm:pt-4">
        <p className="text-xs sm:text-sm mb-1">Take home pay</p>
        <p className="text-2xl sm:text-3xl font-bold">$2.540.00</p>
      </div>
    </div>
  );
};

export default PaymentSummaryCard; 