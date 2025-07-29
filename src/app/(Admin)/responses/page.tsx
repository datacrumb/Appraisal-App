'use client';
import React, { useEffect, useState, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { Eye, Search } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import ResponseViewerSheet from "@/components/ResponseViewerSheet";

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
      questions: any;
    };
  };
}

const AdminResponsesPage = () => {
  const [responses, setResponses] = useState<Response[]>([]);
  const [selectedResponse, setSelectedResponse] = useState<Response | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    setLoading(true);
    fetch('/api/responses')
      .then((res) => res.json())
      .then((data) => {
        setResponses(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleViewResponse = async (responseId: string) => {
    setSelectedResponse({ id: responseId } as Response);
  };

  const handleCloseResponse = () => {
    setSelectedResponse(null);
  };

  const fetchResponse = async (responseId: string): Promise<Response> => {
    const res = await fetch(`/api/responses/${responseId}`);
    if (!res.ok) {
      throw new Error('Failed to fetch response');
    }
    return res.json();
  };

  // Skeleton component for table loading
  const TableSkeleton = () => (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead><Skeleton className="h-4 w-20" /></TableHead>
            <TableHead><Skeleton className="h-4 w-16" /></TableHead>
            <TableHead><Skeleton className="h-4 w-24" /></TableHead>
            <TableHead className="text-right"><Skeleton className="h-4 w-16 ml-auto" /></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
            <TableRow key={i}>
              <TableCell><Skeleton className="h-4 w-32" /></TableCell>
              <TableCell><Skeleton className="h-4 w-40" /></TableCell>
              <TableCell><Skeleton className="h-4 w-24" /></TableCell>
              <TableCell className="text-right"><Skeleton className="h-8 w-16 ml-auto" /></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );



  // Filter responses based on search term
  const filteredResponses = useMemo(() => {
    if (!searchTerm.trim()) return responses;

    return responses.filter(response => {
      const employeeName = response.assignment.employeeName || response.assignment.employeeEmail || '';
      const formTitle = response.assignment.form.title || '';
      const searchLower = searchTerm.toLowerCase();

      return (
        employeeName.toLowerCase().includes(searchLower) ||
        formTitle.toLowerCase().includes(searchLower) ||
        response.assignment.employeeEmail.toLowerCase().includes(searchLower)
      );
    });
  }, [responses, searchTerm]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredResponses.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentResponses = filteredResponses.slice(startIndex, endIndex);

  // Reset to first page when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (loading) return (
    <div className="flex flex-col lg:flex-row h-screen">
      <div className="w-full lg:w-1/2 p-6">
        <div className="flex justify-between items-center mb-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-24" />
        </div>
        <div className="mb-4">
          <Skeleton className="h-10 w-full" />
        </div>
        <TableSkeleton />
      </div>
    </div>
  );
  if (!responses.length) return <div className="flex justify-center items-center h-64">No responses found.</div>;
  if (searchTerm && !filteredResponses.length) return (
    <div className="flex justify-center items-center h-64">
      <div className="text-center">
        <p className="text-lg font-medium text-gray-900 mb-2">No responses found</p>
        <p className="text-gray-500">Try adjusting your search terms</p>
        <Button
          variant="outline"
          onClick={() => setSearchTerm('')}
          className="mt-4"
        >
          Clear Search
        </Button>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col lg:flex-row h-screen">
      {/* Left side - Table */}
      <div className={`${selectedResponse ? 'w-full lg:w-1/2' : 'w-full'} transition-all duration-300 border-r lg:border-r border-b lg:border-b-0`}>
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Employee Responses</h2>
            <div className="text-sm text-gray-500">
              {searchTerm ? `${filteredResponses.length} of ${responses.length} responses` : `${responses.length} responses`}
            </div>
          </div>

          {/* Search Bar */}
          <div className="mb-4">
            {loading ? (
              <Skeleton className="h-10 w-full" />
            ) : (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by employee name, email, or form title..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            )}
          </div>

          {loading ? (
            <TableSkeleton />
          ) : (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Form</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentResponses.map((response) => (
                    <TableRow key={response.id}>
                      <TableCell className="font-medium flex items-center gap-2">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={response.assignment.employeeProfilePictureUrl || undefined} />
                            <AvatarFallback className="text-xs">
                              {response.assignment.employeeName?.charAt(0) || response.assignment.employeeEmail?.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-sm">
                              {response.assignment.employeeName}
                            </p>
                            <p className="text-xs text-gray-500">{response.assignment.employeeEmail}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{response.assignment.form.title}</TableCell>
                      <TableCell>
                        {new Date(response.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewResponse(response.id)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-4">
              <div className="text-sm text-gray-500 mb-4 text-center">
                Showing {startIndex + 1} to {Math.min(endIndex, filteredResponses.length)} of {filteredResponses.length} results
              </div>
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (currentPage > 1) handlePageChange(currentPage - 1);
                      }}
                      className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>

                  {(() => {
                    const pages = [];
                    const maxVisiblePages = 5;

                    if (totalPages <= maxVisiblePages) {
                      // Show all pages if total is small
                      for (let i = 1; i <= totalPages; i++) {
                        pages.push(i);
                      }
                    } else {
                      // Show limited pages with ellipsis
                      if (currentPage <= 3) {
                        // Show first 3 pages + ellipsis + last page
                        for (let i = 1; i <= 3; i++) {
                          pages.push(i);
                        }
                        pages.push('...');
                        pages.push(totalPages);
                      } else if (currentPage >= totalPages - 2) {
                        // Show first page + ellipsis + last 3 pages
                        pages.push(1);
                        pages.push('...');
                        for (let i = totalPages - 2; i <= totalPages; i++) {
                          pages.push(i);
                        }
                      } else {
                        // Show first page + ellipsis + current-1, current, current+1 + ellipsis + last page
                        pages.push(1);
                        pages.push('...');
                        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
                          pages.push(i);
                        }
                        pages.push('...');
                        pages.push(totalPages);
                      }
                    }

                    return pages.map((page, index) => (
                      <PaginationItem key={index}>
                        {page === '...' ? (
                          <PaginationEllipsis />
                        ) : (
                          <PaginationLink
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              handlePageChange(page as number);
                            }}
                            isActive={currentPage === page}
                          >
                            {page}
                          </PaginationLink>
                        )}
                      </PaginationItem>
                    ));
                  })()}

                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (currentPage < totalPages) handlePageChange(currentPage + 1);
                      }}
                      className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </div>
      </div>

      {/* Right side - Response Detail */}
      {selectedResponse && (
        <ResponseViewerSheet
          isOpen={!!selectedResponse}
          onClose={handleCloseResponse}
          responseId={selectedResponse.id}
          fetchResponse={fetchResponse}
          title="Response Details"
        />
      )}
    </div>
  );
};

export default AdminResponsesPage;