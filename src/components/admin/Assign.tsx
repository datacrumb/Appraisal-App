"use client";

import React, { useEffect, useState } from "react";
import { useUser, useAuth } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const Assign = () => {
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [forms, setForms] = useState<any[]>([]);
  const [selectedForm, setSelectedForm] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  // Check admin status
  useEffect(() => {
    if (isLoaded && user) {
      setIsAdmin(user.publicMetadata?.role === "admin");
    }
  }, [isLoaded, user]);

  // Fetch all users (employees) from Clerk
  useEffect(() => {
    const fetchUsers = async () => {
      setFetching(true);
      try {
        const token = await getToken();
        const res = await fetch("/api/employees", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) {
          // Filter out the current user (admin) from the list
          const filteredUsers = data.employees.filter((u: any) => u.id !== user?.id);
          setUsers(filteredUsers);
        } else {
          toast.error(data.error || "Failed to fetch users");
        }
      } catch (e: any) {
        toast.error(e.message || "Failed to fetch users");
      } finally {
        setFetching(false);
      }
    };
    if (isAdmin) fetchUsers();
  }, [isAdmin, getToken, user]);

  // Fetch all forms
  useEffect(() => {
    const fetchForms = async () => {
      try {
        const res = await fetch("/api/forms");
        const data = await res.json();
        if (res.ok) {
          setForms(data);
        } else {
          toast.error(data.error || "Failed to fetch forms");
        }
      } catch (e: any) {
        toast.error(e.message || "Failed to fetch forms");
      }
    };
    if (isAdmin) fetchForms();
  }, [isAdmin]);

  const handleUserSelect = (userId: string) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleAssign = async () => {
    if (!selectedForm || selectedUsers.length === 0) {
      toast.error("Select a form and at least one employee");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/forms/${selectedForm}/assign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employeeIds: selectedUsers }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Form assigned successfully!");
        setSelectedUsers([]);
      } else {
        toast.error(data.error || "Failed to assign form");
      }
    } catch (e: any) {
      toast.error(e.message || "Failed to assign form");
    } finally {
      setLoading(false);
    }
  };

  if (!isLoaded) return <div>Loading...</div>;
  if (!isAdmin) return <div className="text-center text-red-600 py-10">Access denied. Admins only.</div>;

  return (
    <div className="max-w-2xl mx-auto py-10">
      <h2 className="text-2xl font-bold mb-6">Assign Appraisal Form</h2>
      <div className="mb-4">
        <label className="block mb-2 font-medium">Select Form:</label>
        <select
          className="w-full border rounded-md p-2"
          value={selectedForm}
          onChange={(e) => setSelectedForm(e.target.value)}
        >
          <option value="">-- Select a form --</option>
          {forms.map((form: any) => (
            <option key={form.id} value={form.id}>
              {form.title}
            </option>
          ))}
        </select>
      </div>
      <div className="mb-4">
        <label className="block mb-2 font-medium">Select Employees:</label>
        {fetching ? (
          <div>Loading employees...</div>
        ) : (
          <div className="border rounded-md p-2 max-h-64 overflow-y-auto">
            {users.length === 0 && <div>No employees found.</div>}
            {users?.map((u) => (
              <div key={u.id} className="flex items-center gap-2 py-1">
                <input
                  type="checkbox"
                  checked={selectedUsers.includes(u.id)}
                  onChange={() => handleUserSelect(u.id)}
                  id={`user-${u.id}`}
                />
                <label htmlFor={`user-${u.id}`}>{u.email}</label>
              </div>
            ))}
          </div>
        )}
      </div>
      <Button
        onClick={handleAssign}
        disabled={loading || !selectedForm || selectedUsers.length === 0}
        className="w-full mt-4"
      >
        {loading ? "Assigning..." : "Assign Form"}
      </Button>
    </div>
  );
};

export default Assign;