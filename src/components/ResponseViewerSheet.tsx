"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { X } from "lucide-react";

interface Question {
  id: string;
  label: string;
  type: "rating" | "multiple-choice" | "text";
  options?: string[];
  section: string;
}

interface Response {
  id: string;
  createdAt: string;
  answers: Record<string, any>;
  assignment: {
    employeeEmail: string;
    employeeName?: string;
    employeeProfilePictureUrl?: string;
    evaluationTarget?: {
      type: "MANAGER" | "EMPLOYEE" | "COLLEAGUE" | "LEAD" | "ADMIN";
      targetId: string;
      targetName: string;
      targetRole: string;
      targetDepartment: string;
    };
    form: {
      title: string;
      questions: Question[];
    };
  };
}

interface ResponseViewerSheetProps {
  isOpen: boolean;
  onClose: () => void;
  responseId?: string;
  assignmentId?: string;
  fetchResponse: (id: string) => Promise<Response>;
  title?: string;
}

const ResponseViewerSheet: React.FC<ResponseViewerSheetProps> = ({
  isOpen,
  onClose,
  responseId,
  assignmentId,
  fetchResponse,
  title = "Response Details"
}) => {
  const [response, setResponse] = useState<Response | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setResponse(null);
      return;
    }

    const id = responseId || assignmentId;
    if (!id) return;

    const loadResponse = async () => {
      setLoading(true);
      try {
        const data = await fetchResponse(id);
        setResponse(data);
      } catch (error) {
        console.error('Failed to fetch response:', error);
      } finally {
        setLoading(false);
      }
    };

    loadResponse();
  }, [isOpen, responseId, assignmentId, fetchResponse]);

  // Skeleton component for response detail loading
  const ResponseDetailSkeleton = () => (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-3/4 mb-2" />
        <Skeleton className="h-4 w-1/2 mb-1" />
        <Skeleton className="h-3 w-1/3" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="border-b pb-4 last:border-b-0">
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-20 w-full" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  if (!isOpen) return null;

  return (
    <div className="w-full lg:w-1/2 p-6 overflow-y-auto">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold">{title}</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {loading ? (
        <ResponseDetailSkeleton />
      ) : response ? (
        <Card>
          <CardHeader>
            <CardTitle>
              {response.assignment.evaluationTarget ? 
                `${response.assignment.evaluationTarget.targetName} Performance Evaluation` : 
                response.assignment.form.title
              }
            </CardTitle>
            <div className="text-sm text-muted-foreground">
              Employee: {response.assignment.employeeName || response.assignment.employeeEmail}
            </div>
            {response.assignment.evaluationTarget && (
              <div className="text-sm text-muted-foreground">
                {response.assignment.evaluationTarget.targetRole} • {response.assignment.evaluationTarget.targetDepartment}
              </div>
            )}
            <div className="text-xs text-gray-500">
              Submitted: {new Date(response.createdAt).toLocaleString()}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array.isArray(response.assignment.form.questions)
                ? response.assignment.form.questions.map((q: Question, idx: number) => (
                  <div key={idx} className="border-b pb-4 last:border-b-0">
                    <div className="font-medium text-sm text-gray-700 mb-2">
                      {idx + 1}. {q.label}
                    </div>
                    <div className="text-sm text-gray-900 bg-gray-50 p-3 rounded-md whitespace-pre-line">
                      {response.answers[q.id] || (
                        <span className="italic text-gray-400">No answer provided</span>
                      )}
                    </div>
                  </div>
                ))
                : (
                  <div className="text-center text-gray-500 py-8">
                    No questions found in this form
                  </div>
                )
              }
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="text-center text-gray-500 py-8">
          No response data available
        </div>
      )}
    </div>
  );
};

export default ResponseViewerSheet; 