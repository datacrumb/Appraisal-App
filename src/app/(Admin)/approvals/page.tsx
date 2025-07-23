import { fetchPendingApprovals, OnboardingRequest } from "@/lib/sheets";
import { ApprovalsList } from "@/components/admin/ApprovalsList";

export default async function ApprovalsPage() {
  let pendingApprovals: OnboardingRequest[] = [];
  let error: string | null = null;
  try {
    pendingApprovals = await fetchPendingApprovals();
  } catch (e: any) {
    error = e.message;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Pending Approvals</h1>
      {error && <p className="text-red-500">Error fetching approvals: {error}</p>}
      {!error && <ApprovalsList initialApprovals={pendingApprovals} />}
    </div>
  );
}
