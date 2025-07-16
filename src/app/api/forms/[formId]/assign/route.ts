import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prsima";
import { z } from "zod";
import { isAdmin } from "@/lib/isAdmin";

const assignSchema = z.object({
  employeeIds: z.array(z.string().min(1)),
});

export async function POST(req: NextRequest, { params }: { params: { formId: string } }) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check if user is admin
  if (!(await isAdmin(userId))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  
  // Validate request body
  const body = await req.json();
  const parsed = assignSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid data", details: parsed.error }, { status: 400 });
  }

  const { employeeIds } = parsed.data;
  const { formId } = params;

  // Check if form exists
  const form = await prisma.form.findUnique({ where: { id: formId } });
  if (!form) {
    return NextResponse.json({ error: "Form not found" }, { status: 404 });
  }

  // Create assignments (avoid duplicates)
  const assignments = await Promise.all(
    employeeIds.map(async (employeeId) => {
      // Check if assignment already exists
      const existing = await prisma.assignment.findFirst({
        where: { formId, employeeId },
      });
      if (existing) return existing;
      return prisma.assignment.create({
        data: {
          formId,
          employeeId,
        },
      });
    })
  );

  return NextResponse.json(assignments, { status: 201 });
}
