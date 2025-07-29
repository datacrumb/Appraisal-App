import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prsima";
import { isAdmin } from "@/lib/isAdmin";
import { z } from "zod";

// Zod schema for validation
const questionSchema = z.object({
  id: z.string(),
  label: z.string(),
  type: z.enum(["rating", "multiple-choice", "text"]),
  options: z.array(z.string()).optional(),
  section: z.string(),
  sectionColor: z.string().optional(),
});

const formUpdateSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  questions: z.array(questionSchema),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ formId: string }> }
) {
  const { userId } = await auth();
  if (!userId || !(await isAdmin(userId))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { formId } = await params;
    const body = await req.json();
    
    // Parse and validate request body
    const parsed = formUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid data", details: parsed.error }, { status: 400 });
    }

    // Check if form exists
    const existingForm = await prisma.form.findUnique({
      where: { id: formId },
    });

    if (!existingForm) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 });
    }

    // Update the form
    const updatedForm = await prisma.form.update({
      where: { id: formId },
      data: {
        title: parsed.data.title,
        description: parsed.data.description,
        questions: parsed.data.questions,
      },
    });

    return NextResponse.json(updatedForm);
  } catch (error) {
    console.error("Failed to update form:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
} 