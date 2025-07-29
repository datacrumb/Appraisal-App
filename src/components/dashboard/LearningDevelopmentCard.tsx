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
      color: 'bg-green-500'
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
      color: 'bg-yellow-500'
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
    <Card className="w-full h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-lg font-bold text-gray-900">
            Learning & Development
          </CardTitle>
          <p className="text-sm text-gray-600 mt-1">
            View your completed trainings, certifications, and skill progress in one place.
          </p>
        </div>
        <div className="text-xl font-extrabold text-gray-900">
          Legends
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
        </div>
      </CardContent>
    </Card>
  );
};

export default LearningDevelopmentCard; 