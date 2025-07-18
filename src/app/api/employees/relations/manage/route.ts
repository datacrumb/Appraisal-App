import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prsima";
import { isAdmin } from "@/lib/isAdmin";
import { z } from "zod";
import { relationTypes, RelationType } from "@/types/relationTypes";

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