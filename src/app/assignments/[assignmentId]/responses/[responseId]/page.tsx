"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import AppraisalForm from "@/components/Form";

// Define the response type
type Response = {
  id: string;
  createdAt: string;
  answers: Record<string, string>;
  assignment: {
    employeeEmail: string;
    employeeName?: string;
    employeeProfilePictureUrl?: string;
    evaluationTarget?: {
      type: "MANAGER" | "EMPLOYEE" | "COLLEAGUE" | "LEAD" | "ADMIN";
      targetId: string;
      targetName: string;
      targetRole: string;
      targetDepartment: string;
    };
    form: {
      title: string;
      questions: any[];
    };
  };
};

export default function ResponseViewPage() {
  const { assignmentId, responseId } = useParams();
  const [response, setResponse] = useState<Response | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!responseId) return;
    setLoading(true);
    
    fetch(`/api/assignments/${assignmentId}/responses/${responseId}`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch response');
        return res.json();
      })
      .then((data) => {
        setResponse(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching response:', error);
        toast.error('Failed to load response');
        setLoading(false);
      });
  }, [assignmentId, responseId]);

  // Skeleton component for response loading
  const ResponseSkeleton = () => (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Left side - Background image placeholder */}
        <div className="hidden lg:block lg:w-2/5 bg-gradient-to-br from-blue-50 to-indigo-100 relative">
          <div className="w-full h-full bg-gray-200 animate-pulse"></div>
        </div>

        {/* Right side - Form skeleton */}
        <div className="w-full lg:w-3/5 bg-white">
          <div className="max-w-2xl mx-auto p-8">
            {/* Header skeleton */}
            <div className="mb-8">
              <Skeleton className="h-8 w-3/4 mb-3" />
              <Skeleton className="h-4 w-1/2 mb-4" />
              <Skeleton className="h-4 w-full" />
            </div>

            {/* Section skeleton */}
            <div className="mb-6">
              <Skeleton className="h-6 w-1/3 mb-2" />
            </div>

            {/* Questions skeleton */}
            <div className="space-y-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-4">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-20 w-full" />
                </div>
              ))}
            </div>

            {/* Navigation skeleton */}
            <div className="flex justify-end gap-2 pt-6">
              <Skeleton className="h-10 w-20" />
              <Skeleton className="h-10 w-20" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) return <ResponseSkeleton />;
  if (!response) return <div>Response not found.</div>;

  // Ensure questions is always an array and has proper structure
  const questions = Array.isArray(response.assignment.form.questions) 
    ? response.assignment.form.questions.map((q: any, index: number) => ({
        id: q.id || `question-${index}`,
        label: q.label || `Question ${index + 1}`,
        type: q.type || "text",
        options: q.options || [],
        section: q.section || "General"
      }))
    : [];

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-semibold text-gray-900 mb-2">No questions available</p>
          <p className="text-gray-500">
            This response doesn't have any questions configured.
          </p>
        </div>
      </div>
    );
  }

  return (
    <AppraisalForm
      questions={questions}
      formTitle={response.assignment.form.title}
      formDescription="Submitted Response"
      evaluationTarget={response.assignment.evaluationTarget}
      readOnly={true}
      defaultValues={response.answers}
      submittedAt={response.createdAt}
    />
  );
} 