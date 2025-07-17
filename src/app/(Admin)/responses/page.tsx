'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';

interface Response {
  id: string;
  createdAt: string;
  assignment: {
    employeeEmail: string;
    form: {
      title: string;
    };
  };
}

const AdminResponsesPage = () => {
  const [responses, setResponses] = useState<Response[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch('/api/responses')
      .then((res) => res.json())
      .then((data) => {
        setResponses(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading responses...</div>;
  if (!responses.length) return <div>No responses found.</div>;

  return (
    <div className="max-w-3xl mx-auto py-10">
      <h2 className="text-2xl font-bold mb-6">All Employee Responses</h2>
      <ul className="space-y-4">
        {responses.map((response) => (
          <li key={response.id} className="border rounded-md p-4 flex flex-col gap-2">
            <div>
              <span className="font-semibold">{response.assignment.form.title}</span>
              <span className="block text-muted-foreground text-sm">Employee: {response.assignment.employeeEmail}</span>
            </div>
            <div className="text-xs text-gray-500">Submitted: {new Date(response.createdAt).toLocaleString()}</div>
            <Link
              href={`/responses/${response.id}`}
              className="inline-block mt-2 px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 transition"
            >
              View Response
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AdminResponsesPage;