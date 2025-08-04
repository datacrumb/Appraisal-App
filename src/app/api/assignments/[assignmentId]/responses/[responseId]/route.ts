import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prsima";

export async function GET(req: NextRequest, context: { params: Promise<{ assignmentId: string; responseId: string }> }): Promise<Response> {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { assignmentId, responseId } = await context.params;

  try {
    // Get the response with assignment and form data
    const response = await prisma.response.findUnique({
      where: { id: responseId },
      include: {
        assignment: {
          include: {
            form: true,
            employee: true,
          }
        }
      }
    });

    if (!response) {
      return NextResponse.json({ error: "Response not found" }, { status: 404 });
    }

    // Only allow the responder to view their own response
    if (response.responderId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Transform the response to match the expected format
    const transformedResponse = {
      id: response.id,
      createdAt: response.createdAt,
      answers: response.answers,
      assignment: {
        employeeEmail: response.assignment.employeeEmail,
        employeeName: response.assignment.employee?.firstName && response.assignment.employee?.lastName
          ? `${response.assignment.employee.firstName} ${response.assignment.employee.lastName}`
          : undefined,
        employeeProfilePictureUrl: response.assignment.employee?.profilePictureUrl,
        evaluationTarget: response.assignment.evaluationTarget,
        form: {
          title: response.assignment.form.title,
          questions: response.assignment.form.questions
        }
      }
    };

    return NextResponse.json(transformedResponse);
  } catch (error) {
    console.error("Error fetching response:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
} 