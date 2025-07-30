"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import AppraisalForm from "@/components/Form";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

// 1. Define the assignment type
type Assignment = {
  id: string;
  form: {
    title: string;
    description?: string;
    questions: any; // Can be object or array
  };
  evaluationTarget?: {
    type: "MANAGER" | "EMPLOYEE" | "COLLEAGUE" | "LEAD" | "ADMIN";
    targetId: string;
    targetName: string;
    targetRole: string;
    targetDepartment: string;
  };
  hasResponse?: boolean;
  submittedAt?: string;
};

export default function AssignmentReviewPage() {
  const { assignmentId } = useParams();
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!assignmentId) return;
    setLoading(true);
    fetch(`/api/assignments/${assignmentId}`)
      .then((res) => res.json())
      .then((data) => {
        setAssignment(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [assignmentId]);

  // Skeleton component for assignment loading
  const AssignmentSkeleton = () => (
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

  if (loading) return <AssignmentSkeleton />;
  if (!assignment) return <div>Assignment not found.</div>;

  // Ensure questions is always an array and has proper structure
  const questions = Array.isArray(assignment.form.questions) 
    ? assignment.form.questions.map((q: any, index: number) => ({
        id: q.id || `question-${index}`,
        label: q.label || `Question ${index + 1}`,
        type: q.type || "text",
        options: q.options || [],
        section: q.section || "General"
      }))
    : [];

  return (
    <>
      {questions.length === 0 ? (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <p className="text-lg font-semibold text-gray-900 mb-2">No questions available</p>
            <p className="text-gray-500">
              This form doesn't have any questions configured. Please contact your administrator.
            </p>
          </div>
        </div>
      ) : (
        <AppraisalForm
          questions={questions}
          formTitle={assignment.form.title}
          formDescription={assignment.form.description}
          evaluationTarget={assignment.evaluationTarget}
          onSubmit={async (answers) => {
            try {
              const res = await fetch(`/api/assignments/${assignmentId}/responses`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ answers }),
              });
              if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || "Failed to submit response");
              }
              toast.success("Response submitted successfully!");
              router.push("/assignments");
            } catch (e) {
              if (e instanceof Error) toast.error(e.message || "Something went wrong");
            }
          }}
        />
      )}
    </>
  );
} 