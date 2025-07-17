'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

// Assignment type for TypeScript
interface Assignment {
  id: string;
  form: {
    title: string;
    description?: string;
  };
  assignedAt: string;
}

const Assignments = () => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch('/api/assignments')
      .then((res) => res.json())
      .then((data) => {
        setAssignments(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading assignments...</div>;
  if (!assignments.length) return <div>No assignments found.</div>;

  return (
    <div className="max-w-2xl mx-auto py-10">
      <h2 className="text-2xl font-bold mb-6">Your Assigned Appraisal Forms</h2>
      <ul className="space-y-4">
        {assignments.map((assignment) => (
          <li key={assignment.id} className="border rounded-md p-4 flex flex-col gap-2">
            <div>
              <span className="font-semibold">{assignment.form.title}</span>
              {assignment.form.description && (
                <span className="block text-muted-foreground text-sm">{assignment.form.description}</span>
              )}
            </div>
            <div className="text-xs text-gray-500">Assigned: {new Date(assignment.assignedAt).toLocaleString()}</div>
            <Link
              href={`/assignments/${assignment.id}`}
              className="inline-block mt-2 px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 transition"
            >
              Fill Out
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Assignments;