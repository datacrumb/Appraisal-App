"use client";

import React, { useState, useEffect } from "react";
import ReactFlow, {
  Background,
  Controls,
  type Node,
  type Edge,
  Position,
} from "reactflow";
import dagre from "dagre";
import "reactflow/dist/style.css";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { RefreshCw, FileText, CheckCircle, XCircle, Search, X } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import { useUser } from "@clerk/nextjs";

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

interface Relation {
  id: string;
  fromId: string;
  toId: string;
  type: string;
  from: Employee;
  to: Employee;
}

// Helper to get initials from name or email
function getInitials(firstName: string | null, lastName: string | null, email: string) {
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
}

// Helper to get Clerk profile picture URL
function getProfilePictureUrl(employee: Employee) {
  return employee.profilePictureUrl || null;
}

// Department color mapping
const departmentColors: Record<string, { border: string; background: string; iconBg: string }> = {
  'Human Resource': { border: '#8B5CF6', background: '#8B5CF6', iconBg: '#7C3AED' },
  'Business Development': { border: '#F59E0B', background: '#F59E0B', iconBg: '#D97706' },
  'Projects': { border: '#10B981', background: '#10B981', iconBg: '#059669' },
  'Proposals': { border: '#3B82F6', background: '#3B82F6', iconBg: '#2563EB' },
  'Planning': { border: '#EF4444', background: '#EF4444', iconBg: '#DC2626' },
  'HSE': { border: '#06B6D4', background: '#06B6D4', iconBg: '#0891B2' },
  'Quality': { border: '#84CC16', background: '#84CC16', iconBg: '#65A30D' },
  'Procurement': { border: '#F97316', background: '#F97316', iconBg: '#EA580C' },
  'Accounts': { border: '#EC4899', background: '#EC4899', iconBg: '#DB2777' },
  'Taxation': { border: '#6366F1', background: '#6366F1', iconBg: '#4F46E5' },
  'Executive': { border: '#0070f3', background: '#0070f3', iconBg: '#0051a2' },
  'Unknown': { border: '#6B7280', background: '#6B7280', iconBg: '#4B5563' },
};

// Get department color
function getDepartmentColor(department: string | null) {
  const dept = department || 'Unknown';
  return departmentColors[dept] || departmentColors['Unknown'];
}

const nodeWidth = 160;
const nodeHeight = 140;

// Re-introduce dagre for robust hierarchical layout with groups
function getLayoutedElements(nodes: Node[], edges: Edge[], direction = "TB") {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  const isHorizontal = direction === "LR";
  dagreGraph.setGraph({
    rankdir: direction,
    ranksep: 150,
    nodesep: 100,
    edgesep: 50,
    marginx: 50,
    marginy: 50,
  });

  // Add nodes to the graph
  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  // Add edges to the graph
  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  // Calculate the layout
  dagre.layout(dagreGraph);

  // Apply the calculated positions to the nodes
  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    return {
      ...node,
      targetPosition: isHorizontal ? Position.Left : Position.Top,
      sourcePosition: isHorizontal ? Position.Right : Position.Bottom,
      position: {
        x: nodeWithPosition.x - nodeWidth / 2,
        y: nodeWithPosition.y - nodeHeight / 2,
      },
    };
  });

  return { nodes: layoutedNodes, edges };
}

export default function EmployeeHierarchyFlow() {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; label: string } | null>(null);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);
  const [assigningForms, setAssigningForms] = useState(false);
  const [assignmentSuccess, setAssignmentSuccess] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<string[]>([]);
  const [highlightedNode, setHighlightedNode] = useState<string | null>(null);
  const { user } = useUser();

  // Function to trigger form assignments
  const triggerFormAssignment = async () => {
    setAssigningForms(true);
    setAssignmentSuccess(false);
    setError(null);

    try {
      const response = await fetch("/api/forms/auto-assign", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to assign forms");
      }

      setAssignmentSuccess(true);

      // Reset success message after 5 seconds
      setTimeout(() => {
        setAssignmentSuccess(false);
      }, 5000);

    } catch (error: any) {
      console.error("Form assignment failed:", error);
      setError(error.message || "Failed to assign forms. Please try again.");

      // Reset error after 5 seconds
      setTimeout(() => {
        setError(null);
      }, 5000);
    } finally {
      setAssigningForms(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch hierarchy data from new database-based endpoint
        const hierarchyRes = await fetch("/api/employees/hierarchy");
        if (!hierarchyRes.ok) throw new Error("Failed to fetch hierarchy data");
        const hierarchyData = await hierarchyRes.json();

        const employees: Employee[] = hierarchyData.employees || [];
        const relations: Relation[] = hierarchyData.relations || [];
        const adminId: string = hierarchyData.adminId;

        if (!adminId) throw new Error("No admin found");

        // Build role map based on employee properties and relations
        const roleMap: Record<string, string> = {};

        // Assign roles based on employee properties
        employees.forEach(emp => {
          if (emp.isManager) {
            roleMap[emp.id] = "MANAGER";
          } else if (emp.isLead) {
            roleMap[emp.id] = "EXECUTIVE";
          } else {
            roleMap[emp.id] = "EMPLOYEE";
          }
        });

        // Admin gets highest priority
        roleMap[adminId] = "ADMIN";

        // Find Executive department employees
        const executiveEmployees = employees.filter(emp => emp.department === 'Executive');

        // Map employees to nodes (without manual positioning)
        const nodes: Node[] = employees.map((emp) => {
          const role = roleMap[emp.id] || "EMPLOYEE";
          let border, background, fontWeight, iconBg, textColor;
          if (role === "ADMIN") {
            border = "3px solid #0070f3";
            background = "#0070f3";
            fontWeight = "bold";
            iconBg = "#0051a2";
            textColor = "#ffffff";
          } else if (role === "MANAGER") {
            border = "2px solid #f59e42";
            background = "#f59e42";
            iconBg = "#d97706";
            textColor = "#ffffff";
          } else if (role === "EXECUTIVE") {
            border = "2px solid #42a5f5";
            background = "#42a5f5";
            iconBg = "#1976d2";
            textColor = "#ffffff";
          } else {
            border = "1px solid #10b981";
            background = "#10b981";
            iconBg = "#059669";
            textColor = "#ffffff";
          }

          const fullName = emp.firstName && emp.lastName
            ? `${emp.firstName} ${emp.lastName}`
            : emp.email;

          return {
            id: emp.id,
            data: {
              label: (
                <div style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 8,
                  padding: "12px 8px",
                  textAlign: "center"
                }}>
                  <Avatar className="w-28 h-28 rounded-lg">
                    <AvatarImage
                      src={getProfilePictureUrl(emp) || undefined}
                      alt={`${emp.firstName || ''} ${emp.lastName || ''}`.trim() || emp.email}
                    />
                    <AvatarFallback
                      className="text-white font-bold text-xl rounded-lg"
                      style={{ backgroundColor: iconBg }}
                    >
                      {getInitials(emp.firstName, emp.lastName, emp.email)}
                    </AvatarFallback>
                  </Avatar>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <span style={{
                      fontWeight: "bold",
                      fontSize: "14px",
                      color: textColor,
                      marginBottom: "2px"
                    }}>
                      {fullName}
                    </span>
                    <span style={{
                      fontSize: "12px",
                      color: textColor,
                      fontWeight: "500"
                    }}>
                      {role}
                    </span>
                  </div>
                </div>
              ),
            },
            position: { x: 0, y: 0 }, // Will be calculated by dagre
            style: {
              border,
              background,
              minWidth: 160,
              minHeight: 140,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight,
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              borderRadius: 12,
              cursor: "pointer",
              transition: "border 0.2s, background 0.2s, box-shadow 0.2s",
              padding: 0,
            },
          };
        });

        // Create edges based on new hierarchy: ADMIN → MANAGER → EXECUTIVE → EMPLOYEE
        const edges: Edge[] = [];
        
        // 1. Connect Executive department employees to all other departments
        if (executiveEmployees.length > 0) {
          // Get all non-Executive employees
          const nonExecutiveEmployees = employees.filter(emp => emp.department !== 'Executive');
          
          // Connect each Executive employee to all other departments
          executiveEmployees.forEach((executive) => {
            nonExecutiveEmployees.forEach((employee) => {
              edges.push({
                id: `executive-${executive.id}-${employee.id}`,
                source: executive.id,
                target: employee.id,
                animated: true,
                style: {
                  stroke: getDepartmentColor(employee.department).background,
                  strokeWidth: 2,
                  strokeDasharray: "5,5",
                },
              });
            });
          });
        }
        
        // 2. Create hierarchy edges based on roles
        relations.forEach((rel) => {
          const sourceRole = roleMap[rel.fromId] || "EMPLOYEE";
          const targetRole = roleMap[rel.toId] || "EMPLOYEE";
          
          // Only create edges that follow the hierarchy: ADMIN → MANAGER → EXECUTIVE → EMPLOYEE
          const roleHierarchy = { "ADMIN": 4, "MANAGER": 3, "EXECUTIVE": 2, "EMPLOYEE": 1 };
          const sourceLevel = roleHierarchy[sourceRole as keyof typeof roleHierarchy] || 1;
          const targetLevel = roleHierarchy[targetRole as keyof typeof roleHierarchy] || 1;
          
          // Only connect if source is higher in hierarchy than target
          if (sourceLevel > targetLevel) {
            let stroke, strokeDasharray;
            
            // Use department color for the edge
            const sourceEmployee = employees.find(emp => emp.id === rel.fromId);
            const sourceDept = sourceEmployee?.department || 'Unknown';
            stroke = getDepartmentColor(sourceDept).background;
            
            // Visual distinction for different relation types
            if (rel.type === "MANAGER") {
              strokeDasharray = undefined; // Solid line
            } else if (rel.type === "EXECUTIVE") {
              strokeDasharray = "5,5"; // Dashed line
            } else {
              strokeDasharray = "2,4"; // Dotted line
            }
            
            edges.push({
              id: rel.id,
              source: rel.fromId,
              target: rel.toId,
              animated: rel.type === "MANAGER" || rel.type === "EXECUTIVE",
              style: {
                stroke,
                strokeDasharray,
                strokeWidth: 3,
              },
            });
          }
        });

        // Apply automatic layout using dagre
        const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(nodes, edges);
        setNodes(layoutedNodes);
        setEdges(layoutedEdges);

      } catch (e: any) {
        setError(e.message || "Unknown error");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Auto-recalculate layout when nodes or edges change significantly
  useEffect(() => {
    if (nodes.length > 0 && edges.length > 0 && reactFlowInstance) {
      // Only recalculate if we have a significant change (e.g., new nodes/edges)
      const timeoutId = setTimeout(() => {
        reactFlowInstance.fitView({ padding: 0.1 });
      }, 100);
      return () => clearTimeout(timeoutId);
    }
  }, [nodes.length, edges.length, reactFlowInstance]);

  // Update node styles when highlighting changes
  useEffect(() => {
    if (nodes.length > 0) {
      setNodes(prevNodes => 
        prevNodes.map(node => {
          const role = node.data?.label?.props?.children?.[1]?.props?.children?.[1]?.props?.children || "EMPLOYEE";
          let border, background, boxShadow;
          
          // Get base styling based on role
          if (role === "ADMIN") {
            border = "3px solid #0070f3";
            background = "#0070f3";
          } else if (role === "MANAGER") {
            border = "2px solid #f59e42";
            background = "#f59e42";
          } else if (role === "LEAD") {
            border = "2px solid #42a5f5";
            background = "#42a5f5";
          } else if (role === "COLLEAGUE") {
            border = "2px solid #6366f1";
            background = "#6366f1";
          } else {
            border = "1px solid #10b981";
            background = "#10b981";
          }

          // Apply highlighting
          if (highlightedNode === node.id) {
            border = "4px solid #ff6b6b";
            boxShadow = "0 0 0 4px #ff6b6b, 0 8px 25px rgba(255, 107, 107, 0.3)";
            // Darken background for highlighted nodes
            if (role === "ADMIN") {
              background = "#0051a2";
            } else if (role === "MANAGER") {
              background = "#d97706";
            } else if (role === "LEAD") {
              background = "#1976d2";
            } else if (role === "COLLEAGUE") {
              background = "#4f46e5";
            } else {
              background = "#059669";
            }
          } else if (selectedNode === node.id) {
            border = "3px solid #ffffff";
            boxShadow = "0 4px 12px rgba(0,0,0,0.15)";
            // Darken background for selected nodes
            if (role === "ADMIN") {
              background = "#0051a2";
            } else if (role === "MANAGER") {
              background = "#d97706";
            } else if (role === "LEAD") {
              background = "#1976d2";
            } else if (role === "COLLEAGUE") {
              background = "#4f46e5";
            } else {
              background = "#059669";
            }
          } else if (hoveredNode === node.id) {
            border = "3px solid #ffffff";
            boxShadow = "0 4px 12px rgba(0,0,0,0.15)";
            // Darken background for hovered nodes
            if (role === "ADMIN") {
              background = "#0051a2";
            } else if (role === "MANAGER") {
              background = "#d97706";
            } else if (role === "LEAD") {
              background = "#1976d2";
            } else if (role === "COLLEAGUE") {
              background = "#4f46e5";
            } else {
              background = "#059669";
            }
          } else {
            boxShadow = "0 4px 12px rgba(0,0,0,0.15)";
          }

          return {
            ...node,
            style: {
              ...node.style,
              border,
              background,
              boxShadow,
            },
          };
        })
      );
    }
  }, [highlightedNode, selectedNode, nodes.length]);

  // Tooltip logic
  const handleNodeMouseEnter = (event: React.MouseEvent, node: Node) => {
    setHoveredNode(node.id);
    const rect = (event.target as HTMLElement).getBoundingClientRect();
    setTooltip({
      x: rect.left + rect.width / 2,
      y: rect.top - 8,
      label: node.data?.label?.props?.children?.[1]?.props?.children?.[0]?.props?.children || node.id,
    });
  };
  const handleNodeMouseLeave = () => {
    setHoveredNode(null);
    setTooltip(null);
  };
  const handleNodeClick = (_: React.MouseEvent, node: Node) => {
    setSelectedNode(node.id === selectedNode ? null : node.id);
  };

  const admin = user?.publicMetadata?.role === "admin";

  // Search functionality
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchResults([]);
      setHighlightedNode(null);
      return;
    }

    const results = nodes
      .filter(node => {
        const fullName = node.data?.label?.props?.children?.[1]?.props?.children?.[0]?.props?.children || "";
        return fullName.toLowerCase().startsWith(query.toLowerCase());
      })
      .map(node => node.id);

    setSearchResults(results);
    
    if (results.length > 0) {
      setHighlightedNode(results[0]);
      // Zoom to the first result
      setTimeout(() => {
        if (reactFlowInstance) {
          reactFlowInstance.fitView({
            nodes: [{ id: results[0] }],
            padding: 0.2,
            duration: 800
          });
        }
      }, 100);
    } else {
      setHighlightedNode(null);
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
    setHighlightedNode(null);
  };

  // Skeleton component for hierarchy loading
  const HierarchySkeleton = () => (
    <div style={{ width: "100%", height: "90vh", position: "relative" }}>
      <div className="flex items-center justify-center h-full">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="grid grid-cols-3 gap-8 mb-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex flex-col items-center space-y-2">
                  <Skeleton className="w-28 h-28 rounded-lg" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-16" />
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-center">
            <div className="grid grid-cols-5 gap-6">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex flex-col items-center space-y-2">
                  <Skeleton className="w-20 h-20 rounded-lg" />
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-2 w-12" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) return <HierarchySkeleton />;
  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <div style={{ width: "100%", height: "90vh", position: "relative" }}>
      {tooltip && (
        <div
          style={{
            position: "fixed",
            left: tooltip.x,
            top: tooltip.y,
            background: "#fff",
            border: "1px solid #ccc",
            borderRadius: 6,
            padding: "6px 12px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
            zIndex: 1000,
            pointerEvents: "none",
            fontSize: 14,
          }}
        >
          {tooltip.label}
        </div>
      )}
      <ReactFlow
        nodes={nodes}
        edges={edges}
        fitView
        onNodeMouseEnter={handleNodeMouseEnter}
        onNodeMouseLeave={handleNodeMouseLeave}
        onNodeClick={handleNodeClick}
        onInit={setReactFlowInstance}
        panOnScroll
        zoomOnScroll
        panOnDrag
        proOptions={{ hideAttribution: true }}
        style={{ background: "#f3f6fa" }}
      >

        <Controls />
        <Background />
        {/* Search Bar */}
        <div className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-white rounded-lg shadow-lg border border-gray-200 px-3">
          <Search className="h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search employees..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-48 h-8 border-0 focus:ring-0 focus:outline-none text-sm"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearSearch}
              className="h-6 w-6 p-0 hover:bg-gray-100"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>

        {/* Auto-Assign Forms Button */}
        {admin && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="default"
                  size="sm"
                  onClick={triggerFormAssignment}
                  disabled={assigningForms}
                  className="absolute top-4 right-4 z-10 bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
                >
                  {assigningForms ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : assignmentSuccess ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <FileText className="h-4 w-4" />
                  )}
                  <span className="ml-2 font-medium">
                    {assigningForms ? "Assigning..." : assignmentSuccess ? "Assigned!" : "Auto-Assign Forms"}
                  </span>
                </Button>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs bg-cyan-700">
                <div className="space-y-2">
                  <p className="font-medium">Auto-Assign Forms</p>
                  <p className="text-sm text-gray-200">
                    Automatically assigns Manager forms to managers and Employee forms to their direct reports based on the hierarchy.
                  </p>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}

        {/* Search Results Indicator */}
        {searchResults.length > 0 && (
          <div className="absolute top-16 left-4 z-10 bg-white rounded-lg shadow-lg border border-gray-200 px-3 py-2">
            <div className="flex items-center gap-2 text-sm">
              <Search className="h-4 w-4 text-blue-500" />
              <span className="text-gray-600">
                Found {searchResults.length} result{searchResults.length > 1 ? 's' : ''}
              </span>
              {searchResults.length > 1 && (
                <div className="flex gap-1 items-center justify-center">
                  {searchResults.slice(0, 3).map((resultId, index) => (
                    <Button
                      key={resultId}
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setHighlightedNode(resultId);
                        if (reactFlowInstance) {
                          reactFlowInstance.fitView({
                            nodes: [{ id: resultId }],
                            padding: 0.2,
                            duration: 800
                          });
                        }
                      }}
                      className={`h-6 px-2 text-xs ${
                        highlightedNode === resultId 
                          ? 'bg-blue-100 text-blue-700' 
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {index + 1}
                    </Button>
                  ))}
                  {searchResults.length > 3 && (
                    <span className="text-xs text-gray-400">+{searchResults.length - 3}</span>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      {/* Success Message */}
      {assignmentSuccess && (
        <div className="absolute top-16 right-4 z-10 bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded-md shadow-lg max-w-sm">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            <div>
              <p className="font-medium">Forms Assigned Successfully!</p>
              <p className="text-sm">Managers and employees can now access their forms in the Assignments section.</p>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="absolute top-16 right-4 z-10 bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded-md shadow-lg max-w-sm">
          <div className="flex items-center gap-2">
            <XCircle className="h-4 w-4" />
            <div>
              <p className="font-medium">Assignment Failed</p>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        </div>
      )}
    </ReactFlow>
    </div >
  );
}
