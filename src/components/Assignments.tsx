'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Search, 
  FileText, 
  CheckCircle, 
  Clock, 
  User,
  Building,
  Briefcase,
  Eye
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import ResponseViewerSheet from './ResponseViewerSheet';
import { TableSkeleton } from './layout/TableSkeleton';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

// Assignment type for TypeScript
interface Assignment {
  id: string;
  form: {
    title: string;
    description?: string;
  };
  assignedAt: string;
  evaluationTarget?: {
    type: "MANAGER" | "EMPLOYEE" | "COLLEAGUE" | "LEAD" | "ADMIN";
    targetId: string;
    targetName: string;
    targetRole: string;
    targetDepartment: string;
  };
  // Add response status
  hasResponse?: boolean;
  submittedAt?: string;
}

// Response type for viewing submitted responses
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

const Assignments = () => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [selectedResponse, setSelectedResponse] = useState<Response | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();

  useEffect(() => {
    setLoading(true);
    fetch('/api/assignments')
      .then((res) => res.json())
      .then((data) => {
        setAssignments(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Filter assignments based on search term
  const filteredAssignments = assignments.filter(assignment => {
    const searchLower = searchTerm.toLowerCase();
    const targetName = assignment.evaluationTarget?.targetName || '';
    const targetRole = assignment.evaluationTarget?.targetRole || '';
    const targetDepartment = assignment.evaluationTarget?.targetDepartment || '';
    const formTitle = assignment.form.title || '';
    
    return (
      targetName.toLowerCase().includes(searchLower) ||
      targetRole.toLowerCase().includes(searchLower) ||
      targetDepartment.toLowerCase().includes(searchLower) ||
      formTitle.toLowerCase().includes(searchLower)
    );
  });

  const getStatusBadge = (assignment: Assignment) => {
    if (assignment.hasResponse) {
      return (
        <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100">
          <CheckCircle className="w-3 h-3 mr-1" />
          Completed
        </Badge>
      );
    }
    return (
      <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
        <Clock className="w-3 h-3 mr-1" />
        Pending
      </Badge>
    );
  };

  const getEvaluationTypeIcon = (type?: string) => {
    switch (type) {
      case 'MANAGER':
        return <User className="w-4 h-4" />;
      case 'EMPLOYEE':
        return <User className="w-4 h-4" />;
      case 'LEAD':
        return <Briefcase className="w-4 h-4" />;
      case 'ADMIN':
        return <Building className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const handleViewResponse = async (assignmentId: string) => {
    try {
      // Fetch the response for this assignment
      const response = await fetch(`/api/assignments/${assignmentId}/responses`);
      if (!response.ok) {
        throw new Error('Failed to fetch response');
      }
      const data = await response.json();
      
      if (data && data.id) {
        // Navigate to the response view page with the actual response ID
        router.push(`/assignments/${assignmentId}/responses/${data.id}`);
      } else {
        toast.error('No response found for this assignment');
      }
    } catch (error) {
      console.error('Error fetching response:', error);
      toast.error('Failed to load response');
    }
  };

  const handleCloseResponse = () => {
    setSelectedResponse(null);
  };

  const fetchResponse = async (assignmentId: string): Promise<Response> => {
    const res = await fetch(`/api/assignments/${assignmentId}/responses`);
    if (!res.ok) {
      throw new Error('Failed to fetch response');
    }
    return res.json();
  };




  if (loading) {
    return <TableSkeleton />;
  }

  if (!assignments.length) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No assignments found</h3>
          <p className="text-muted-foreground">You don't have any appraisal forms assigned to you yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row h-screen">
      {/* Left side - Table */}
      <div className={`${selectedResponse ? 'w-full lg:w-1/2' : 'w-full'} transition-all duration-300 border-r lg:border-r border-b lg:border-b-0`}>
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">My Assignments</h2>
            <div className="text-sm text-gray-500">
              {searchTerm ? `${filteredAssignments.length} of ${assignments.length} assignments` : `${assignments.length} assignments`}
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
              placeholder="Search assignments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
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
                <TableHead>Role & Department</TableHead>
                <TableHead>Form Type</TableHead>
                <TableHead>Assigned Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAssignments.map((assignment) => (
                <TableRow key={assignment.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 bg-primary/10 rounded-full">
                        {getEvaluationTypeIcon(assignment.evaluationTarget?.type)}
                      </div>
                      <div>
                        <div className="font-medium">
                          {assignment.evaluationTarget?.targetName || 'Unknown Employee'}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {assignment.evaluationTarget?.type || 'Evaluation'}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium text-sm">
                        {assignment.evaluationTarget?.targetRole || 'N/A'}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {assignment.evaluationTarget?.targetDepartment || 'N/A'}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-[200px]">
                      <div className="font-medium text-sm truncate">
                        {assignment.form.title}
                      </div>
                      {assignment.form.description && (
                        <div className="text-xs text-muted-foreground truncate">
                          {assignment.form.description}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-muted-foreground">
                      {new Date(assignment.assignedAt).toLocaleDateString()}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(assignment.assignedAt).toLocaleTimeString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(assignment)}
                  </TableCell>
                  <TableCell className="text-right">
                        {assignment.hasResponse ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewResponse(assignment.id)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </Button>
                        ) : (
                    <Button
                      asChild
                      size="sm"
                            variant="default"
                    >
                      <Link href={`/assignments/${assignment.id}`}>
                              Fill Out
                      </Link>
                    </Button>
                        )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
            </div>
          )}
        </div>
      </div>

      {/* Right side - Response Detail */}
      {selectedResponse && (
        <ResponseViewerSheet
          isOpen={!!selectedResponse}
          onClose={handleCloseResponse}
          assignmentId={selectedResponse.id}
          fetchResponse={fetchResponse}
          title="Response Details"
        />
      )}
    </div>
  );
};

export default Assignments;