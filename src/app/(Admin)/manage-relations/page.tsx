import dynamic from "next/dynamic";

const ManageEmployeeRelations = dynamic(() => import("@/components/admin/ManageEmployeeRelations"));

export default function ManageRelationsPage() {
  return <ManageEmployeeRelations />;
} 