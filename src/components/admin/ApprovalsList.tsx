"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { OnboardingRequest } from "@/lib/sheets";

interface ApprovalsListProps {
  initialApprovals: OnboardingRequest[];
}

export function ApprovalsList({ initialApprovals }: ApprovalsListProps) {
  const [approvals, setApprovals] = useState(initialApprovals);
  const [loading, setLoading] = useState<number | null>(null);

  const handleApprove = async (rowNumber: number) => {
    setLoading(rowNumber);
    try {
      const response = await fetch("/api/approvals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ rowNumber }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to approve request");
      }

      setApprovals((prev) => prev.filter((req) => req.rowNumber !== rowNumber));
      toast.success("Request approved successfully!");
    } catch (error: any) {
      toast.error(error.message || "An error occurred while approving the request.");
      console.error(error);
    } finally {
      setLoading(null);
    }
  };

  if (approvals.length === 0) {
    return <p>No pending approvals.</p>;
  }

  return (
    <div className="border rounded-lg">
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
        {approvals.map((request) => (
            <li
            key={request.rowNumber}
            className="p-4 flex flex-col sm:flex-row justify-between sm:items-center"
            >
            <div className="mb-2 sm:mb-0">
                <p className="font-semibold text-lg">{request.name}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                Role: {request.role} | Manager: {request.manager}
                </p>
            </div>
            <Button
                onClick={() => handleApprove(request.rowNumber)}
                disabled={loading === request.rowNumber}
            >
                {loading === request.rowNumber ? "Approving..." : "Approve"}
            </Button>
            </li>
        ))}
        </ul>
    </div>
  );
}
