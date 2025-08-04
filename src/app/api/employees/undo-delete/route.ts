import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prsima";
import { isAdmin } from "@/lib/isAdmin";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId || !(await isAdmin(userId))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { employeeData } = await req.json();

    if (!employeeData) {
      return NextResponse.json({ error: "Employee data is required" }, { status: 400 });
    }

    // Use a transaction to restore the employee and all relations
    const restoredEmployee = await prisma.$transaction(async (tx) => {
      // Restore the employee
      const employee = await tx.employee.create({
        data: {
          id: employeeData.id,
          email: employeeData.email,
          firstName: employeeData.firstName,
          lastName: employeeData.lastName,
          department: employeeData.department,
          role: employeeData.role,
          isManager: employeeData.isManager,
          isLead: employeeData.isLead,
          profilePictureUrl: employeeData.profilePictureUrl,
          createdAt: employeeData.createdAt,
        },
      });

      // Restore relations where this employee was the source
      for (const relation of employeeData.relationsFrom) {
        await tx.employeeRelation.create({
          data: {
            id: relation.id,
            fromId: relation.fromId,
            toId: relation.toId,
            type: relation.type,
          },
        });
      }

      // Restore relations where this employee was the target
      for (const relation of employeeData.relationsTo) {
        await tx.employeeRelation.create({
          data: {
            id: relation.id,
            fromId: relation.fromId,
            toId: relation.toId,
            type: relation.type,
          },
        });
      }

      return employee;
    });

    return NextResponse.json({ 
      success: true, 
      message: "Employee restored successfully",
      employee: restoredEmployee
    });
    
  } catch (error) {
    console.error("Failed to restore employee:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
} 