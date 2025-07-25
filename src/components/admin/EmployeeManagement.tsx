"use client";

import { useState, useMemo } from "react";
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
import { Input } from "@/components/ui/input";
import { Clock, Users, CheckCircle, UserCheck, Search } from "lucide-react";

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
  
  // Search state for employees
  const [employeeSearch, setEmployeeSearch] = useState("");
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [currentEmployeePage, setCurrentEmployeePage] = useState(1);
  const itemsPerPage = 5;

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

  // Filter employees based on search
  const filteredEmployees = useMemo(() => {
    if (!employeeSearch.trim()) return allEmployees;
    
    const searchTerm = employeeSearch.toLowerCase();
    return allEmployees.filter((employee) => {
      const fullName = `${employee.firstName || ""} ${employee.lastName || ""}`.toLowerCase();
      const email = employee.email.toLowerCase();
      const department = (employee.department || "").toLowerCase();
      const role = (employee.role || "").toLowerCase();
      
      return (
        fullName.includes(searchTerm) ||
        email.includes(searchTerm) ||
        department.includes(searchTerm) ||
        role.includes(searchTerm)
      );
    });
  }, [allEmployees, employeeSearch]);

  // Pagination calculations for requests
  const totalRequestPages = Math.ceil(requests.length / itemsPerPage);
  const startRequestIndex = (currentPage - 1) * itemsPerPage;
  const endRequestIndex = startRequestIndex + itemsPerPage;
  const paginatedRequests = requests.slice(startRequestIndex, endRequestIndex);

  // Pagination calculations for employees
  const totalEmployeePages = Math.ceil(filteredEmployees.length / itemsPerPage);
  const startEmployeeIndex = (currentEmployeePage - 1) * itemsPerPage;
  const endEmployeeIndex = startEmployeeIndex + itemsPerPage;
  const paginatedEmployees = filteredEmployees.slice(startEmployeeIndex, endEmployeeIndex);

  // Reset pagination when search changes
  const handleEmployeeSearchChange = (value: string) => {
    setEmployeeSearch(value);
    setCurrentEmployeePage(1);
  };

  return (
    <Tabs defaultValue="pending" className="w-full">
      <TabsList className="grid w-full grid-cols-2 rounded-full">
        <TabsTrigger value="pending" className="flex items-center gap-2 rounded-full">
          <Clock className="h-4 w-4" />
          Pending Approvals ({requests.length})
        </TabsTrigger>
        <TabsTrigger value="employees" className="flex items-center gap-2 rounded-full">
          <Users className="h-4 w-4" />
          All Employees ({filteredEmployees.length})
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
          <>
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
                  {paginatedRequests.map((request) => (
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
            
            {/* Pagination for Requests */}
            {totalRequestPages > 1 && (
              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-gray-500">
                  Showing {startRequestIndex + 1} to {Math.min(endRequestIndex, requests.length)} of {requests.length} requests
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalRequestPages }, (_, i) => i + 1).map((page) => (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                        className="w-8 h-8 p-0"
                      >
                        {page}
                      </Button>
                    ))}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalRequestPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </TabsContent>

      <TabsContent value="employees" className="mt-6">
        {/* Search for Employees */}
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search by name, email, department, or role..."
              value={employeeSearch}
              onChange={(e) => handleEmployeeSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

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
              {paginatedEmployees.map((employee) => (
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
                      <Badge variant="default" className="bg-green-200 text-green-700">Active</Badge>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Pagination for Employees */}
        {totalEmployeePages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-gray-500">
              Showing {startEmployeeIndex + 1} to {Math.min(endEmployeeIndex, filteredEmployees.length)} of {filteredEmployees.length} employees
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentEmployeePage(currentEmployeePage - 1)}
                disabled={currentEmployeePage === 1}
              >
                Previous
              </Button>
              <div className="flex items-center gap-1">
                {Array.from({ length: totalEmployeePages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={currentEmployeePage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentEmployeePage(page)}
                    className="w-8 h-8 p-0"
                  >
                    {page}
                  </Button>
                ))}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentEmployeePage(currentEmployeePage + 1)}
                disabled={currentEmployeePage === totalEmployeePages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
}
