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
    include: { 
      form: true,
      responses: {
        select: {
          id: true,
          createdAt: true,
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 1
      }
    },
    orderBy: { assignedAt: "desc" },
  });

  // If user has no assignments, return empty array instead of 403
  if (userAssignments.length === 0) {
    return NextResponse.json([]);
  }

  // Transform assignments to include response status and evaluation target
  const transformedAssignments = userAssignments.map(assignment => ({
    id: assignment.id,
    form: {
      title: assignment.form.title,
      description: assignment.form.description,
    },
    assignedAt: assignment.assignedAt,
    evaluationTarget: assignment.evaluationTarget,
    hasResponse: assignment.responses.length > 0,
    submittedAt: assignment.responses.length > 0 ? assignment.responses[0].createdAt : null,
  }));

  return NextResponse.json(transformedAssignments);
}
