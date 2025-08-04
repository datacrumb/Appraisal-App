// src/app/api/assignments/[assignmentId]/responses/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prsima";
import { z } from "zod";

const responseSchema = z.object({
  answers: z.record(z.string(), z.string().min(1, "All fields are required")),
});

export async function GET(req: NextRequest, context: { params: Promise<{ assignmentId: string }> }): Promise<Response> {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { assignmentId } = await context.params;
  
  // Get the assignment with form and response data
  const assignment = await prisma.assignment.findUnique({
    where: { id: assignmentId },
    include: {
      form: true,
      employee: true,
      responses: {
        where: { responderId: userId },
        orderBy: { createdAt: 'desc' },
        take: 1
      }
    }
  });

  if (!assignment) {
    return NextResponse.json({ error: "Assignment not found" }, { status: 404 });
  }

  // Only allow the assigned employee to fetch this assignment's response
  if (assignment.employeeId !== userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (assignment.responses.length === 0) {
    return NextResponse.json({ error: "No response found for this assignment" }, { status: 404 });
  }

  const response = assignment.responses[0];

  // Transform the response to match the expected format
  const transformedResponse = {
    id: response.id,
    createdAt: response.createdAt,
    answers: response.answers,
    assignment: {
      employeeEmail: assignment.employeeEmail,
      employeeName: assignment.employee?.firstName && assignment.employee?.lastName 
        ? `${assignment.employee.firstName} ${assignment.employee.lastName}` 
        : undefined,
      employeeProfilePictureUrl: assignment.employee?.profilePictureUrl,
      evaluationTarget: assignment.evaluationTarget,
      form: {
        title: assignment.form.title,
        questions: assignment.form.questions
      }
    }
  };

  return NextResponse.json(transformedResponse);
}

export async function POST(req: NextRequest, context: { params: Promise<{ assignmentId: string }> }): Promise<Response> {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { assignmentId } = await context.params;
  const assignment = await prisma.assignment.findUnique({ where: { id: assignmentId } });
  if (!assignment) {
    return NextResponse.json({ error: "Assignment not found" }, { status: 404 });
  }

  // Prevent duplicate submission by the same user for this assignment
  const existing = await prisma.response.findFirst({
    where: { assignmentId, responderId: userId, isPeer: false },
  });
  if (existing) {
    return NextResponse.json({ error: "You have already submitted this form." }, { status: 400 });
  }

  const body = await req.json();
  const parsed = responseSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ 
      error: "Invalid form data", 
      details: parsed.error.issues 
    }, { status: 400 });
  }

  const response = await prisma.response.create({
    data: {
      assignmentId,
      responderId: userId,
      answers: parsed.data.answers,
      isPeer: false,
    },
  });

  return NextResponse.json(response, { status: 201 });
}
