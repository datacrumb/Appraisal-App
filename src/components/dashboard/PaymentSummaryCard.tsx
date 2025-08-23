import React from "react";

const PaymentSummaryCard = () => {
  return (
    <div className="bg-[#00838F] text-white rounded-xl lg:max-w-sm w-full p-4 sm:p-6 shadow-sm">
      {/* Payment Breakdown */}
      <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
        <div className="bg-[#10b981] rounded-full px-2 sm:px-3 py-4 sm:py-4 flex items-center justify-between">
          <span className="text-xs sm:text-sm text-white">Basic salary</span>
          <span className="text-xs sm:text-sm font-medium text-white">PKR 100000</span>
        </div>
        <div className="bg-[#1e3a8a] rounded-full px-2 sm:px-3 py-4 sm:py-4 flex items-center justify-between">
          <span className="text-xs sm:text-sm text-white">Perform</span>
          <span className="text-xs sm:text-sm font-medium text-white">PKR 30000</span>
        </div>
        <div className="bg-[#9fa0a1] rounded-full px-2 sm:px-3 py-4 sm:py-4 flex items-center justify-between">
          <span className="text-xs sm:text-sm text-white">Gift</span>
          <span className="text-xs sm:text-sm font-medium text-white">PKR 2000</span>
        </div>
      </div>
      
      {/* Payment Status */}
      <div className="flex items-center justify-between mb-4 sm:mb-6">
          <p className="text-xs sm:text-sm">Payment</p>
          <p className="text-base sm:text-lg font-bold">100%</p>
      </div>
      
      {/* Take Home Pay */}
      <div className="border-t border-white pt-3 sm:pt-4">
        <p className="text-xs sm:text-sm mb-1">Take home pay</p>
        <p className="text-2xl sm:text-3xl font-bold">PKR 132000</p>
      </div>
    </div>
  );
};

export default PaymentSummaryCard; 