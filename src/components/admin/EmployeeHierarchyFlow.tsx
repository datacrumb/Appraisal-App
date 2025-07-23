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

const nodeWidth = 220;
const nodeHeight = 70;

// Re-introduce dagre for robust hierarchical layout with groups
function getLayoutedElements(nodes: Node[], edges: Edge[], direction = "TB") {
  const dagreGraph = new dagre.graphlib.Graph({ compound: true });
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  const isHorizontal = direction === "LR";
  dagreGraph.setGraph({
    rankdir: direction,
    ranksep: 120,
    nodesep: 120,
  });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
    if (node.parentNode) {
      dagreGraph.setParent(node.id, node.parentNode);
    }
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  nodes.forEach((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    node.targetPosition = isHorizontal ? Position.Left : Position.Top;
    node.sourcePosition = isHorizontal ? Position.Right : Position.Bottom;
    node.position = {
      x: nodeWithPosition.x - nodeWidth / 2,
      y: nodeWithPosition.y - nodeHeight / 2,
    };
  });

  return { nodes, edges };
}

export default function EmployeeHierarchyFlow() {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; label: string } | null>(null);

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

        // Assign levels to each node for org chart layout
        const levels: Record<string, number> = {};
        levels[adminId] = 0;
        
        // First, assign managers (direct children of admin)
        employees.forEach(emp => {
          if (roleMap[emp.id] === "MANAGER") {
            levels[emp.id] = 1;
          }
        });
        
        // Then assign leads (direct children of managers)
        relations.forEach(rel => {
          if (rel.type === "MANAGER" && roleMap[rel.toId] === "LEAD") {
            levels[rel.toId] = 2;
          }
        });
        
        // Then assign employees (direct children of leads or managers)
        relations.forEach(rel => {
          if (rel.type === "MANAGER" && roleMap[rel.toId] === "EMPLOYEE") {
            levels[rel.toId] = 2;
          } else if (rel.type === "LEAD" && roleMap[rel.toId] === "EMPLOYEE") {
            levels[rel.toId] = 3;
          }
        });
        
        // Fallback: assign unknown to bottom level
        employees.forEach(emp => {
          if (levels[emp.id] === undefined) {
            levels[emp.id] = 4;
          }
        });

        // Group nodes by level
        const nodesByLevel: Record<number, Employee[]> = {};
        employees.forEach(emp => {
          const lvl = levels[emp.id];
          if (!nodesByLevel[lvl]) nodesByLevel[lvl] = [];
          nodesByLevel[lvl].push(emp);
        });

        // Calculate positions for each level (banded layout)
        const levelY = [0, 250, 500, 750, 1000]; // Increased vertical gap
        const chartWidth = 1600; // Wider chart for more space
        const nodeSpacing = 280; // Increased horizontal gap
        const positions: Record<string, { x: number; y: number }> = {};
        Object.entries(nodesByLevel).forEach(([lvlStr, emps]) => {
          const lvl = parseInt(lvlStr);
          const count = emps.length;
          const totalWidth = (count - 1) * nodeSpacing;
          const startX = (chartWidth - totalWidth) / 2;
          emps.forEach((emp, idx) => {
            positions[emp.id] = {
              x: startX + idx * nodeSpacing,
              y: levelY[lvl] || (lvl * 200),
            };
          });
        });

        // Map employees to nodes with calculated positions (banded layout)
        const nodes: Node[] = employees.map((emp) => {
          const role = roleMap[emp.id] || "EMPLOYEE";
          let border, background, fontWeight, iconBg;
          if (role === "ADMIN") {
            border = "3px solid #0070f3";
            background = "#e0f2ff";
            fontWeight = "bold";
            iconBg = "#0070f3";
          } else if (role === "MANAGER") {
            border = "2px dashed #f59e42";
            background = "#fffbe6";
            iconBg = "#f59e42";
          } else if (role === "LEAD") {
            border = "2px solid #42a5f5";
            background = "#e3f2fd";
            iconBg = "#42a5f5";
          } else if (role === "COLLEAGUE") {
            border = "2px dotted #6366f1";
            background = "#f3f6fa";
            iconBg = "#6366f1";
          } else {
            border = "1px solid #ccc";
            background = "#f9f9f9";
            iconBg = "#bbb";
          }
          // Highlight selected/hovered
          if (selectedNode === emp.id) {
            border = "3px solid #10b981";
            background = "#d1fae5";
          } else if (hoveredNode === emp.id) {
            border = "3px solid #6366f1";
            background = "#eef2ff";
          }
          
          const fullName = emp.firstName && emp.lastName 
            ? `${emp.firstName} ${emp.lastName}` 
            : emp.email;
          
          return {
            id: emp.id,
            data: {
              label: (
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <Avatar className="w-10 h-10">
                    <AvatarImage 
                      src={getProfilePictureUrl(emp) || undefined} 
                      alt={`${emp.firstName || ''} ${emp.lastName || ''}`.trim() || emp.email}
                    />
                    <AvatarFallback 
                      className="text-white font-bold text-lg"
                      style={{ backgroundColor: iconBg }}
                    >
                      {getInitials(emp.firstName, emp.lastName, emp.email)}
                    </AvatarFallback>
                  </Avatar>
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <span style={{ fontWeight: "bold" }}>{fullName}</span>
                    <span style={{ fontSize: 12, color: "#888" }}>{role}</span>
                    {emp.department && (
                      <span style={{ fontSize: 10, color: "#aaa" }}>{emp.department}</span>
                    )}
                  </div>
                </div>
              ),
            },
            position: positions[emp.id] || { x: 0, y: 0 },
            style: {
              border,
              background,
              minWidth: nodeWidth,
              minHeight: nodeHeight,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight,
              boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
              borderRadius: 10,
              cursor: "pointer",
              transition: "border 0.2s, background 0.2s",
            },
          };
        });

        // Create edges from relations
        const edges: Edge[] = relations.map((rel) => {
          let stroke, strokeDasharray;
          if (rel.type === "MANAGER") {
            stroke = "#0070f3";
          } else if (rel.type === "LEAD") {
            stroke = "#f59e42";
            strokeDasharray = "5,5";
          } else if (rel.type === "COLLEAGUE") {
            stroke = "#6366f1";
            strokeDasharray = "2,4";
          } else {
            stroke = "#aaa";
          }
          return {
            id: rel.id,
            source: rel.fromId,
            target: rel.toId,
            animated: rel.type === "MANAGER" || rel.type === "LEAD",
            style: {
              stroke,
              strokeDasharray,
              strokeWidth: 2,
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

        setNodes(nodes);
        setEdges(edges);

      } catch (e: any) {
        setError(e.message || "Unknown error");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

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

  if (loading) return <div>Loading employee hierarchy...</div>;
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
      </ReactFlow>
    </div>
  );
}
