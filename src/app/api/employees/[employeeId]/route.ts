import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prsima";
import { isAdmin } from "@/lib/isAdmin";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ employeeId: string }> }
) {
  const { userId } = await auth();
  if (!userId || !(await isAdmin(userId))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { employeeId } = await params;
    const body = await req.json();
    
    const { department, role, isManager, isLead } = body;

    // Validate the employee exists
    const existingEmployee = await prisma.employee.findUnique({
      where: { id: employeeId },
    });

    if (!existingEmployee) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 });
    }

    // Update the employee
    const updatedEmployee = await prisma.employee.update({
      where: { id: employeeId },
      data: {
        department: department || null,
        role: role || null,
        isManager: isManager || false,
        isLead: isLead || false,
      },
    });

    return NextResponse.json(updatedEmployee);
  } catch (error) {
    console.error("Failed to update employee:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ employeeId: string }> }
) {
  const { userId } = await auth();
  if (!userId || !(await isAdmin(userId))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { employeeId } = await params;

    // Validate the employee exists
    const existingEmployee = await prisma.employee.findUnique({
      where: { id: employeeId },
      include: {
        relationsFrom: true,
        relationsTo: true,
      },
    });

    if (!existingEmployee) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 });
    }

    // Store employee data for potential undo
    const employeeData = {
      ...existingEmployee,
      relationsFrom: existingEmployee.relationsFrom,
      relationsTo: existingEmployee.relationsTo,
    };

    // Use a transaction to ensure all related data is deleted atomically
    await prisma.$transaction(async (tx) => {
      // Delete all relations where this employee is the source (fromId)
      await tx.employeeRelation.deleteMany({
        where: { fromId: employeeId },
      });

      // Delete all relations where this employee is the target (toId)
      await tx.employeeRelation.deleteMany({
        where: { toId: employeeId },
      });

      // Delete all assignments for this employee (but keep responses)
      await tx.assignment.deleteMany({
        where: { employeeId: employeeId },
      });

      // Finally, delete the employee
      await tx.employee.delete({
        where: { id: employeeId },
      });
    });

    return NextResponse.json({ 
      success: true, 
      message: "Employee and all related data deleted successfully",
      deletedRelations: existingEmployee.relationsFrom.length + existingEmployee.relationsTo.length,
      employeeData: employeeData // Include for undo functionality
    });
  } catch (error) {
    console.error("Failed to delete employee:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
} 