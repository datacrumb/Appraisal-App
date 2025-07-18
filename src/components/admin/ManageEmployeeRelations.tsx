"use client";

import React, { useEffect, useState } from "react";
import { toast } from "sonner";

const RELATION_TYPES = ["MANAGER", "LEAD", "COLLEAGUE"];

export default function ManageEmployeeRelations() {
  const [users, setUsers] = useState<any[]>([]);
  const [relations, setRelations] = useState<any[]>([]);
  const [fromId, setFromId] = useState("");
  const [toId, setToId] = useState("");
  const [type, setType] = useState(RELATION_TYPES[0]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editType, setEditType] = useState<string>(RELATION_TYPES[0]);

  // Fetch users
  useEffect(() => {
    fetch("/api/users")
      .then((res) => res.json())
      .then((data) => {
        setUsers(data.users || data.users?.users || []);
      });
  }, []);

  // Fetch current relations
  useEffect(() => {
    fetch("/api/employees/relations")
      .then((res) => res.json())
      .then((data) => {
        setRelations(data.relations || []);
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fromId || !toId || !type) {
      toast.error("Please select both users and a relation type.");
      return;
    }
    if (fromId === toId) {
      toast.error("Cannot relate a user to themselves.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/employees/relations/manage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fromId, toId, type }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to add relation");
      }
      toast.success("Relation added/updated!");
      setFromId("");
      setToId("");
      setType(RELATION_TYPES[0]);
      // Refresh relations
      fetch("/api/employees/relations")
        .then((res) => res.json())
        .then((data) => setRelations(data.relations || []));
    } catch (e: any) {
      toast.error(e.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (rel: any) => {
    if (editingId !== rel.id) {
      setEditingId(rel.id);
      setEditType(rel.type);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/employees/relations", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: rel.id, type: editType }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to update relation");
      }
      toast.success("Relation updated!");
      setEditingId(null);
      // Refresh relations
      fetch("/api/employees/relations")
        .then((res) => res.json())
        .then((data) => setRelations(data.relations || []));
    } catch (e: any) {
      toast.error(e.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setLoading(true);
    try {
      const res = await fetch("/api/employees/relations", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to delete relation");
      }
      toast.success("Relation deleted!");
      setRelations((prev) => prev.filter((rel: any) => rel.id !== id));
    } catch (e: any) {
      toast.error(e.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-10">
      <h2 className="text-2xl font-bold mb-6">Manage Employee Relations</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 mb-8">
        <div>
          <label className="block mb-1 font-medium">From (Employee):</label>
          <select
            className="w-full border rounded-md p-2"
            value={fromId}
            onChange={(e) => setFromId(e.target.value)}
          >
            <option value="">-- Select Employee --</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.email}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block mb-1 font-medium">To (Target Employee):</label>
          <select
            className="w-full border rounded-md p-2"
            value={toId}
            onChange={(e) => setToId(e.target.value)}
          >
            <option value="">-- Select Employee --</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.email}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block mb-1 font-medium">Relation Type:</label>
          <select
            className="w-full border rounded-md p-2"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            {RELATION_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          className="bg-primary text-white rounded px-4 py-2 mt-2"
          disabled={loading}
        >
          {loading ? "Saving..." : "Add/Update Relation"}
        </button>
      </form>
      <h3 className="text-lg font-semibold mb-2">Current Relations</h3>
      <ul className="space-y-2">
        {relations.map((rel: any) => (
          <li key={rel.id} className="border rounded p-2 text-sm flex items-center gap-2">
            {editingId === rel.id ? (
              <>
                <select
                  className="border rounded p-1 mr-2"
                  value={editType}
                  onChange={(e) => setEditType(e.target.value)}
                >
                  {RELATION_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
                <button
                  className="text-green-600 underline"
                  onClick={() => handleEdit(rel)}
                  disabled={loading}
                >
                  Save
                </button>
                <button
                  className="text-gray-600 underline ml-2"
                  onClick={() => setEditingId(null)}
                  disabled={loading}
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
                <span className="font-medium">{rel.type}</span>: {rel.from?.email} → {rel.to?.email}
                <button
                  className="ml-2 text-blue-600 underline"
                  onClick={() => handleEdit(rel)}
                  disabled={loading}
                >
                  Edit
                </button>
                <button
                  className="ml-2 text-red-600 underline"
                  onClick={() => handleDelete(rel.id)}
                  disabled={loading}
                >
                  Delete
                </button>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
} 