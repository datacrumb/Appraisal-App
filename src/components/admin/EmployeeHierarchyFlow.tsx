"use client";

import React, { useState, useEffect } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  type Node,
  type Edge,
  Position,
} from "reactflow";
import dagre from "dagre";
import "reactflow/dist/style.css";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { RefreshCw, FileText, CheckCircle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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

  // Function to recalculate layout
  const recalculateLayout = () => {
    if (nodes.length > 0 && edges.length > 0) {
      const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(nodes, edges);
      setNodes(layoutedNodes);
      setEdges(layoutedEdges);
      
      // Fit view after layout recalculation
      setTimeout(() => {
        if (reactFlowInstance) {
          reactFlowInstance.fitView({ padding: 0.1 });
        }
      }, 100);
    }
  };

  // Function to trigger form assignments
  const triggerFormAssignment = async () => {
    setAssigningForms(true);
    setAssignmentSuccess(false);
    
    try {
      const response = await fetch("/api/forms/auto-assign", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to assign forms");
      }

      const result = await response.json();
      setAssignmentSuccess(true);
      
      // Reset success message after 3 seconds
      setTimeout(() => {
        setAssignmentSuccess(false);
      }, 3000);
      
    } catch (error) {
      console.error("Form assignment failed:", error);
      setError("Failed to assign forms. Please try again.");
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
            roleMap[emp.id] = "LEAD";
          } else {
            roleMap[emp.id] = "EMPLOYEE";
          }
        });
        
        // Admin gets highest priority
        roleMap[adminId] = "ADMIN";

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
          } else if (role === "LEAD") {
            border = "2px solid #42a5f5";
            background = "#42a5f5";
            iconBg = "#1976d2";
            textColor = "#ffffff";
          } else if (role === "COLLEAGUE") {
            border = "2px solid #6366f1";
            background = "#6366f1";
            iconBg = "#4f46e5";
            textColor = "#ffffff";
          } else {
            border = "1px solid #10b981";
            background = "#10b981";
            iconBg = "#059669";
            textColor = "#ffffff";
          }
          // Highlight selected/hovered
          if (selectedNode === emp.id) {
            border = "3px solid #ffffff";
            background = role === "ADMIN" ? "#0051a2" : role === "MANAGER" ? "#d97706" : "#059669";
          } else if (hoveredNode === emp.id) {
            border = "3px solid #ffffff";
            background = role === "ADMIN" ? "#0051a2" : role === "MANAGER" ? "#d97706" : "#059669";
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

        // Create edges from relations
        const edges: Edge[] = relations.map((rel) => {
          // Get the source node's role to determine edge color
          const sourceRole = roleMap[rel.fromId] || "EMPLOYEE";
          let stroke, strokeDasharray;
          
          // Use source position color for the edge
          if (sourceRole === "ADMIN") {
            stroke = "#0070f3";
          } else if (sourceRole === "MANAGER") {
            stroke = "#f59e42";
          } else if (sourceRole === "LEAD") {
            stroke = "#42a5f5";
          } else if (sourceRole === "COLLEAGUE") {
            stroke = "#6366f1";
          } else {
            stroke = "#10b981"; // Employee color
          }
          
          // Keep some visual distinction for different relation types
          if (rel.type === "MANAGER") {
            strokeDasharray = undefined; // Solid line for manager relations
          } else if (rel.type === "LEAD") {
            strokeDasharray = "5,5"; // Dashed line for lead relations
          } else if (rel.type === "COLLEAGUE") {
            strokeDasharray = "2,4"; // Dotted line for colleague relations
          }
          
          return {
            id: rel.id,
            source: rel.fromId,
            target: rel.toId,
            animated: rel.type === "MANAGER" || rel.type === "LEAD",
            style: {
              stroke,
              strokeDasharray,
              strokeWidth: 3,
            },
            labelStyle: {
              fill: "#333",
              fontWeight: 600,
              fontSize: 13,
              background: "#fff",
              padding: "2px 6px",
              borderRadius: 4,
            },
          };
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

  if (loading) return <div className="flex text-2xl font-bold justify-center items-center">Loading employee hierarchy...</div>;
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
        style={{ background: "#f3f6fa" }}
      >
        <MiniMap
          nodeColor={(n) => {
            if (n.id === selectedNode) return "#10b981";
            if (n.id === hoveredNode) return "#6366f1";
            const role = n.data?.label?.props?.children?.[1]?.props?.children?.[1]?.props?.children || "EMPLOYEE";
            if (role === "ADMIN") return "#0070f3";
            if (role === "MANAGER") return "#f59e42";
            if (role === "LEAD") return "#42a5f5";
            if (role === "COLLEAGUE") return "#6366f1";
            return "#bbb";
          }}
        />
        <Controls />
        <Background />
        <Button
          variant="ghost"
          size="icon"
          onClick={recalculateLayout}
          className="absolute top-4 left-4 z-10"
        >
          <RefreshCw className="h-6 w-6" />
        </Button>
        
        {/* Form Assignment Button */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="default"
                size="sm"
                onClick={triggerFormAssignment}
                disabled={assigningForms}
                className="absolute top-4 right-4 z-10 bg-blue-600 hover:bg-blue-700 text-white"
              >
                {assigningForms ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : assignmentSuccess ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <FileText className="h-4 w-4" />
                )}
                <span className="ml-2">
                  {assigningForms ? "Assigning..." : assignmentSuccess ? "Assigned!" : "Assign Forms"}
                </span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Automatically assign forms to managers and employees</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        {/* Success Message */}
        {assignmentSuccess && (
          <div className="absolute top-16 right-4 z-10 bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded-md shadow-lg">
            Forms assigned successfully!
          </div>
        )}
      </ReactFlow>
    </div>
  );
}
