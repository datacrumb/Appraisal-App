import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prsima";
import { isAdmin } from "@/lib/isAdmin";
import { z } from "zod";

const assignCourseSchema = z.object({
  courseId: z.string().min(1, "Course ID is required"),
  employeeIds: z.array(z.string()).min(1, "At least one employee must be selected"),
});

// Assign course to employees
export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId || !(await isAdmin(userId))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { courseId, employeeIds } = assignCourseSchema.parse(body);

    // Verify course exists
    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // Verify all employees exist
    const employees = await prisma.employee.findMany({
      where: { id: { in: employeeIds } },
    });

    if (employees.length !== employeeIds.length) {
      return NextResponse.json({ error: "One or more employees not found" }, { status: 404 });
    }

    // Assign course to employees (use upsert to avoid duplicates)
    const assignments = await Promise.all(
      employeeIds.map(async (employeeId) => {
        return prisma.employeeCourse.upsert({
          where: {
            employeeId_courseId: {
              employeeId,
              courseId,
            },
          },
          update: {
            status: "ASSIGNED",
            assignedAt: new Date(),
          },
          create: {
            employeeId,
            courseId,
            status: "ASSIGNED",
          },
        });
      })
    );

    return NextResponse.json({
      success: true,
      message: `Course assigned to ${assignments.length} employees`,
      assignments,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid data", details: error.issues }, { status: 400 });
    }
    console.error("Failed to assign course:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// Get course assignments
export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get('courseId');
    const employeeId = searchParams.get('employeeId');

    const whereClause: any = {};
    
    if (courseId) {
      whereClause.courseId = courseId;
    }
    
    if (employeeId) {
      whereClause.employeeId = employeeId;
    }

    const assignments = await prisma.employeeCourse.findMany({
      where: whereClause,
      include: {
        course: true,
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: { assignedAt: "desc" },
    });

    return NextResponse.json(assignments);
  } catch (error) {
    console.error("Failed to fetch course assignments:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
