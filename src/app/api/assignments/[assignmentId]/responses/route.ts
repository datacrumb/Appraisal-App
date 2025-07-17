// src/app/api/assignments/[assignmentId]/responses/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prsima";
import { z } from "zod";

const responseSchema = z.object({
  answers: z.any(), // Accept any structure for answers
});

export async function POST(req: NextRequest, context: { params: { assignmentId: string } }) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { assignmentId } = context.params;
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
    return NextResponse.json({ error: "Invalid data", details: parsed.error }, { status: 400 });
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
