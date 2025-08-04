import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prsima";
import { isAdmin } from "@/lib/isAdmin";

export async function GET(req: NextRequest, context: { params: Promise<{ responseId: string }> }): Promise<Response> {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!(await isAdmin(userId))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { responseId } = await context.params;
  const response = await prisma.response.findUnique({
    where: { id: responseId },
    include: {
      assignment: {
        include: { 
          form: true,
          employee: true
        }
      }
    },
  });

  if (!response) {
    return NextResponse.json({ error: "Response not found" }, { status: 404 });
  }

  // Transform response to include employee name and evaluation target
  const transformedResponse = {
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
  };

  return NextResponse.json(transformedResponse);
} 