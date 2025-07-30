import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";

interface PayoutCardProps {
  userProfile?: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    profilePictureUrl: string | null;
  } | null;
}

const PayoutCard = ({ userProfile }: PayoutCardProps) => {
  // Hardcoded salary data for the logged-in employee
  const employeeSalary = 100000; // Base monthly salary
  const bonus = 800; // Monthly bonus
  const overtime = 300; // Overtime pay
  
  const monthlyPayouts = [
    {
      month: "December 2024",
      baseSalary: employeeSalary,
      bonus: bonus,
      overtime: overtime,
      total: employeeSalary + 100000 + overtime,
      status: "Paid",
      statusColor: "bg-green-500"
    },
    {
      month: "November 2024",
      baseSalary: employeeSalary,
      bonus: 600,
      overtime: 250,
      total: employeeSalary + 60000 + 250,
      status: "Paid",
      statusColor: "bg-green-500"
    },
    {
      month: "October 2024",
      baseSalary: employeeSalary,
      bonus: 1000,
      overtime: 400,
      total: employeeSalary + 10000 + 400,
      status: "Paid",
      statusColor: "bg-green-500"
    },
    {
      month: "September 2024",
      baseSalary: employeeSalary,
      bonus: 500,
      overtime: 150,
      total: employeeSalary + 50000 + 150,
      status: "Paid",
      statusColor: "bg-green-500"
    },
    {
      month: "August 2024",
      baseSalary: employeeSalary,
      bonus: 700,
      overtime: 200,
      total: employeeSalary + 70000 + 200,
      status: "Paid",
      statusColor: "bg-green-500"
    }
  ];

  return (
    <div className="bg-indigo-50 rounded-xl p-4 sm:p-6 shadow-sm w-full h-[290px]">
      <div className="mb-3 sm:mb-4">
        <p className="text-xs sm:text-sm text-gray-500">Monthly salary</p>
        <h3 className="font-bold text-gray-900 text-sm sm:text-base">
          {userProfile?.firstName && userProfile?.lastName 
            ? `${userProfile.firstName} ${userProfile.lastName}` 
            : 'Employee'} salary
        </h3>
      </div>
      
      <ScrollArea className="h-[200px]">
        <div className="space-y-4">
          {monthlyPayouts.map((payout, index) => (
            <div key={index} className="flex items-center justify-between hover:bg-gray-300 rounded-full p-3">
              <div className="flex items-center gap-3">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={userProfile?.profilePictureUrl || undefined} />
                  <AvatarFallback className="text-xs">
                    {userProfile?.firstName && userProfile?.lastName 
                      ? `${userProfile.firstName[0]}${userProfile.lastName[0]}`
                      : 'EM'}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900 truncate">{payout.month}</p>
                  <p className="text-xs text-gray-500">Base: ${payout.baseSalary.toLocaleString()}</p>
                </div>
              </div>
              <div className="text-right ml-2">
                <p className="text-sm font-medium text-gray-900">Rs: {payout.total.toLocaleString()}</p>
                <div className="flex items-center gap-1">
                  <div className={`w-2 h-2 rounded-full ${payout.statusColor}`}></div>
                  <span className="text-xs text-gray-500">{payout.status}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default PayoutCard; 