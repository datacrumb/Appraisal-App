"use client";

import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  type Node,
  type Edge,
} from "reactflow";
import "reactflow/dist/style.css";

const nodes: Node[] = [
  {
    id: "1",
    data: { label: "Admin" },
    position: { x: 250, y: 0 },
  },
  {
    id: "2",
    data: { label: "Employee A" },
    position: { x: 100, y: 100 },
  },
  {
    id: "3",
    data: { label: "Employee B" },
    position: { x: 400, y: 100 },
  },
  {
    id: "4",
    data: { label: "Reviewer A" },
    position: { x: 100, y: 200 },
  },
  {
    id: "5",
    data: { label: "Reviewer B" },
    position: { x: 400, y: 200 },
  },
];

const edges: Edge[] = [
  { id: "e1-2", source: "1", target: "2" },
  { id: "e1-3", source: "1", target: "3" },
  { id: "e2-4", source: "2", target: "4" },
  { id: "e3-5", source: "3", target: "5" },
];

export default function EmployeeHierarchyFlow() {
  return (
    <div style={{ height: "500px", width: "100%" }}>
      <ReactFlow nodes={nodes} edges={edges} fitView>
        <MiniMap />
        <Controls />
        <Background gap={12} />
      </ReactFlow>
    </div>
  );
}
