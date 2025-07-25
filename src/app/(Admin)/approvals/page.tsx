import { EmployeeManagement } from "@/components/admin/EmployeeManagement";
import { prisma } from "@/lib/prsima";
import { auth } from "@clerk/nextjs/server";
import { isAdmin } from "@/lib/isAdmin";
import { redirect } from "next/navigation";

export default async function ApprovalsPage() {
  const { userId } = await auth();
  if (!userId || !(await isAdmin(userId))) {
    redirect("/");
  }

  // Fetch pending requests
  const pendingRequests = await prisma.onboardingRequest.findMany({
    where: { status: 'PENDING' },
    orderBy: { createdAt: 'asc' },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      department: true,
      role: true,
      isManager: true,
      isLead: true,
      managerEmail: true,
      createdAt: true,
      status: true,
      approvedAt: true,
      approvedBy: true,
      profilePictureUrl: true,
    },
  });

  // Fetch all employees
  const allEmployees = await prisma.employee.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Employee Management</h1>
      <EmployeeManagement 
        initialRequests={pendingRequests} 
        allEmployees={allEmployees}
      />
    </div>
  );
}
