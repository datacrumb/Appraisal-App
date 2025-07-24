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
          className="rounded-lg hover:bg-gray-50 transition-colors w-full sm:w-auto"
        >
          <CreditCard className="w-4 h-4 mr-2" />
          Payment
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