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
  Briefcase
} from 'lucide-react';

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

const Assignments = () => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading assignments...</p>
        </div>
      </div>
    );
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
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Assignments</h1>
          <p className="text-muted-foreground">
            Review and complete your assigned appraisal forms
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search assignments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 w-[200px] sm:w-[300px]"
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          <h2 className="text-xl font-semibold">Assigned Forms ({filteredAssignments.length})</h2>
        </div>
        <div className="rounded-md border">
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
                    <Button
                      asChild
                      size="sm"
                      variant={assignment.hasResponse ? "outline" : "default"}
                    >
                      <Link href={`/assignments/${assignment.id}`}>
                        {assignment.hasResponse ? 'View' : 'Fill Out'}
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default Assignments;