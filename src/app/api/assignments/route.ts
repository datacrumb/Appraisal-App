import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prsima";

// Get all assignments for a user
export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check if user has any assignments (more inclusive than just checking employee role)
  const userAssignments = await prisma.assignment.findMany({
    where: { employeeId: userId },
    include: { form: true },
    orderBy: { assignedAt: "desc" },
  });

  // If user has no assignments, return empty array instead of 403
  if (userAssignments.length === 0) {
    return NextResponse.json([]);
  }

  return NextResponse.json(userAssignments);
}
