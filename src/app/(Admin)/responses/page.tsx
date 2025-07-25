'use client';
import React, { useEffect, useState, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Eye, X, Search } from "lucide-react";

interface Response {
  id: string;
  createdAt: string;
  answers: Record<string, any>;
  assignment: {
    employeeEmail: string;
    employeeName?: string;
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
  const [responseLoading, setResponseLoading] = useState(false);
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
    // Create a placeholder response to keep the sheet open
    const placeholderResponse: Response = {
      id: responseId,
      createdAt: new Date().toISOString(),
      answers: {},
      assignment: {
        employeeEmail: 'Loading...',
        employeeName: 'Loading...',
        form: {
          title: 'Loading...',
          questions: []
        }
      }
    };
    
    // Show placeholder immediately to open the sheet
    setSelectedResponse(placeholderResponse);
    setResponseLoading(true);
    
    try {
      const res = await fetch(`/api/responses/${responseId}`);
      const data = await res.json();
      setSelectedResponse(data);
    } catch (error) {
      console.error('Failed to fetch response:', error);
    } finally {
      setResponseLoading(false);
    }
  };

  const handleCloseResponse = () => {
    setSelectedResponse(null);
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
                      <TableCell className="font-medium">
                        {response.assignment.employeeName || response.assignment.employeeEmail}
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
                          disabled={responseLoading}
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
        <div className="w-full lg:w-1/2 p-6 overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold">Response Details</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCloseResponse}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          {responseLoading ? (
            <ResponseDetailSkeleton />
          ) : (
          
          <Card>
            <CardHeader>
              <CardTitle>{selectedResponse.assignment.form.title}</CardTitle>
              <div className="text-sm text-muted-foreground">
                Employee: {selectedResponse.assignment.employeeName || selectedResponse.assignment.employeeEmail}
              </div>
              <div className="text-xs text-gray-500">
                Submitted: {new Date(selectedResponse.createdAt).toLocaleString()}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Array.isArray(selectedResponse.assignment.form.questions) 
                  ? selectedResponse.assignment.form.questions.map((q: any, idx: number) => (
                      <div key={idx} className="border-b pb-4 last:border-b-0">
                        <div className="font-medium text-sm text-gray-700 mb-2">
                          {idx + 1}. {q.label}
                        </div>
                        <div className="text-sm text-gray-900 bg-gray-50 p-3 rounded-md whitespace-pre-line">
                          {selectedResponse.answers[`q${idx + 1}`] || (
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
          )}
        </div>
      )}
    </div>
  );
};

export default AdminResponsesPage;