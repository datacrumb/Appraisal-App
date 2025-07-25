import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prsima";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Check if user is admin
    const admin = await prisma.employee.findUnique({
      where: { id: userId },
    });

    if (!admin || !admin.isManager) {
      return NextResponse.json({ error: "Only admins can assign forms" }, { status: 403 });
    }

    // Get all employees and their relations
    const employees = await prisma.employee.findMany({
      where: { id: { not: userId } }, // Exclude admin
    });

    if (employees.length === 0) {
      return NextResponse.json({ 
        error: "No employees found to assign forms to" 
      }, { status: 400 });
    }

    const relations = await prisma.employeeRelation.findMany({
      include: {
        from: true,
        to: true,
      },
    });

    // Create or get the two static forms
    const form1 = await prisma.form.upsert({
      where: { id: "manager-form" },
      update: {},
      create: {
        id: "manager-form",
        title: "Manager Assessment Form",
        description: "Form for manager evaluations",
        questions: {}, // Empty JSON for now
        createdBy: userId,
      },
    });

    const form2 = await prisma.form.upsert({
      where: { id: "employee-form" },
      update: {},
      create: {
        id: "employee-form",
        title: "Employee Performance Form",
        description: "Form for employee performance reviews",
        questions: {}, // Empty JSON for now
        createdBy: userId,
      },
    });

    const assignments = [];

    // Find managers (employees with isManager = true)
    const managers = employees.filter(emp => emp.isManager);

    if (managers.length === 0) {
      return NextResponse.json({ 
        error: "No managers found to assign forms to" 
      }, { status: 400 });
    }

    for (const manager of managers) {
      // Assign Form1 to manager
      const managerAssignment = await prisma.assignment.upsert({
        where: {
          id: `manager-${manager.id}-${form1.id}`,
        },
        update: {
          assignedAt: new Date(),
        },
        create: {
          id: `manager-${manager.id}-${form1.id}`,
          employeeId: manager.id,
          formId: form1.id,
          employeeEmail: manager.email,
          assignedAt: new Date(),
        },
      });

      assignments.push(managerAssignment);

      // Find employees under this manager
      const managerRelations = relations.filter(rel => 
        rel.fromId === manager.id && rel.type === "MANAGER"
      );

      for (const relation of managerRelations) {
        const employee = relation.to;
        
        // Verify employee exists in Employee table
        const employeeExists = employees.find(emp => emp.id === employee.id);
        if (!employeeExists) {
          console.warn(`Employee ${employee.id} not found in Employee table, skipping assignment`);
          continue;
        }
        
        // Assign Form2 to employees under this manager
        const employeeAssignment = await prisma.assignment.upsert({
          where: {
            id: `employee-${employee.id}-${form2.id}`,
          },
          update: {
            assignedAt: new Date(),
          },
          create: {
            id: `employee-${employee.id}-${form2.id}`,
            employeeId: employee.id,
            formId: form2.id,
            employeeEmail: employee.email,
            assignedAt: new Date(),
          },
        });

        assignments.push(employeeAssignment);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Forms assigned successfully to ${assignments.length} employees`,
      assignments: assignments.length,
      managers: managers.length,
    });

  } catch (error) {
    console.error("Form assignment error:", error);
    return NextResponse.json(
      { error: "Failed to assign forms" },
      { status: 500 }
    );
  }
} 