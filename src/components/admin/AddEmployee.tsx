"use client";

import React, { useEffect, useState } from "react";
import { toast } from "sonner";

export default function AddEmployee() {
  const [users, setUsers] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState<string | null>(null);

  // Fetch all Clerk users
  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch("/api/users").then((res) => res.json()),
      fetch("/api/employees/relations").then((res) => res.json()),
    ])
      .then(([userData, employeeData]) => {
        setUsers(userData.users || userData.users?.users || []);
        setEmployees(employeeData.employees || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Find users not yet in Employee table
  const employeeIds = new Set(employees.map((e: any) => e.id));
  const unapprovedUsers = users.filter((u) => !employeeIds.has(u.id));

  const handleAdd = async (user: any) => {
    setAdding(user.id);
    try {
      const res = await fetch("/api/employees/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: user.id, email: user.email }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to add employee");
      }
      toast.success("Employee added!");
      setEmployees((prev) => [...prev, { id: user.id, email: user.email }]);
    } catch (e: any) {
      toast.error(e.message || "Something went wrong");
    } finally {
      setAdding(null);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-10">
      <h2 className="text-2xl font-bold mb-6">Approve Employees</h2>
      {loading ? (
        <div>Loading users...</div>
      ) : unapprovedUsers.length === 0 ? (
        <div>All users are approved as employees.</div>
      ) : (
        <ul className="space-y-4">
          {unapprovedUsers.map((user) => (
            <li key={user.id} className="border rounded-md p-4 flex items-center justify-between">
              <span>{user.email}</span>
              <button
                className="bg-primary text-white rounded px-4 py-2"
                onClick={() => handleAdd(user)}
                disabled={adding === user.id}
              >
                {adding === user.id ? "Adding..." : "Add as Employee"}
              </button>
            </li>
          ))}
        </ul>
      )}
      <h3 className="text-lg font-semibold mt-8 mb-2">Current Employees</h3>
      <ul className="space-y-2">
        {employees.map((e: any) => (
          <li key={e.id} className="border rounded p-2 text-sm">
            {e.email}
          </li>
        ))}
      </ul>
    </div>
  );
}