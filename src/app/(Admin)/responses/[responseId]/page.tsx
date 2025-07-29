'use client';
import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';

interface Response {
  id: string;
  createdAt: string;
  answers: Record<string, any>;
  assignment: {
    employeeEmail: string;
    form: {
      title: string;
      questions: any; // Can be object or array
    };
  };
}

const AdminResponseDetailPage = () => {
  const { responseId } = useParams();
  const [response, setResponse] = useState<Response | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!responseId) return;
    setLoading(true);
    fetch(`/api/responses/${responseId}`)
      .then((res) => res.json())
      .then((data) => {
        setResponse(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [responseId]);

  // Skeleton component for response loading
  const ResponseSkeleton = () => (
    <div className="max-w-2xl mx-auto py-10">
      <Skeleton className="h-8 w-3/4 mb-4" />
      <Skeleton className="h-4 w-1/2 mb-2" />
      <Skeleton className="h-3 w-1/3 mb-6" />
      
      <div className="mt-6 space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="border-b pb-2">
            <Skeleton className="h-5 w-3/4 mb-2" />
            <Skeleton className="h-16 w-full" />
          </div>
        ))}
      </div>
    </div>
  );

  if (loading) return <ResponseSkeleton />;
  if (!response) return <div>Response not found.</div>;

  // Ensure questions is always an array
  const questions = Array.isArray(response.assignment.form.questions) 
    ? response.assignment.form.questions 
    : [];

  return (
    <div className="max-w-2xl mx-auto py-10">
      <h2 className="text-2xl font-bold mb-4">{response.assignment.form.title}</h2>
      <div className="mb-2 text-muted-foreground">Employee: {response.assignment.employeeEmail}</div>
      <div className="mb-2 text-xs text-gray-500">Submitted: {new Date(response.createdAt).toLocaleString()}</div>
      <div className="mt-6 space-y-4">
        {questions.map((q, idx) => (
          <div key={idx} className="border-b pb-2">
            <div className="font-medium">{q.label}</div>
            <div className="mt-1 text-gray-700 whitespace-pre-line">
              {response.answers[`q${idx + 1}`] || <span className="italic text-gray-400">No answer</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminResponseDetailPage;
