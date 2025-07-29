"use client";

import React from "react";
import {
  Plus,
  Calendar as CalendarIcon,
  FileText,
  Users,
  Bell,
  Search,
  MessageSquare
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import UserProfileCard from "@/components/dashboard/UserProfileCard";
import WorkTimeCard from "@/components/dashboard/WorkTimeCard";
import HoursWeeksCard from "@/components/dashboard/HoursWeeksCard";
import TotalEmployeeCard from "@/components/dashboard/TotalEmployeeCard";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ChevronDownIcon } from "lucide-react"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useUser } from "@clerk/nextjs";
import PaymentSummaryCard from "./PaymentSummaryCard";
import PayoutCard from "./PayoutCard";

interface UserProfile {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  department: string | null;
  role: string | null;
  isManager: boolean;
  isLead: boolean;
  profilePictureUrl: string | null;
  yearsOfExperience: number;
  createdAt: string;
}

interface Employee {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  department: string | null;
  role: string | null;
  isManager: boolean;
  isLead: boolean;
  profilePictureUrl: string | null;
  createdAt: string;
}

interface DashboardProps {
  initialUserProfile: UserProfile | null;
  initialEmployeeData: Employee[];
}

const Dashboard = ({ initialUserProfile, initialEmployeeData }: DashboardProps) => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <div className="p-4 sm:p-6">

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
          {/* Left Column: UserProfileCard and WorkTimeCard */}
          <div className="lg:col-span-3 space-y-4 sm:space-y-6">
            <UserProfileCard initialProfile={initialUserProfile} />
            <WorkTimeCard />
          </div>  

          {/* Middle Column: HoursWeeksCard and bottom row */}
          <div className="lg:col-span-9 space-y-4 sm:space-y-6">
            {/* HoursWeeksCard and PayoutCard side by side */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
              <div className="lg:col-span-8">
                <HoursWeeksCard />
              </div>
              <div className="lg:col-span-4">
                <PayoutCard />
              </div>
            </div>

            {/* Bottom Row: TotalEmployeeCard and HiringStatisticsCard */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-6">
              <div className="lg:col-span-8">
                <TotalEmployeeCard initialEmployees={initialEmployeeData} />
              </div>
              <div className="lg:col-span-4">
                <PaymentSummaryCard />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 