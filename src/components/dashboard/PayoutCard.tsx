import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";

const PayoutCard = () => {
  const payouts = [
    {
      name: "Syafanah san",
      amount: "$2.540.00",
      date: "Today",
      status: "Waiting",
      statusColor: "bg-yellow-500",
      image: "/images/picture1.jpg"
    },
    {
      name: "Devon Lane",
      amount: "$2.540.00",
      date: "Yesterday",
      status: "Done",
      statusColor: "bg-green-500",
      image: "/images/picture2.jpg"
    },
    {
      name: "John Doe",
      amount: "$1.800.00",
      date: "2 days ago",
      status: "Done",
      statusColor: "bg-green-500",
      image: "/images/picture3.jpg"
    },
    {
      name: "Jane Smith",
      amount: "$3.200.00",
      date: "3 days ago",
      status: "Failed",
      statusColor: "bg-red-500",
      image: "/images/picture1.jpg"
    },
    {
      name: "Mike Johnson",
      amount: "$2.100.00",
      date: "4 days ago",
      status: "Done",
      statusColor: "bg-green-500",
      image: "/images/picture2.jpg"
    }
  ];

  return (
    <div className="bg-indigo-50 rounded-xl p-4 sm:p-6 shadow-sm lg:max-w-sm w-full h-[290px]">
      <div className="mb-3 sm:mb-4">
        <p className="text-xs sm:text-sm text-gray-500">Payout monthly</p>
        <h3 className="font-bold text-gray-900 text-sm sm:text-base">Salaries and incentive</h3>
      </div>
      
      <ScrollArea className="h-[200px]">
        <div className="space-y-3 sm:space-y-4">
          {payouts.map((payout, index) => (
            <div key={index} className="flex items-center justify-between hover:bg-gray-300 rounded-full p-2">
              <div className="flex items-center gap-2 sm:gap-3">
                <Avatar className="w-6 h-6 sm:w-8 sm:h-8">
                  <AvatarImage src={payout.image} />
                  <AvatarFallback className="text-xs">
                    {payout.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-900">{payout.name}</p>
                  <p className="text-xs text-gray-500">{payout.date}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs sm:text-sm font-medium text-gray-900">{payout.amount}</p>
                <div className="flex items-center gap-1">
                  <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${payout.statusColor}`}></div>
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