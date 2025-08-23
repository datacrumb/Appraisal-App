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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Clock,
  Users,
  CheckCircle,
  Search,
  Save,
  X,
  Trash2,
} from "lucide-react";
import { TableSkeleton } from "../layout/TableSkeleton";

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

export function EmployeeManagement({
  initialRequests,
  allEmployees: initialAllEmployees,
}: ApprovalsListProps) {
  const [requests, setRequests] = useState(initialRequests);
  const [allEmployees, setAllEmployees] = useState(initialAllEmployees);
  const [loading, setLoading] = useState<string | null>(null);
  const [rejectLoading, setRejectLoading] = useState<string | null>(null);
  const [saveLoading, setSaveLoading] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);

  // Search state for employees
  const [employeeSearch, setEmployeeSearch] = useState("");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [currentEmployeePage, setCurrentEmployeePage] = useState(1);
  const itemsPerPage = 10;

  // Editable employee state
  const [editingEmployee, setEditingEmployee] = useState<string | null>(null);
  const [editedEmployees, setEditedEmployees] = useState<
    Record<string, Partial<Employee>>
  >({});

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
      toast.error(
        error.message || "An error occurred while approving the request."
      );
    } finally {
      setLoading(null);
    }
  };

  const handleReject = async (requestId: string) => {
    setRejectLoading(requestId);
    try {
      const response = await fetch("/api/approvals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId, action: "reject" }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to reject request");
      }

      setRequests((prev) => prev.filter((req) => req.id !== requestId));
      toast.success("Request rejected successfully!");
    } catch (error: any) {
      toast.error(
        error.message || "An error occurred while rejecting the request."
      );
    } finally {
      setRejectLoading(null);
    }
  };

  const handleEditEmployee = (employeeId: string) => {
    setEditingEmployee(employeeId);
    const employee = allEmployees.find((emp) => emp.id === employeeId);
    if (employee) {
      setEditedEmployees((prev) => ({
        ...prev,
        [employeeId]: {
          department: employee.department || "",
          role: employee.role || "",
          isManager: employee.isManager,
          isLead: employee.isLead,
        },
      }));
    }
  };

  const handleSaveEmployee = async (employeeId: string) => {
    const editedData = editedEmployees[employeeId];
    if (!editedData) return;

    setSaveLoading(employeeId);
    try {
      const response = await fetch(`/api/employees/${employeeId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editedData),
      });

      if (!response.ok) {
        throw new Error("Failed to update employee");
      }

      toast.success("Employee updated successfully!");
      setEditingEmployee(null);
      setEditedEmployees((prev) => {
        const newState = { ...prev };
        delete newState[employeeId];
        return newState;
      });
    } catch (error: any) {
      toast.error(
        error.message || "An error occurred while updating employee."
      );
    } finally {
      setSaveLoading(null);
    }
  };

  const handleCancelEdit = (employeeId: string) => {
    setEditingEmployee(null);
    setEditedEmployees((prev) => {
      const newState = { ...prev };
      delete newState[employeeId];
      return newState;
    });
  };

  const handleDeleteEmployee = async (employeeId: string) => {
    const employee = allEmployees.find((emp) => emp.id === employeeId);
    const employeeName = employee
      ? `${employee.firstName || ""} ${employee.lastName || ""}`.trim() ||
        employee.email
      : "Employee";

    setDeleteLoading(employeeId);
    try {
      const response = await fetch(`/api/employees/${employeeId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete employee");
      }

      const result = await response.json();

      // Store employee data for undo functionality
      const deletedEmployeeData = result.employeeData;

      toast.success(`${employeeName} deleted successfully!`, {
        description:
          result.deletedRelations > 0
            ? `Removed ${result.deletedRelations} hierarchy relations. Form responses are preserved.`
            : "Form responses are preserved.",
        action: {
          label: "Undo",
          onClick: () => handleUndoDelete(deletedEmployeeData),
        },
        duration: 10000, // 10 seconds to allow undo
      });

      setEditingEmployee(null);
      setEditedEmployees((prev) => {
        const newState = { ...prev };
        delete newState[employeeId];
        return newState;
      });
    } catch (error: any) {
      toast.error(
        error.message || "An error occurred while deleting employee."
      );
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleUndoDelete = async (employeeData: any) => {
    try {
      const response = await fetch("/api/employees/undo-delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employeeData }),
      });

      if (!response.ok) {
        throw new Error("Failed to restore employee");
      }

      const result = await response.json();

      toast.success(
        `${employeeData.firstName || ""} ${
          employeeData.lastName || ""
        }`.trim() || employeeData.email,
        {
          description: "Employee restored successfully with all relations.",
        }
      );

      // Refresh the page to show the restored employee
      window.location.reload();
    } catch (error: any) {
      toast.error(
        error.message || "An error occurred while restoring employee."
      );
    }
  };

  const getInitials = (
    firstName: string | null,
    lastName: string | null,
    email: string
  ) => {
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

  // Skeleton components for loading states
  const ActionButtonSkeleton = () => (
    <div className="flex gap-1 justify-end">
      <Skeleton className="h-8 w-16" />
      <Skeleton className="h-8 w-16" />
    </div>
  );

  const EmployeeActionSkeleton = () => (
    <div className="flex gap-1 justify-end">
      <Skeleton className="h-8 w-8" />
      <Skeleton className="h-8 w-8" />
      <Skeleton className="h-8 w-8" />
    </div>
  );

  // Filter employees based on search
  const filteredEmployees = useMemo(() => {
    if (!employeeSearch.trim()) return allEmployees;

    const searchTerm = employeeSearch.toLowerCase();
    return allEmployees.filter((employee) => {
      const fullName = `${employee.firstName || ""} ${
        employee.lastName || ""
      }`.toLowerCase();
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
  const paginatedEmployees = filteredEmployees.slice(
    startEmployeeIndex,
    endEmployeeIndex
  );

  // Reset pagination when search changes
  const handleEmployeeSearchChange = (value: string) => {
    setEmployeeSearch(value);
    setCurrentEmployeePage(1);
  };

  return (
    <Tabs defaultValue="employees" className="w-full">
      <TabsList className="grid w-full grid-cols-2 rounded-full">
        <TabsTrigger
          value="employees"
          className="flex items-center gap-2 rounded-full"
        >
          <Users className="h-4 w-4" />
          All Employees ({filteredEmployees.length})
        </TabsTrigger>
        <TabsTrigger
          value="pending"
          className="flex items-center gap-2 rounded-full"
        >
          <Clock className="h-4 w-4" />
          Pending Approvals ({requests.length})
        </TabsTrigger>
      </TabsList>

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

        {saveLoading || deleteLoading ? (
          <TableSkeleton />
        ) : (
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="px-2">Employee</TableHead>
                  <TableHead className="px-2">Department</TableHead>
                  <TableHead className="px-2">Role</TableHead>
                  <TableHead className="px-2">Position</TableHead>
                  <TableHead className="px-2">Joined</TableHead>
                  <TableHead className="px-2">Status</TableHead>
                  <TableHead className="px-2 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedEmployees.map((employee) => {
                  const isEditing = editingEmployee === employee.id;
                  const editedData = editedEmployees[employee.id] || {};

                  return (
                    <TableRow key={employee.id}>
                      <TableCell className="px-2">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage
                              src={employee.profilePictureUrl || undefined}
                            />
                            <AvatarFallback className="text-xs">
                              {getInitials(
                                employee.firstName,
                                employee.lastName,
                                employee.email
                              )}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-sm">
                              {employee.firstName && employee.lastName
                                ? `${employee.firstName} ${employee.lastName}`
                                : employee.email}
                            </p>
                            <p className="text-xs text-gray-500">
                              {employee.email}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="px-2">
                        {isEditing ? (
                          <Input
                            value={editedData.department || ""}
                            onChange={(e) =>
                              setEditedEmployees((prev) => ({
                                ...prev,
                                [employee.id]: {
                                  ...prev[employee.id],
                                  department: e.target.value,
                                },
                              }))
                            }
                            className="h-7 text-sm"
                          />
                        ) : (
                          <span className="text-sm">
                            {employee.department || "N/A"}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="px-2">
                        {isEditing ? (
                          <Input
                            value={editedData.role || ""}
                            onChange={(e) =>
                              setEditedEmployees((prev) => ({
                                ...prev,
                                [employee.id]: {
                                  ...prev[employee.id],
                                  role: e.target.value,
                                },
                              }))
                            }
                            className="h-7 text-sm"
                          />
                        ) : (
                          <span className="text-sm">
                            {employee.role || "N/A"}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="px-2">
                        {isEditing ? (
                          <div className="flex gap-1">
                            <Select
                              value={
                                editedData.isManager
                                  ? "manager"
                                  : editedData.isLead
                                  ? "lead"
                                  : "employee"
                              }
                              onValueChange={(value) =>
                                setEditedEmployees((prev) => ({
                                  ...prev,
                                  [employee.id]: {
                                    ...prev[employee.id],
                                    isManager: value === "manager",
                                    isLead: value === "lead",
                                  },
                                }))
                              }
                            >
                              <SelectTrigger className="h-7 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="employee">
                                  Employee
                                </SelectItem>
                                <SelectItem value="lead">Lead</SelectItem>
                                <SelectItem value="manager">Manager</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        ) : (
                          <div className="flex gap-1">
                            {employee.isManager && (
                              <Badge variant="default" className="text-xs">
                                Manager
                              </Badge>
                            )}
                            {employee.isLead && (
                              <Badge variant="secondary" className="text-xs">
                                Lead
                              </Badge>
                            )}
                            {!employee.isManager && !employee.isLead && (
                              <Badge variant="outline" className="text-xs">
                                Employee
                              </Badge>
                            )}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="px-2 text-sm">
                        {new Date(employee.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="px-2">
                        <Badge
                          variant="default"
                          className="bg-green-200 text-green-700 text-xs"
                        >
                          Active
                        </Badge>
                      </TableCell>
                      <TableCell className="px-2 text-right">
                        {saveLoading === employee.id ||
                        deleteLoading === employee.id ? (
                          <EmployeeActionSkeleton />
                        ) : isEditing ? (
                          <div className="flex gap-1 justify-end">
                            <Button
                              onClick={() => handleDeleteEmployee(employee.id)}
                              disabled={
                                saveLoading === employee.id ||
                                deleteLoading === employee.id
                              }
                              size="sm"
                              variant="destructive"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                            <Button
                              onClick={() => handleSaveEmployee(employee.id)}
                              disabled={
                                saveLoading === employee.id ||
                                deleteLoading === employee.id
                              }
                              size="sm"
                              className="bg-green-600 hover:bg-green-700 text-white"
                            >
                              <Save className="h-3 w-3" />
                            </Button>
                            <Button
                              onClick={() => handleCancelEdit(employee.id)}
                              disabled={
                                saveLoading === employee.id ||
                                deleteLoading === employee.id
                              }
                              size="sm"
                              variant="outline"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ) : (
                          <Button
                            onClick={() => handleEditEmployee(employee.id)}
                            size="sm"
                            variant="outline"
                          >
                            Edit
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Pagination for Employees */}
        {totalEmployeePages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-gray-500">
              Showing {startEmployeeIndex + 1} to{" "}
              {Math.min(endEmployeeIndex, filteredEmployees.length)} of{" "}
              {filteredEmployees.length} employees
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
                {Array.from(
                  { length: totalEmployeePages },
                  (_, i) => i + 1
                ).map((page) => (
                  <Button
                    key={page}
                    variant={
                      currentEmployeePage === page ? "default" : "outline"
                    }
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

      <TabsContent value="pending" className="mt-6">
        {requests.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <p className="text-lg font-semibold text-gray-900">
              No pending approvals
            </p>
            <p className="text-gray-500">All requests have been processed.</p>
          </div>
        ) : (
          <>
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="px-2">Employee</TableHead>
                    <TableHead className="px-2">Department</TableHead>
                    <TableHead className="px-2">Role</TableHead>
                    <TableHead className="px-2">Manager</TableHead>
                    <TableHead className="px-2">Status</TableHead>
                    <TableHead className="px-2">Requested</TableHead>
                    <TableHead className="px-2 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedRequests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell className="px-2">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage
                              src={request.profilePictureUrl || ""}
                            />
                            <AvatarFallback className="text-xs">
                              {getInitials(
                                request.firstName,
                                request.lastName,
                                request.email
                              )}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-sm">
                              {request.firstName} {request.lastName}
                            </p>
                            <p className="text-xs text-gray-500">
                              {request.email}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="px-2 text-sm">
                        {request.department}
                      </TableCell>
                      <TableCell className="px-2">
                        <div className="flex gap-1">
                          <Badge variant="secondary" className="text-xs">
                            {request.role}
                          </Badge>
                          {request.isManager && (
                            <Badge variant="outline" className="text-xs">
                              Manager
                            </Badge>
                          )}
                          {request.isLead && (
                            <Badge variant="outline" className="text-xs">
                              Lead
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="px-2 text-sm">
                        {request.managerEmail || "None"}
                      </TableCell>
                      <TableCell className="px-2">
                        <Badge variant="destructive" className="text-xs">
                          Pending
                        </Badge>
                      </TableCell>
                      <TableCell className="px-2 text-sm">
                        {new Date(request.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="px-2 text-right">
                        {loading === request.id ||
                        rejectLoading === request.id ? (
                          <ActionButtonSkeleton />
                        ) : (
                          <div className="flex gap-1 justify-end">
                            <Button
                              onClick={() => handleApprove(request.id)}
                              disabled={
                                loading === request.id ||
                                rejectLoading === request.id
                              }
                              size="sm"
                              className="bg-green-600 hover:bg-green-700 text-white"
                            >
                              Approve
                            </Button>
                            <Button
                              onClick={() => handleReject(request.id)}
                              disabled={
                                loading === request.id ||
                                rejectLoading === request.id
                              }
                              size="sm"
                              variant="destructive"
                            >
                              Reject
                            </Button>
                          </div>
                        )}
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
                  Showing {startRequestIndex + 1} to{" "}
                  {Math.min(endRequestIndex, requests.length)} of{" "}
                  {requests.length} requests
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
                    {Array.from(
                      { length: totalRequestPages },
                      (_, i) => i + 1
                    ).map((page) => (
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
    </Tabs>
  );
}
