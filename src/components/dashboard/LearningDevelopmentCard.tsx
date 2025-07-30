"use client"

import React from "react";
import { BookOpen, Play, Award } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Course {
  id: string;
  title: string;
  type: 'course' | 'webinar';
  status: 'completed' | 'in-progress' | 'upcoming';
  color: string;
}

const LearningDevelopmentCard = () => {
  const courses: Course[] = [
    {
      id: '1',
      title: 'Agentic AI for Coding',
      type: 'course',
      status: 'completed',
      color: 'bg-[#10b981]'
    },
    {
      id: '2',
      title: 'Shipping Code in Under a Week',
      type: 'webinar',
      status: 'in-progress',
      color: 'bg-yellow-500'
    },
    {
      id: '3',
      title: 'AIOPS Deployment',
      type: 'webinar',
      status: 'upcoming',
      color: 'bg-yellow-400'
    }
  ];

  const getStatusIcon = (type: string, status: string) => {
    if (status === 'completed') {
      return <Award className="w-4 h-4 text-white" />;
    }
    if (type === 'course') {
      return <BookOpen className="w-4 h-4 text-white" />;
    }
    return <Play className="w-4 h-4 text-white" />;
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'in-progress':
        return 'In Progress';
      case 'upcoming':
        return 'Upcoming';
      default:
        return '';
    }
  };

  return (
    <Card className="w-full h-full bg-indigo-50">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-lg font-bold text-gray-900">
            Learning & Development
          </CardTitle>
          <p className="text-sm text-gray-600 mt-1">
            View your completed trainings, certifications, and skill progress in one place.
          </p>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {courses.map((course) => (
            <div
              key={course.id}
              className={`${course.color} rounded-full p-4 text-white`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(course.type, course.status)}
                  <span className="font-medium">{course.title}</span>
                </div>
                <span className="text-xs opacity-90">
                  {getStatusText(course.status)}
                </span>
              </div>
            </div>
          ))}
          {/* Legend */}
          <div className="flex items-center gap-2 sm:gap-4 mt-4 sm:mt-6">
            <span className="text-xs text-gray-600">Completed</span>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 sm:w-4 sm:h-4 bg-[#10b981] rounded-sm"></div>
            </div>
            <span className="text-xs text-gray-600">In progress</span>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 sm:w-4 sm:h-4 bg-yellow-500 rounded-sm"></div>
            </div>
            <span className="text-xs text-gray-600">Upcoming</span>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 sm:w-4 sm:h-4 bg-yellow-400 rounded-sm"></div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LearningDevelopmentCard; 