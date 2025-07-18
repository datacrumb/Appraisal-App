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
        include: { form: true }
      }
    },
  });
  if (!response) {
    return NextResponse.json({ error: "Response not found" }, { status: 404 });
  }
  return NextResponse.json(response);
} 