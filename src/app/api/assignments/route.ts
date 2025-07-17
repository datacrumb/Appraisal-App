import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prsima";

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const assignments = await prisma.assignment.findMany({
    where: { employeeId: userId },
    include: { form: true },
    orderBy: { assignedAt: "desc" },
  });
  return NextResponse.json(assignments);
}
