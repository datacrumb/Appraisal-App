"use client";

import React from "react";
import UserProfileCard from "@/components/dashboard/UserProfileCard";
import WorkTimeCard from "@/components/dashboard/WorkTimeCard";
import HoursWeeksCard from "@/components/dashboard/HoursWeeksCard";
import LearningDevelopmentCard from "@/components/dashboard/LearningDevelopmentCard";
import PaymentSummaryCard from "./PaymentSummaryCard";
import PayoutCard from "./PayoutCard";
import { useUser } from "@clerk/nextjs";
import TotalEmployeeCard from "./TotalEmployeeCard";

interface UserProfile {
  id: string;
  email: string;
  phoneNumber: string | null;
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

interface DashboardProps {
  initialUserProfile: UserProfile | null;
}

const Dashboard = ({ initialUserProfile }: DashboardProps) => {
  const { user } = useUser();
  const isAdmin = user?.publicMetadata.role === "admin";

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
                <PayoutCard userProfile={initialUserProfile} />
              </div>
            </div>

            {/* Bottom Row: LearningDevelopmentCard and PaymentSummaryCard */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-6">
              <div className="lg:col-span-8">
                {isAdmin ? <TotalEmployeeCard /> : <LearningDevelopmentCard />}
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
