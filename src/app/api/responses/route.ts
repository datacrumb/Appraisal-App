import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prsima";
import { isAdmin } from "@/lib/isAdmin";

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!(await isAdmin(userId))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const responses = await prisma.response.findMany({
    include: {
      assignment: {
        include: { 
          form: true,
          employee: true
        }
      }
    },
    orderBy: { createdAt: "desc" },
  });

  // Transform responses to include employee name and evaluation target
  const transformedResponses = responses.map(response => ({
    ...response,
    assignment: {
      ...response.assignment,
      employeeEmail: response.assignment.employeeEmail,
      employeeName: response.assignment.employee 
        ? `${response.assignment.employee.firstName || ''} ${response.assignment.employee.lastName || ''}`.trim() 
        : null,
      employeeProfilePictureUrl: response.assignment.employee.profilePictureUrl,
      evaluationTarget: response.assignment.evaluationTarget
    }
  }));

  return NextResponse.json(transformedResponses);
} 