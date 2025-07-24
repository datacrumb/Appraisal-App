"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { CreditCard, DollarSign } from "lucide-react";
import PayoutCard from "./PayoutCard";
import PaymentSummaryCard from "./PaymentSummaryCard";

const PayoutSheet = () => {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button 
          variant="outline" 
          className="fixed bottom-4 sm:bottom-6 right-4 sm:right-6 rounded-full w-12 h-12 sm:w-14 sm:h-14 p-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white hover:bg-gray-50 border-2 border-blue-200 hover:border-blue-300"
        >
          <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:w-[400px] md:w-[500px] p-0">
        <SheetHeader className="px-4 sm:px-6 py-3 sm:py-4 border-b">
          <SheetTitle className="flex items-center gap-2 text-sm sm:text-base">
            <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
            Payment & Payout Details
          </SheetTitle>
        </SheetHeader>
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 overflow-y-auto h-full">
          <PayoutCard />
          <PaymentSummaryCard />
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default PayoutSheet; 