// src/app/api/employees/add/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prsima";
import { isAdmin } from "@/lib/isAdmin";
import { z } from "zod";

const addEmployeeSchema = z.object({
  id: z.string(),
  email: z.string().email(),
});

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId || !(await isAdmin(userId))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const body = await req.json();
  const parsed = addEmployeeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid data", details: parsed.error }, { status: 400 });
  }
  const { id, email } = parsed.data;
  const employee = await prisma.employee.upsert({
    where: { id },
    update: { email },
    create: { id, email },
  });
  return NextResponse.json(employee, { status: 201 });
}
