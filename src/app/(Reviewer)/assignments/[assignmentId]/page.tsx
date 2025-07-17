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
    questions: { label: string; type: string }[];
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

  return (
    <div className="max-w-2xl mx-auto py-10">
      <h2 className="text-2xl font-bold mb-6">{assignment.form.title}</h2>
      <p className="mb-6 text-muted-foreground">{assignment.form.description}</p>
      <AppraisalForm
        questions={assignment.form.questions}
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
    </div>
  );
} 