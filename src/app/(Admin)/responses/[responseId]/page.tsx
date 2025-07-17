'use client';
import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

interface Response {
  id: string;
  createdAt: string;
  answers: Record<string, any>;
  assignment: {
    employeeEmail: string;
    form: {
      title: string;
      questions: { label: string; type: string }[];
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

  if (loading) return <div>Loading response...</div>;
  if (!response) return <div>Response not found.</div>;

  return (
    <div className="max-w-2xl mx-auto py-10">
      <h2 className="text-2xl font-bold mb-4">{response.assignment.form.title}</h2>
      <div className="mb-2 text-muted-foreground">Employee: {response.assignment.employeeEmail}</div>
      <div className="mb-2 text-xs text-gray-500">Submitted: {new Date(response.createdAt).toLocaleString()}</div>
      <div className="mt-6 space-y-4">
        {response.assignment.form.questions.map((q, idx) => (
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
