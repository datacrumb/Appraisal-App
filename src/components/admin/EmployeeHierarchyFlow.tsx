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

interface Employee {
  id: string;
  email: string;
  role: string;
}

interface Relation {
  id: string;
  fromId: string;
  toId: string;
  type: string;
}

// Helper to get initials from email
function getInitials(email: string) {
  if (!email) return "?";
  const [name] = email.split("@");
  return name
    .split(/[._-]/)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("")
    .slice(0, 2);
}

const nodeWidth = 180;
const nodeHeight = 60;

function getLayoutedElements(nodes: Node[], edges: Edge[], direction = "TB") {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  const isHorizontal = direction === "LR";
  dagreGraph.setGraph({
    rankdir: direction,
    ranksep: 160, // vertical gap between layers
    nodesep: 160, // horizontal gap between nodes
  });
  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
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
        // Fetch adminId from new API route
        const adminRes = await fetch("/api/employees/is-admin");
        if (!adminRes.ok) throw new Error("Failed to fetch admin ID");
        const adminData = await adminRes.json();
        const adminId: string = adminData.adminId;
        if (!adminId) throw new Error("No admin found");

        // Fetch all users
        const usersRes = await fetch("/api/users");
        if (!usersRes.ok) throw new Error("Failed to fetch users");
        const usersData = await usersRes.json();
        const employees: Employee[] = usersData.users || [];
        const employeeMap: Record<string, Employee> = {};
        employees.forEach(emp => { employeeMap[emp.id] = emp; });

        // Fetch relations
        const relRes = await fetch("/api/employees/relations");
        if (!relRes.ok) throw new Error("Failed to fetch relations");
        const relData = await relRes.json();
        const relations: Relation[] = relData.relations || [];

        // Build children map for hierarchy (only MANAGER/LEAD)
        const childrenMap: Record<string, string[]> = {};
        const roleMap: Record<string, string> = {};
        relations.forEach((rel) => {
          if (rel.type === "MANAGER" || rel.type === "LEAD" || rel.type === "COLLEAGUE") {
            if (!childrenMap[rel.fromId]) childrenMap[rel.fromId] = [];
            childrenMap[rel.fromId].push(rel.toId);
            // Assign role to child if not already set (prefer highest in hierarchy)
            if (!roleMap[rel.toId]) roleMap[rel.toId] = rel.type;
          }
        });
        roleMap[adminId] = "ADMIN";
        // If there are employees not connected to the tree, lay them out below
        employees.forEach(emp => {
          if (!roleMap[emp.id]) roleMap[emp.id] = "EMPLOYEE";
        });

        // Helper to get role level
        const roleLevel = (role: string) => {
          if (role === "ADMIN") return 0;
          if (role === "MANAGER") return 1;
          if (role === "LEAD") return 2;
          if (role === "COLLEAGUE") return 3;
          return 4; // EMPLOYEE or unknown
        };

        // Only allow edges between adjacent levels
        const allowedTransitions: { [key: string]: string[] } = {
          ADMIN: ["MANAGER"],
          MANAGER: ["LEAD"],
          LEAD: ["COLLEAGUE"],
        };

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
          if (roleMap[rel.toId] === "LEAD" && roleMap[rel.fromId] === "MANAGER") {
            levels[rel.toId] = 2;
          }
        });
        // Then assign colleagues (direct children of leads)
        relations.forEach(rel => {
          if (roleMap[rel.toId] === "COLLEAGUE" && roleMap[rel.fromId] === "LEAD") {
            levels[rel.toId] = 3;
          }
        });
        // Fallback: assign EMPLOYEE or unknown to bottom level
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
        const levelY = [0, 200, 400, 600, 800];
        const chartWidth = 1200;
        const nodeSpacing = 220;
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
          return {
            id: emp.id,
            data: {
              label: (
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    background: iconBg,
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 700,
                    fontSize: 18,
                  }}>{getInitials(emp.email)}</div>
                  <span>{emp.email}</span>
                  <span style={{
                    marginLeft: 8,
                    fontSize: 12,
                    color: "#888",
                    fontWeight: 500,
                  }}>{role}</span>
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

        // Only create edges between adjacent levels (as before)
        const edges: Edge[] = relations
          .filter((rel) => {
            const fromRole = roleMap[rel.fromId] || "EMPLOYEE";
            const toRole = roleMap[rel.toId] || "EMPLOYEE";
            return allowedTransitions[fromRole]?.includes(toRole);
          })
          .map((rel) => {
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
              label: rel.type,
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

        // Use dagre for layout
        const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(nodes, edges, "TB");
        setNodes([...layoutedNodes]);
        setEdges([...layoutedEdges]);
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
      label: node.data?.label?.props?.children?.[1] || node.id,
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
    <div style={{ width: "100%", height: "600px", position: "relative" }}>
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
            const role = n.data?.label?.props?.children?.[2]?.props?.children || "EMPLOYEE";
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
