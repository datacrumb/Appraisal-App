"use client";

import React, { useEffect, useState } from "react";
import { toast } from "sonner";

export default function EmployeeCrud() {
  const [users, setUsers] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState<string | null>(null);
  const [removing, setRemoving] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch("/api/users").then((res) => res.json()),
      fetch("/api/employees").then((res) => res.json()),
    ])
      .then(([userData, employeeData]) => {
        setUsers(userData.users || []);
        setEmployees(employeeData.employees || []);
      })
      .catch(() => {
        toast.error("Failed to load data");
      })
      .finally(() => setLoading(false));
  }, []);

  const employeeIds = new Set(employees.map((e: any) => e.id));
  const unapprovedUsers = users.filter((u) => !employeeIds.has(u.id));

  const handleAdd = async (user: any) => {
    setAdding(user.id);
    try {
      const res = await fetch("/api/employees", {
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

  const handleRemove = async (employeeId: string) => {
    setRemoving(employeeId);
    try {
      const res = await fetch("/api/employees", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: employeeId }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to remove employee");
      }
      toast.success("Employee removed!");
      setEmployees((prev) => prev.filter((e) => e.id !== employeeId));
    } catch (e: any) {
      toast.error(e.message || "Something went wrong");
    } finally {
      setRemoving(null);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-10">
      <h2 className="text-2xl font-bold mb-6">Approve New Employees</h2>
      {loading ? (
        <div>Loading users...</div>
      ) : unapprovedUsers.length === 0 ? (
        <div className="text-gray-500">All registered users have been approved.</div>
      ) : (
        <ul className="space-y-4">
          {unapprovedUsers.map((user) => (
            <li key={user.id} className="border rounded-md p-4 flex items-center justify-between">
              <span>{user.email}</span>
              <button
                className="bg-blue-500 hover:bg-blue-600 text-white rounded px-4 py-2 transition-colors"
                onClick={() => handleAdd(user)}
                disabled={adding === user.id}
              >
                {adding === user.id ? "Adding..." : "Add as Employee"}
              </button>
            </li>
          ))}
        </ul>
      )}

      <h3 className="text-xl font-semibold mt-10 mb-4">Current Employees</h3>
      {loading ? (
        <div>Loading employees...</div>
      ) : employees.length === 0 ? (
        <div className="text-gray-500">No employees found.</div>
      ) : (
        <ul className="space-y-2">
          {employees.map((e: any) => (
            <li key={e.id} className="border rounded-md p-3 flex items-center justify-between">
              <span className="text-sm">{e.email}</span>
              <button
                className="bg-red-500 hover:bg-red-600 text-white text-xs rounded px-3 py-1 transition-colors"
                onClick={() => handleRemove(e.id)}
                disabled={removing === e.id}
              >
                {removing === e.id ? "Removing..." : "Remove"}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}