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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar } from "@/components/ui/calendar";
import UserProfileCard from "@/components/dashboard/UserProfileCard";
import WorkTimeCard from "@/components/dashboard/WorkTimeCard";
import HoursWeeksCard from "@/components/dashboard/HoursWeeksCard";
import TotalEmployeeCard from "@/components/dashboard/TotalEmployeeCard";
import HiringStatisticsCard from "@/components/dashboard/HiringStatisticsCard";
import PayoutSheet from "@/components/dashboard/PayoutSheet";
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

const Dashboard = () => {
  const [open, setOpen] = React.useState(false)
  const [date, setDate] = React.useState<Date | undefined>(undefined)
  const { user } = useUser();
  const name = user?.firstName + " " + user?.lastName;
  return (
    <div className="min-h-screen bg-gray-50">

      {/* Main Content */}
      <div className="p-4 sm:p-6">
        {/* Breadcrumbs and Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="text-sm text-gray-500">Portal &gt; Dashboard</div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="rounded-lg hover:bg-gray-50 transition-colors w-full sm:w-auto">
                  <Plus className="w-4 h-4 mr-2" />
                  Add widget
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="start">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuGroup>
                  <DropdownMenuItem>
                    Profile
                    <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    Billing
                    <DropdownMenuShortcut>⌘B</DropdownMenuShortcut>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    Settings
                    <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    Keyboard shortcuts
                    <DropdownMenuShortcut>⌘K</DropdownMenuShortcut>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem>Team</DropdownMenuItem>
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger>Invite users</DropdownMenuSubTrigger>
                    <DropdownMenuPortal>
                      <DropdownMenuSubContent>
                        <DropdownMenuItem>Email</DropdownMenuItem>
                        <DropdownMenuItem>Message</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>More...</DropdownMenuItem>
                      </DropdownMenuSubContent>
                    </DropdownMenuPortal>
                  </DropdownMenuSub>
                  <DropdownMenuItem>
                    New Team
                    <DropdownMenuShortcut>⌘+T</DropdownMenuShortcut>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem>GitHub</DropdownMenuItem>
                <DropdownMenuItem>Support</DropdownMenuItem>
                <DropdownMenuItem disabled>API</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  Log out
                  <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="flex flex-col gap-3 w-full sm:w-auto">
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" id="date" className="rounded-lg hover:bg-gray-50 transition-colors w-full sm:w-auto">
                    <CalendarIcon className="w-4 h-4 mr-2" />
                    <span className="hidden sm:inline">Calendar</span>
                    {date ? date.toLocaleDateString() : "Select date"}
                    <ChevronDownIcon />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    captionLayout="dropdown"
                    onSelect={(date) => {
                      setDate(date)
                      setOpen(false)
                    }}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <Button className="bg-green-100 text-green-700 hover:bg-green-200 rounded-lg transition-colors w-full sm:w-auto">
              <FileText className="w-4 h-4 mr-2" />
              Add report
            </Button>
          </div>
        </div>

        {/* Greeting */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Good morning {name}</h1>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
          {/* Left Column: UserProfileCard and WorkTimeCard */}
          <div className="lg:col-span-3 space-y-4 sm:space-y-6">
            <UserProfileCard />
            <WorkTimeCard />
          </div>

          {/* Middle Column: HoursWeeksCard and bottom row */}
          <div className="lg:col-span-9 space-y-4 sm:space-y-6">
            {/* HoursWeeksCard takes full width */}
            <HoursWeeksCard />

            {/* Bottom Row: TotalEmployeeCard and HiringStatisticsCard */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <TotalEmployeeCard />
              <HiringStatisticsCard />
            </div>
          </div>
        </div>

        {/* Payout Sheet Trigger */}
        <PayoutSheet />
      </div>
    </div>
  );
};

export default Dashboard; 