// src/app/api/forms/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prsima"; // fix typo if needed!
import { z } from "zod";
import { isAdmin } from "@/lib/isAdmin";

// Zod schema for validation
const formSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  questions: z.array(z.object({
    type: z.string(),
    label: z.string(),
    // Add more fields as needed for your question types
  })),
});

export async function POST(req: NextRequest) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check if user is admin
  if (!(await isAdmin(userId))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Parse and validate request body
  const body = await req.json();
  const parsed = formSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid data", details: parsed.error }, { status: 400 });
  }

  // Create form
  const form = await prisma.form.create({
    data: {
      title: parsed.data.title,
      description: parsed.data.description,
      questions: parsed.data.questions,
      createdBy: userId,
    },
  });

  return NextResponse.json(form, { status: 201 });
}
