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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

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
    // Use larger dimensions for executive department box node
    if (node.id === 'executive-department-box') {
      dagreGraph.setNode(node.id, { width: 320, height: 280 });
    } else {
      dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
    }
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
    const isExecutiveBox = node.id === 'executive-department-box';
    const width = isExecutiveBox ? 320 : nodeWidth;
    const height = isExecutiveBox ? 280 : nodeHeight;

    return {
      ...node,
      targetPosition: isHorizontal ? Position.Left : Position.Top,
      sourcePosition: isHorizontal ? Position.Right : Position.Bottom,
      position: {
        x: nodeWithPosition.x - width / 2,
        y: nodeWithPosition.y - height / 2,
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

        // Find Executive department employees (CEOs, Technical Directors, etc.)
        const executiveDepartmentEmployees = employees.filter(emp => emp.department === 'Executive');

        // Map employees to nodes (excluding Executive department employees and ensuring they're not shown individually)
        const nodes: Node[] = employees
          .filter(emp => emp.department !== 'Executive') // Exclude Executive department employees from individual nodes
          .map((emp) => {
            const role = roleMap[emp.id] || "EMPLOYEE";
            const deptColor = getDepartmentColor(emp.department);
            let border, background, fontWeight, iconBg, textColor;

            // Use department colors for all nodes
            border = `2px solid ${deptColor.border}`;
            background = deptColor.background;
            iconBg = deptColor.iconBg;
            textColor = "#ffffff";

            // Special styling for admin role
            if (role === "ADMIN") {
              border = "3px solid #0070f3";
              background = "#0070f3";
              fontWeight = "bold";
              iconBg = "#0051a2";
            } else {
              fontWeight = "normal";
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
                 department: emp.department, // Store department info
                 role: role, // Store role info
                 fullName: fullName, // Store full name for search
                 employee: emp, // Store the full employee object for debugging
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

        // Create edges based on hierarchy: Executive Department Box → Manager → Executive Role → Employee
        const edges: Edge[] = [];

        // Get all employees by role
        const managerEmployees = employees.filter(emp => roleMap[emp.id] === "MANAGER");
        const executiveRoleEmployees = employees.filter(emp =>
          emp.isLead && emp.department !== 'Executive'
        );
        const employeeRoleEmployees = employees.filter(emp =>
          roleMap[emp.id] === "EMPLOYEE" && emp.department !== 'Executive'
        );

        // 1. Connect Executive Department Box to Managers
        if (executiveDepartmentEmployees.length > 0 && managerEmployees.length > 0) {
          managerEmployees.forEach((manager) => {
            edges.push({
              id: `executive-box-to-manager-${manager.id}`,
              source: 'executive-department-box',
              target: manager.id,
              animated: true,
              style: {
                stroke: "#0070f3",
                strokeWidth: 3,
                strokeDasharray: "5,5",
              },
            });
          });
        }

        // 2. Connect Managers to Executive roles
        managerEmployees.forEach((manager) => {
          // Find executives that report to this manager
          const managerRelations = relations.filter(rel =>
            rel.fromId === manager.id && rel.type === "EXECUTIVE"
          );

          managerRelations.forEach((rel) => {
            const executive = employees.find(emp => emp.id === rel.toId);
            if (executive && executive.department !== 'Executive') {
              edges.push({
                id: `manager-to-executive-${manager.id}-${executive.id}`,
                source: manager.id,
                target: executive.id,
                animated: true,
                style: {
                  stroke: getDepartmentColor(executive.department).background,
                  strokeWidth: 2,
                  strokeDasharray: "3,3",
                },
              });
            }
          });
        });

        // 3. Connect Executive roles to Employee roles
        executiveRoleEmployees.forEach((executive) => {
          // Find employees that report to this executive
          const executiveRelations = relations.filter(rel =>
            rel.fromId === executive.id && rel.type === "EXECUTIVE"
          );

          executiveRelations.forEach((rel) => {
            const employee = employees.find(emp => emp.id === rel.toId);
            if (employee && employee.department !== 'Executive') {
              edges.push({
                id: `executive-to-employee-${executive.id}-${employee.id}`,
                source: executive.id,
                target: employee.id,
                animated: true,
                style: {
                  stroke: getDepartmentColor(employee.department).background,
                  strokeWidth: 2,
                  strokeDasharray: "2,4",
                },
              });
            }
          });
        });

        // 3b. Also connect employees to executives based on relations where employee is the target
        employeeRoleEmployees.forEach((employee) => {
          // Find executives that this employee reports to
          const employeeRelations = relations.filter(rel =>
            rel.toId === employee.id && rel.type === "EXECUTIVE"
          );

          employeeRelations.forEach((rel) => {
            const executive = employees.find(emp => emp.id === rel.fromId);
            if (executive && executive.department !== 'Executive' && executive.isLead) {
              edges.push({
                id: `executive-to-employee-${executive.id}-${employee.id}`,
                source: executive.id,
                target: employee.id,
                animated: true,
                style: {
                  stroke: getDepartmentColor(employee.department).background,
                  strokeWidth: 2,
                  strokeDasharray: "2,4",
                },
              });
            }
          });
        });

        // 4. Connect employees without managers or executives directly to Executive Department Box
        const employeesWithoutSupervisor = employees.filter(emp => {
          if (emp.department === 'Executive' || roleMap[emp.id] === "MANAGER" || roleMap[emp.id] === "EXECUTIVE") return false;

          // Check if this employee has any manager or executive relation
          const hasManager = relations.some(rel => rel.toId === emp.id && rel.type === "MANAGER");
          const hasExecutive = relations.some(rel => rel.toId === emp.id && rel.type === "EXECUTIVE");

          return !hasManager && !hasExecutive;
        });

        if (executiveDepartmentEmployees.length > 0) {
          employeesWithoutSupervisor.forEach((employee) => {
            edges.push({
              id: `executive-box-to-employee-${employee.id}`,
              source: 'executive-department-box',
              target: employee.id,
              animated: true,
              style: {
                stroke: "#0070f3",
                strokeWidth: 2,
                strokeDasharray: "3,3",
              },
            });
          });
        }

        // 5. Connect executives without managers directly to Executive Department Box
        const executivesWithoutManager = executiveRoleEmployees.filter(executive => {
          const hasManager = relations.some(rel => rel.toId === executive.id && rel.type === "MANAGER");
          return !hasManager;
        });

        if (executiveDepartmentEmployees.length > 0) {
          executivesWithoutManager.forEach((executive) => {
            edges.push({
              id: `executive-box-to-executive-${executive.id}`,
              source: 'executive-department-box',
              target: executive.id,
              animated: true,
              style: {
                stroke: "#0070f3",
                strokeWidth: 2,
                strokeDasharray: "3,3",
              },
            });
          });
        }

        // 6. Create general hierarchy edges based on relations (fallback for any missed connections)
        relations.forEach((rel) => {
          const sourceEmployee = employees.find(emp => emp.id === rel.fromId);
          const targetEmployee = employees.find(emp => emp.id === rel.toId);

          if (!sourceEmployee || !targetEmployee) return;

          // Skip if either employee is in Executive department (handled by Executive box)
          if (sourceEmployee.department === 'Executive' || targetEmployee.department === 'Executive') return;

          // Skip if this edge already exists
          const edgeExists = edges.some(edge =>
            edge.source === rel.fromId && edge.target === rel.toId
          );

          if (edgeExists) return;

          // Create edge based on relation type
          let stroke, strokeDasharray;

          if (rel.type === "MANAGER") {
            stroke = "#f59e42"; // Manager color
            strokeDasharray = undefined; // Solid line
          } else if (rel.type === "EXECUTIVE") {
            stroke = getDepartmentColor(targetEmployee.department).background;
            strokeDasharray = "3,3"; // Dashed line
          } else {
            stroke = getDepartmentColor(targetEmployee.department).background;
            strokeDasharray = "2,4"; // Dotted line
          }

          edges.push({
            id: `relation-${rel.id}`,
            source: rel.fromId,
            target: rel.toId,
            animated: true,
            style: {
              stroke,
              strokeWidth: 2,
              strokeDasharray,
            },
          });
        });

        // Create Executive department box node with individual executive nodes inside
        const executiveBoxNode: Node = {
          id: 'executive-department-box',
          position: { x: 0, y: 0 }, // Will be calculated by dagre
          data: {
            label: (
              <div style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 16,
                padding: "20px 16px",
                textAlign: "center",
                width: "100%",
                height: "100%"
              }}>
                <div style={{
                  fontWeight: "bold",
                  fontSize: "18px",
                  color: "#0070f3",
                  marginBottom: "12px"
                }}>
                  Executive Department
                </div>
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
                  gap: "16px",
                  width: "100%",
                  maxHeight: "160px",
                  overflowY: "auto"
                }}>
                  {executiveDepartmentEmployees.map((executive: Employee) => {
                    const fullName = executive.firstName && executive.lastName
                      ? `${executive.firstName} ${executive.lastName}`
                      : executive.email;

                    return (
                      <div key={executive.id} style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 6,
                        padding: "8px",
                        borderRadius: "8px",
                        backgroundColor: "#0070f3",
                        minWidth: "100px"
                      }}>
                        <Avatar className="w-20 h-20 rounded-lg">
                          <AvatarImage
                            src={getProfilePictureUrl(executive) || undefined}
                            alt={`${executive.firstName || ''} ${executive.lastName || ''}`.trim() || executive.email}
                          />
                          <AvatarFallback
                            className="text-white font-bold text-base rounded-lg"
                            style={{ backgroundColor: "#0051a2" }}
                          >
                            {getInitials(executive.firstName, executive.lastName, executive.email)}
                          </AvatarFallback>
                        </Avatar>
                        <div style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          gap: 2
                        }}>
                          <span style={{
                            fontSize: "11px",
                            color: "#ffffff",
                            fontWeight: "600",
                            textAlign: "center",
                            lineHeight: "1.2"
                          }}>
                            {fullName.length > 14 ? fullName.substring(0, 14) + '...' : fullName}
                          </span>
                          <span style={{
                            fontSize: "9px",
                            color: "#ffffff",
                            fontWeight: "500",
                            opacity: 0.9
                          }}>
                            {executive.role || "Executive"}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ),
          },
          style: {
            border: "2px solid #0070f3",
            background: "transparent",
            minWidth: 320,
            minHeight: 280,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: "bold",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            borderRadius: 12,
            cursor: "pointer",
            transition: "border 0.2s, background 0.2s, box-shadow 0.2s",
            padding: 0,
          },
        };

        // Add executive box node to nodes array
        const allNodes = [...nodes, executiveBoxNode];

        // Apply automatic layout using dagre
        const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(allNodes, edges);
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
          // Skip executive department box node
          if (node.id === 'executive-department-box') {
            return node;
          }

          const role = node.data?.label?.props?.children?.[1]?.props?.children?.[1]?.props?.children || "EMPLOYEE";
          let border, background, boxShadow;

          // Get department color for the node
          const department = node.data?.department || null;
          const deptColor = getDepartmentColor(department);

          // Use department colors for all nodes
          border = `2px solid ${deptColor.border}`;
          background = deptColor.background;

          // Special styling for admin role
          if (role === "ADMIN") {
            border = "3px solid #0070f3";
            background = "#0070f3";
          }

          // Apply highlighting
          if (highlightedNode === node.id) {
            border = "4px solid #ff6b6b";
            boxShadow = "0 0 0 4px #ff6b6b, 0 8px 25px rgba(255, 107, 107, 0.3)";
            // Darken background for highlighted nodes
            if (role === "ADMIN") {
              background = "#0051a2";
            } else {
              // Darken department color
              background = deptColor.iconBg;
            }
          } else if (selectedNode === node.id) {
            border = "3px solid #ffffff";
            boxShadow = "0 4px 12px rgba(0,0,0,0.15)";
            // Darken background for selected nodes
            if (role === "ADMIN") {
              background = "#0051a2";
            } else {
              // Darken department color
              background = deptColor.iconBg;
            }
          } else if (hoveredNode === node.id) {
            border = "3px solid #ffffff";
            boxShadow = "0 4px 12px rgba(0,0,0,0.15)";
            // Darken background for hovered nodes
            if (role === "ADMIN") {
              background = "#0051a2";
            } else {
              // Darken department color
              background = deptColor.iconBg;
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
      label: node.data?.fullName || node.id,
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

    console.log("Search query:", query);
    console.log("Available nodes:", nodes.map(n => ({ 
      id: n.id, 
      fullName: n.data?.fullName,
      employee: n.data?.employee 
    })));

    const results = nodes
      .filter(node => {
        // Skip executive department box node
        if (node.id === 'executive-department-box') return false;
        
        // Try to get fullName from multiple sources
        let fullName = node.data?.fullName || "";
        if (!fullName && node.data?.employee) {
          const emp = node.data.employee;
          fullName = emp.firstName && emp.lastName
            ? `${emp.firstName} ${emp.lastName}`
            : emp.email;
        }
        
        const matches = fullName.toLowerCase().startsWith(query.toLowerCase());
        console.log(`Node ${node.id}: "${fullName}" matches "${query}" = ${matches}`);
        return matches;
      })
      .map(node => node.id);

    console.log("Search results:", results);
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
        edgeTypes={{}}
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
                      className={`h-6 px-2 text-xs ${highlightedNode === resultId
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

        {/* Department Legend */}
        <div className="absolute bottom-4 right-4 z-10 bg-white rounded-lg shadow-lg border border-gray-200 max-w-xs">
          <Accordion type="single" collapsible defaultValue="departments">
            <AccordionItem value="departments" className="border-0">
              <AccordionTrigger className="px-4 py-2 cursor-pointer text-sm font-semibold text-gray-800 hover:no-underline">
                Departments
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-3">
                <div className="space-y-2">
                  {Object.entries(departmentColors).map(([dept, colors]) => (
                    <div key={dept} className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded-full border-2"
                        style={{
                          backgroundColor: colors.background,
                          borderColor: colors.border
                        }}
                      />
                      <span className="text-xs text-gray-600">{dept}</span>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </ReactFlow>
    </div >
  );
}
