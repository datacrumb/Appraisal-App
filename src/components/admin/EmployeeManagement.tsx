"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Clock, Users, CheckCircle, UserCheck } from "lucide-react";

interface OnboardingRequest {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  department: string;
  role: string;
  isManager: boolean;
  isLead: boolean;
  managerEmail: string | null;
  createdAt: Date;
  status: string;
  approvedAt: Date | null;
  approvedBy: string | null;
  profilePictureUrl?: string | null;
}

interface Employee {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  department: string | null;
  role: string | null;
  isManager: boolean;
  isLead: boolean;
  createdAt: Date;
  profilePictureUrl?: string | null;
}

interface ApprovalsListProps {
  initialRequests: OnboardingRequest[];
  allEmployees: Employee[];
}

export function EmployeeManagement({ initialRequests, allEmployees }: ApprovalsListProps) {
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

  const getInitials = (firstName: string | null, lastName: string | null, email: string) => {
    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase();
    }
    if (firstName) {
      return firstName[0].toUpperCase();
    }
    if (!email) return "?";
    const [name] = email.split("@");
    return name
      .split(/[._-]/)
      .map((part) => part[0]?.toUpperCase() || "")
      .join("")
      .slice(0, 2);
  };

  return (
    <Tabs defaultValue="pending" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="pending" className="flex items-center gap-2">
          <Clock className="h-4 w-4" />
          Pending Approvals ({requests.length})
        </TabsTrigger>
        <TabsTrigger value="employees" className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          All Employees ({allEmployees.length})
        </TabsTrigger>
      </TabsList>

      <TabsContent value="pending" className="mt-6">
        {requests.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <p className="text-lg font-semibold text-gray-900">No pending approvals</p>
            <p className="text-gray-500">All requests have been processed.</p>
          </div>
        ) : (
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Manager</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Requested</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={request.profilePictureUrl || undefined} />
                          <AvatarFallback className="text-xs">
                            {getInitials(request.firstName, request.lastName, request.email)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">
                            {request.firstName} {request.lastName}
                          </p>
                          <p className="text-sm text-gray-500">{request.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{request.department}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Badge variant="secondary">{request.role}</Badge>
                        {request.isManager && <Badge variant="outline">Manager</Badge>}
                        {request.isLead && <Badge variant="outline">Lead</Badge>}
                      </div>
                    </TableCell>
                    <TableCell>{request.managerEmail || 'None'}</TableCell>
                    <TableCell>
                      <Badge variant="destructive">Pending</Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(request.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        onClick={() => handleApprove(request.id)}
                        disabled={loading === request.id}
                        size="sm"
                      >
                        {loading === request.id ? "Approving..." : "Approve"}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </TabsContent>

      <TabsContent value="employees" className="mt-6">
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allEmployees.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={employee.profilePictureUrl || undefined} />
                        <AvatarFallback className="text-xs">
                          {getInitials(employee.firstName, employee.lastName, employee.email)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">
                          {employee.firstName && employee.lastName 
                            ? `${employee.firstName} ${employee.lastName}`
                            : employee.email
                          }
                        </p>
                        <p className="text-sm text-gray-500">{employee.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{employee.department || 'N/A'}</TableCell>
                  <TableCell>{employee.role || 'N/A'}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {employee.isManager && <Badge variant="default">Manager</Badge>}
                      {employee.isLead && <Badge variant="secondary">Lead</Badge>}
                      {!employee.isManager && !employee.isLead && (
                        <Badge variant="outline">Employee</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {new Date(employee.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <UserCheck className="h-4 w-4 text-green-500" />
                      <Badge variant="default">Active</Badge>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </TabsContent>
    </Tabs>
  );
}
