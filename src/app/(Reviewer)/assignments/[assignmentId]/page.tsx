"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import AppraisalForm from "@/components/reviewer/Form";
import { toast } from "sonner";

// 1. Define the assignment type
type Assignment = {
  id: string;
  form: {
    title: string;
    description?: string;
    questions: any; // Can be object or array
  };
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

  if (loading) return <div>Loading...</div>;
  if (!assignment) return <div>Assignment not found.</div>;

  // Ensure questions is always an array
  const questions = Array.isArray(assignment.form.questions) 
    ? assignment.form.questions 
    : [];

  return (
    <div className="max-w-2xl mx-auto py-10">
      <h2 className="text-2xl font-bold mb-6">{assignment.form.title}</h2>
      <p className="mb-6 text-muted-foreground">{assignment.form.description}</p>
      
      {questions.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-lg font-semibold text-gray-900 mb-2">No questions available</p>
          <p className="text-gray-500">
            This form doesn't have any questions configured. Please contact your administrator.
          </p>
        </div>
      ) : (
        <AppraisalForm
          questions={questions}
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
    </div>
  );
} 