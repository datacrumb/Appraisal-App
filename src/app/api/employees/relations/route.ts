import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prsima";
import { isAdmin } from "@/lib/isAdmin";
import { z } from "zod";
import { relationTypes, RelationType } from "@/types/relationTypes";

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!(await isAdmin(userId))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Fetch all employees and their relations
  const employees = await prisma.employee.findMany({
    include: {
      relationsFrom: true,
      relationsTo: true,
    },
  });

  // Fetch all relations with type and both ends
  const relations = await prisma.employeeRelation.findMany({
    include: {
      from: true, // includes Employee for fromId
      to: true,   // includes Employee for toId
    },
  });

  return NextResponse.json({ employees, relations });
}

const relationSchema = z.object({
  fromId: z.string(),
  toId: z.string(),
  type: z.enum(relationTypes), // Should match RelationType enum
});

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!(await isAdmin(userId))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = relationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid data", details: parsed.error }, { status: 400 });
  }

  const { fromId, toId, type } = parsed.data;

  // Upsert relation (update if exists, else create)
  const relation = await prisma.employeeRelation.upsert({
    where: {
      fromId_toId_type: {
        fromId,
        toId,
        type,
      },
    },
    update: {},
    create: { fromId, toId, type: type as RelationType },
  });

  return NextResponse.json(relation, { status: 201 });
} 

const updateSchema = z.object({
  id: z.string(),
  type: z.enum(relationTypes),
});

export async function PATCH(req: NextRequest) {
  const { userId } = await auth();
  if (!userId || !(await isAdmin(userId))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid data", details: parsed.error }, { status: 400 });
  }
  const { id, type } = parsed.data;
  const updated = await prisma.employeeRelation.update({
    where: { id },
    data: { type },
  });
  return NextResponse.json(updated);
}

const deleteSchema = z.object({
  id: z.string(),
});

export async function DELETE(req: NextRequest) {
  const { userId } = await auth();
  if (!userId || !(await isAdmin(userId))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const body = await req.json();
  const parsed = deleteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid data", details: parsed.error }, { status: 400 });
  }
  const { id } = parsed.data;
  await prisma.employeeRelation.delete({ where: { id } });
  return NextResponse.json({ success: true });
}