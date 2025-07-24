'use client'

import React, { useEffect, useState } from "react";
import { Phone, Mail, Star } from "lucide-react";
import { Button } from "@/components/ui/button";

interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  department: string;
  role: string;
  isManager: boolean;
  isLead: boolean;
  profilePictureUrl: string | null;
  yearsOfExperience: number;
  createdAt: string;
  status?: string;
}

const UserProfileCard = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/user/profile');
        
        if (!response.ok) {
          throw new Error('Failed to fetch profile');
        }
        
        const data = await response.json();
        setProfile(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className="relative rounded-4xl overflow-hidden h-64 sm:h-80 lg:h-88 bg-gray-200 animate-pulse">
        <div className="absolute bottom-0 left-0 right-0 bg-white/50 backdrop-blur-sm m-1 p-3 sm:p-4 rounded-t-xl rounded-b-4xl">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="h-4 bg-gray-300 rounded w-24"></div>
              <div className="h-3 bg-gray-300 rounded w-32"></div>
            </div>
            <div className="flex gap-1 sm:gap-2">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-300 rounded-full"></div>
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-300 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !profile) {
    return (
      <div className="relative rounded-4xl overflow-hidden h-64 sm:h-80 lg:h-88 bg-gray-100">
        <div className="absolute bottom-0 left-0 right-0 bg-white/50 backdrop-blur-sm m-1 p-3 sm:p-4 rounded-t-xl rounded-b-4xl">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base sm:text-lg text-gray-900">User Profile</h3>
              <p className="text-sm sm:text-base text-gray-600">Unable to load profile</p>
            </div>
            <div className="flex gap-1 sm:gap-2">
              <Button 
                size="sm" 
                className="rounded-full w-8 h-8 sm:w-10 sm:h-10 p-0 bg-black hover:bg-gray-800 transition-colors"
              >
                <Phone className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
              </Button>
              <Button 
                size="sm" 
                className="rounded-full w-8 h-8 sm:w-10 sm:h-10 p-0 bg-black hover:bg-gray-800 transition-colors"
              >
                <Mail className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Get display name
  const displayName = profile.firstName && profile.lastName 
    ? `${profile.firstName} ${profile.lastName}` 
    : profile.firstName || profile.lastName || 'User';

  // Get role title
  const getRoleTitle = () => {
    if (profile.isManager) return 'Manager';
    if (profile.isLead) return 'Team Lead';
    return profile.role || 'Employee';
  };

  // Get background image
  const backgroundImage = profile.profilePictureUrl 
    ? `url(${profile.profilePictureUrl})` 
    : 'url(/images/picture1.jpg)';

  return (
    <div 
      className="relative rounded-4xl overflow-hidden h-64 sm:h-80 lg:h-88 bg-cover bg-center"
      style={{ backgroundImage }}
    >
      {/* Experience Badge */}
      <div className="absolute top-3 sm:top-4 left-3 sm:left-4 bg-black text-white px-2 sm:px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 z-10">
        <Star className="w-3 h-3" />
        <span className="hidden sm:inline">{profile.yearsOfExperience}+ years experience</span>
        <span className="sm:hidden">{profile.yearsOfExperience}+ yrs</span>
      </div>
      
      {/* Frosted Glass Overlay */}
      <div className="absolute bottom-0 left-0 right-0 bg-white/50 backdrop-blur-sm m-1 p-3 sm:p-4 rounded-t-xl rounded-b-4xl">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-base sm:text-lg text-gray-900">{displayName}</h3>
            <p className="text-sm sm:text-base text-gray-600">{getRoleTitle()}</p>
            {profile.department && (
              <p className="text-xs sm:text-sm text-gray-500 mt-1">{profile.department}</p>
            )}
          </div>
          
          {/* Contact Buttons */}
          <div className="flex gap-1 sm:gap-2">
            <Button 
              size="sm" 
              className="rounded-full w-8 h-8 sm:w-10 sm:h-10 p-0 bg-black hover:bg-gray-800 transition-colors"
              onClick={() => window.open(`tel:${profile.email}`, '_blank')}
            >
              <Phone className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
            </Button>
            <Button 
              size="sm" 
              className="rounded-full w-8 h-8 sm:w-10 sm:h-10 p-0 bg-black hover:bg-gray-800 transition-colors"
              onClick={() => window.open(`mailto:${profile.email}`, '_blank')}
            >
              <Mail className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfileCard; 