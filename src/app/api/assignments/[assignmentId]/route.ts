import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prsima";

export async function GET(req: NextRequest, context: { params: Promise<{ assignmentId: string }> }): Promise<Response> {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { assignmentId } = await context.params;
  const assignment = await prisma.assignment.findUnique({
    where: { id: assignmentId },
    include: { form: true },
  });

  // Only allow the assigned employee to fetch this assignment
  if (!assignment || assignment.employeeId !== userId) {
    return NextResponse.json({ error: "Assignment not found" }, { status: 404 });
  }

  return NextResponse.json(assignment);
}
