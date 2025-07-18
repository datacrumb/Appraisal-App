import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prsima";
import { isEmployee } from "@/lib/isEmployee";

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check if user is employee
  if (!(await isEmployee(userId))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const assignments = await prisma.assignment.findMany({
    where: { employeeId: userId },
    include: { form: true },
    orderBy: { assignedAt: "desc" },
  });
  return NextResponse.json(assignments);
}
