import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prsima";
import { z } from "zod";
import { isAdmin } from "@/lib/isAdmin";

// Zod schema for validation
const questionSchema = z.object({
  id: z.string(),
  label: z.string(),
  type: z.enum(["rating", "multiple-choice", "text"]),
  options: z.array(z.string()).optional(),
  section: z.string(),
  sectionColor: z.string().optional(),
});

const formSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1),
  description: z.string().optional(),
  questions: z.array(questionSchema),
});

export async function POST(req: NextRequest) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
      id: parsed.data.id || undefined,
      title: parsed.data.title,
      description: parsed.data.description,
      questions: parsed.data.questions,
      createdBy: userId,
    },
  });

  return NextResponse.json(form, { status: 201 });
}


export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  // Check if user is admin
  if (!(await isAdmin(userId))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const forms = await prisma.form.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(forms);
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Failed to fetch forms" }, { status: 500 });
  }
}