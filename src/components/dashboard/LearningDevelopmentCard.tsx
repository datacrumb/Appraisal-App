"use client"

import React, { useEffect, useState } from "react";
import { BookOpen, Play, Award, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";

interface Course {
  id: string;
  title: string;
  type: 'COURSE' | 'WEBINAR' | 'CERTIFICATION' | 'WORKSHOP';
  status: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';
  color: string;
  link?: string;
  employeeCourses: EmployeeCourse[];
}

interface EmployeeCourse {
  id: string;
  employeeId: string;
  courseId: string;
  status: 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'OVERDUE';
  assignedAt: string;
  completedAt?: string;
  course: Course;
}

const LearningDevelopmentCard = () => {
  const { user } = useUser();
  const [courses, setCourses] = useState<EmployeeCourse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      if (!user?.id) return;
      
      try {
        const response = await fetch(`/api/courses/assign?employeeId=${user.id}`);
        if (response.ok) {
          const data = await response.json();
          setCourses(data);
        }
      } catch (error) {
        console.error('Failed to fetch courses:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [user?.id]);

  const getStatusIcon = (type: string, status: string) => {
    if (status === 'COMPLETED') {
      return <Award className="w-4 h-4 text-white" />;
    }
    if (status === 'IN_PROGRESS') {
      return <Clock className="w-4 h-4 text-white" />;
    }
    if (type === 'COURSE') {
      return <BookOpen className="w-4 h-4 text-white" />;
    }
    return <Play className="w-4 h-4 text-white" />;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'bg-[#10b981]';
      case 'IN_PROGRESS': return 'bg-blue-500';
      case 'OVERDUE': return 'bg-red-500';
      default: return 'bg-yellow-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ASSIGNED': return 'Pending';
      case 'IN_PROGRESS': return 'In Progress';
      case 'COMPLETED': return 'Completed';
      case 'OVERDUE': return 'Overdue';
      default: return 'Pending';
    }
  };

  if (loading) {
    return (
      <Card className="w-full h-full bg-indigo-50">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle className="text-lg font-bold text-gray-900">
              Learning & Development
            </CardTitle>
            <p className="text-sm text-gray-600 mt-1">
              Loading your courses...
            </p>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-12 bg-gray-200 rounded-full"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full h-full bg-indigo-50">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-lg font-bold text-gray-900">
            Learning & Development
          </CardTitle>
          <p className="text-sm text-gray-600 mt-1">
            {courses.length > 0 
              ? `You have ${courses.length} assigned course${courses.length !== 1 ? 's' : ''}`
              : "No courses assigned yet"
            }
          </p>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {courses.length === 0 ? (
            <div className="text-center py-8">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No courses assigned yet</p>
              <p className="text-sm text-gray-400">Contact your manager to get started</p>
            </div>
          ) : (
            courses.map((assignment) => (
              <div key={assignment.id} className="block">
                <Link 
                  href={assignment.course.link || '#'} 
                  className="cursor-pointer block"
                  target={assignment.course.link ? "_blank" : undefined}
                >
                  <div
                    className={`${getStatusColor(assignment.status)} rounded-full p-4 text-white`}
                  >
                    <div className="flex items-center">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(assignment.course.type, assignment.status)}
                        <div className="flex-1">
                          <span className="font-medium">{assignment.course.title}</span>
                          <div className="text-sm opacity-90">
                            {getStatusText(assignment.status)} • {assignment.course.type}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            ))
          )}
          
          {/* Legend */}
          {courses.length > 0 && (
            <div className="flex items-center gap-2 sm:gap-4 mt-4 sm:mt-6 flex-wrap">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 sm:w-4 sm:h-4 bg-[#10b981] rounded-sm"></div>
                <span className="text-xs text-gray-600">Completed</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 sm:w-4 sm:h-4 bg-blue-500 rounded-sm"></div>
                <span className="text-xs text-gray-600">In Progress</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 sm:w-4 sm:h-4 bg-yellow-500 rounded-sm"></div>
                <span className="text-xs text-gray-600">Pending</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 sm:w-4 sm:h-4 bg-red-500 rounded-sm"></div>
                <span className="text-xs text-gray-600">Overdue</span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default LearningDevelopmentCard; 