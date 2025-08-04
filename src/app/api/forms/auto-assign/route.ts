import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prsima";
import { isAdmin } from "@/lib/isAdmin";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isAdmin(userId)) {
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

    // Get the existing forms by ID
    const managerForm = await prisma.form.findUnique({
      where: { id: "manager-form" },
    });

    const employeeForm = await prisma.form.findUnique({
      where: { id: "employee-form" },
    });

    if (!managerForm || !employeeForm) {
      return NextResponse.json({ 
        error: "Please create both Manager and Employee forms first in the Forms Management page" 
      }, { status: 400 });
    }

    const assignments = [];

    // Find managers and leads
    const managers = employees.filter(emp => emp.isManager && !emp.isLead);
    const leads = employees.filter(emp => emp.isLead);
    const regularEmployees = employees.filter(emp => !emp.isManager && !emp.isLead);

    if (managers.length === 0 && leads.length === 0) {
      return NextResponse.json({ 
        error: "No managers or leads found to assign forms to" 
      }, { status: 400 });
    }

    // 1. MANAGER EVALUATIONS (Bottom-Up): Employees evaluate their direct manager
    for (const manager of managers) {
      // Find employees who directly report to this manager
      const managerRelations = relations.filter(rel => 
        rel.fromId === manager.id && rel.type === "MANAGER"
      );

      for (const relation of managerRelations) {
        const employee = relation.to;
        
        // Verify employee exists and is not a lead (leads don't evaluate managers)
        const employeeExists = employees.find(emp => emp.id === employee.id);
        if (!employeeExists || employeeExists.isLead) {
          continue;
        }
        
        // Assign Manager Form to employee (to evaluate their direct manager)
        const managerEvaluationAssignment = await prisma.assignment.upsert({
          where: {
            id: `manager-eval-${employee.id}-${manager.id}-${managerForm.id}`,
          },
          update: {
            assignedAt: new Date(),
          },
          create: {
            id: `manager-eval-${employee.id}-${manager.id}-${managerForm.id}`,
            employeeId: employee.id,
            formId: managerForm.id,
            employeeEmail: employee.email,
            assignedAt: new Date(),
            evaluationTarget: {
              type: "MANAGER",
              targetId: manager.id,
              targetName: `${manager.firstName || ''} ${manager.lastName || ''}`.trim() || manager.email,
              targetRole: "Manager",
              targetDepartment: manager.department || "Unknown"
            }
          },
        });

        assignments.push(managerEvaluationAssignment);
      }
    }

    // 2. LEAD EVALUATIONS (Bottom-Up): Employees evaluate their direct lead
    for (const lead of leads) {
      // Find employees who directly report to this lead
      const leadRelations = relations.filter(rel => 
        rel.fromId === lead.id && rel.type === "LEAD"
      );

      for (const relation of leadRelations) {
        const employee = relation.to;
        
        // Verify employee exists and is not a manager
        const employeeExists = employees.find(emp => emp.id === employee.id);
        if (!employeeExists || employeeExists.isManager) {
          continue;
        }
        
        // Assign Employee Form to employee (to evaluate their direct lead)
        const leadEvaluationAssignment = await prisma.assignment.upsert({
          where: {
            id: `lead-eval-${employee.id}-${lead.id}-${employeeForm.id}`,
          },
          update: {
            assignedAt: new Date(),
          },
          create: {
            id: `lead-eval-${employee.id}-${lead.id}-${employeeForm.id}`,
            employeeId: employee.id,
            formId: employeeForm.id,
            employeeEmail: employee.email,
            assignedAt: new Date(),
            evaluationTarget: {
              type: "LEAD",
              targetId: lead.id,
              targetName: `${lead.firstName || ''} ${lead.lastName || ''}`.trim() || lead.email,
              targetRole: "Lead",
              targetDepartment: lead.department || "Unknown"
            }
          },
        });

        assignments.push(leadEvaluationAssignment);
      }
    }

    // 3. EMPLOYEE EVALUATIONS (Top-Down): Managers evaluate their direct reports
    for (const manager of managers) {
      // Find employees who directly report to this manager
      const managerRelations = relations.filter(rel => 
        rel.fromId === manager.id && rel.type === "MANAGER"
      );

      for (const relation of managerRelations) {
        const employee = relation.to;
        
        // Verify employee exists
        const employeeExists = employees.find(emp => emp.id === employee.id);
        if (!employeeExists) {
          continue;
        }
        
        // Assign Employee Form to manager (to evaluate this specific employee)
        const employeeEvaluationAssignment = await prisma.assignment.upsert({
          where: {
            id: `employee-eval-${manager.id}-${employee.id}-${employeeForm.id}`,
          },
          update: {
            assignedAt: new Date(),
          },
          create: {
            id: `employee-eval-${manager.id}-${employee.id}-${employeeForm.id}`,
            employeeId: manager.id,
            formId: employeeForm.id,
            employeeEmail: manager.email,
            assignedAt: new Date(),
            evaluationTarget: {
              type: "EMPLOYEE",
              targetId: employee.id,
              targetName: `${employee.firstName || ''} ${employee.lastName || ''}`.trim() || employee.email,
              targetRole: employee.role || "Employee",
              targetDepartment: employee.department || "Unknown"
            }
          },
        });

        assignments.push(employeeEvaluationAssignment);
      }
    }

    // 4. LEAD EVALUATIONS (Top-Down): Leads evaluate their direct reports
    for (const lead of leads) {
      // Find employees who directly report to this lead
      const leadRelations = relations.filter(rel => 
        rel.fromId === lead.id && rel.type === "LEAD"
      );

      for (const relation of leadRelations) {
        const employee = relation.to;
        
        // Verify employee exists
        const employeeExists = employees.find(emp => emp.id === employee.id);
        if (!employeeExists) {
          continue;
        }
        
        // Assign Employee Form to lead (to evaluate this specific employee)
        const employeeEvaluationAssignment = await prisma.assignment.upsert({
          where: {
            id: `employee-eval-${lead.id}-${employee.id}-${employeeForm.id}`,
          },
          update: {
            assignedAt: new Date(),
          },
          create: {
            id: `employee-eval-${lead.id}-${employee.id}-${employeeForm.id}`,
            employeeId: lead.id,
            formId: employeeForm.id,
            employeeEmail: lead.email,
            assignedAt: new Date(),
            evaluationTarget: {
              type: "EMPLOYEE",
              targetId: employee.id,
              targetName: `${employee.firstName || ''} ${employee.lastName || ''}`.trim() || employee.email,
              targetRole: employee.role || "Employee",
              targetDepartment: employee.department || "Unknown"
            }
          },
        });

        assignments.push(employeeEvaluationAssignment);
      }
    }

    // 5. ADMIN EVALUATIONS: Admin evaluates all positions directly under him
    // Find all employees who directly report to admin
    const adminRelations = relations.filter(rel => 
      rel.fromId === admin.id && (rel.type === "MANAGER" || rel.type === "LEAD")
    );

    for (const relation of adminRelations) {
      const employee = relation.to;
      
      // Verify employee exists
      const employeeExists = employees.find(emp => emp.id === employee.id);
      if (!employeeExists) {
        continue;
      }
      
      // Determine the role for display
      let role = "Employee";
      if (employeeExists.isManager && !employeeExists.isLead) {
        role = "Manager";
      } else if (employeeExists.isLead) {
        role = "Lead";
      }
      
      // Assign Employee Form to admin (to evaluate this employee)
      const adminEvaluationAssignment = await prisma.assignment.upsert({
        where: {
          id: `admin-eval-${admin.id}-${employee.id}-${employeeForm.id}`,
        },
        update: {
          assignedAt: new Date(),
        },
        create: {
          id: `admin-eval-${admin.id}-${employee.id}-${employeeForm.id}`,
          employeeId: admin.id,
          formId: employeeForm.id,
          employeeEmail: admin.email,
          assignedAt: new Date(),
          evaluationTarget: {
            type: "EMPLOYEE",
            targetId: employee.id,
            targetName: `${employee.firstName || ''} ${employee.lastName || ''}`.trim() || employee.email,
            targetRole: role,
            targetDepartment: employee.department || "Unknown"
          }
        },
      });

      assignments.push(adminEvaluationAssignment);
    }

    return NextResponse.json({
      success: true,
      message: `360-degree evaluations assigned successfully to ${assignments.length} assignments`,
      assignments: assignments.length,
      breakdown: {
        managerEvaluations: assignments.filter(a => a.id.includes('manager-eval')).length,
        leadEvaluations: assignments.filter(a => a.id.includes('lead-eval')).length,
        employeeEvaluations: assignments.filter(a => a.id.includes('employee-eval')).length,
        adminEvaluations: assignments.filter(a => a.id.includes('admin-eval')).length
      }
    });

  } catch (error) {
    console.error("Form assignment error:", error);
    return NextResponse.json(
      { error: "Failed to assign forms" },
      { status: 500 }
    );
  }
} 