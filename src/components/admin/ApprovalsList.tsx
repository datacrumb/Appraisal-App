"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface OnboardingRequest {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  department: string;
  role: string;
  isManager: boolean;
  isLead: boolean;
  managerEmail: string | null; // Change from string | undefined to string | null
  createdAt: Date;
  status: string;
  approvedAt: Date | null;
  approvedBy: string | null;
}

interface ApprovalsListProps {
  initialRequests: OnboardingRequest[];
}

export function ApprovalsList({ initialRequests }: ApprovalsListProps) {
  const [requests, setRequests] = useState(initialRequests);
  const [loading, setLoading] = useState<string | null>(null);

  const handleApprove = async (requestId: string) => {
    setLoading(requestId);
    try {
      const response = await fetch("/api/approvals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to approve request");
      }

      setRequests((prev) => prev.filter((req) => req.id !== requestId));
      toast.success("Request approved successfully!");
    } catch (error: any) {
      toast.error(error.message || "An error occurred while approving the request.");
    } finally {
      setLoading(null);
    }
  };

  if (requests.length === 0) {
    return <p>No pending approvals.</p>;
  }

  return (
    <div className="border rounded-lg">
      <ul className="divide-y divide-gray-200 dark:divide-gray-700">
        {requests.map((request) => (
          <li key={request.id} className="p-4 flex flex-col sm:flex-row justify-between sm:items-center">
            <div className="mb-2 sm:mb-0">
              <p className="font-semibold text-lg">
                {request.firstName} {request.lastName}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {request.email} | {request.department} | {request.role}
              </p>
              <p className="text-xs text-gray-500">
                Manager: {request.managerEmail || 'None'} | 
                {request.isManager && ' Manager'} | 
                {request.isLead && ' Lead'}
              </p>
            </div>
            <Button
              onClick={() => handleApprove(request.id)}
              disabled={loading === request.id}
            >
              {loading === request.id ? "Approving..." : "Approve"}
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
}
