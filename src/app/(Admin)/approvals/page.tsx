import { ApprovalsList } from "@/components/admin/ApprovalsList";
import { prisma } from "@/lib/prsima";
import { auth } from "@clerk/nextjs/server";
import { isAdmin } from "@/lib/isAdmin";
import { redirect } from "next/navigation";

export default async function ApprovalsPage() {
  const { userId } = await auth();
  if (!userId || !(await isAdmin(userId))) {
    redirect("/");
  }

  const pendingRequests = await prisma.onboardingRequest.findMany({
    where: { status: 'PENDING' },
    orderBy: { createdAt: 'asc' },
  });

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Pending Approvals</h1>
      <ApprovalsList initialRequests={pendingRequests} />
    </div>
  );
}
