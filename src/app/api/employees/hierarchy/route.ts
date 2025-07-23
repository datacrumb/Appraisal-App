import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prsima";
import { isAdmin } from "@/lib/isAdmin";

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId || !(await isAdmin(userId))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    // Get admin ID (you might want to store this in environment or determine differently)
    const adminId = userId; // For now, using current user as admin

    // Fetch all employees with their relations
    const employees = await prisma.employee.findMany({
      include: {
        relationsFrom: {
          include: {
            to: true,
          },
        },
        relationsTo: {
          include: {
            from: true,
          },
        },
      },
    });

    // Fetch all relations
    const relations = await prisma.employeeRelation.findMany({
      include: {
        from: true,
        to: true,
      },
    });

    return NextResponse.json({
      employees,
      relations,
      adminId,
    });
  } catch (error) {
    console.error("Failed to fetch hierarchy data:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
} 