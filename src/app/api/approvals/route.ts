import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prsima";
import { isAdmin } from "@/lib/isAdmin";

export async function GET() {
  const { userId } = await auth();
  if (!userId || !(await isAdmin(userId))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const pendingRequests = await prisma.onboardingRequest.findMany({
      where: { status: 'PENDING' },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json({ requests: pendingRequests });
  } catch (error) {
    console.error("Failed to fetch pending requests:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId || !(await isAdmin(userId))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { requestId } = await request.json();
    
    // Get the onboarding request
    const onboardingRequest = await prisma.onboardingRequest.findUnique({
      where: { id: requestId },
    });

    if (!onboardingRequest) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    // Check if employee already exists
    const existingEmployee = await prisma.employee.findUnique({
      where: { id: onboardingRequest.userId },
    });

    let employee;
    if (existingEmployee) {
      // Update existing employee
      employee = await prisma.employee.update({
        where: { id: onboardingRequest.userId },
        data: {
          email: onboardingRequest.email,
          firstName: onboardingRequest.firstName,
          lastName: onboardingRequest.lastName,
          department: onboardingRequest.department,
          role: onboardingRequest.role,
          isManager: onboardingRequest.isManager,
          isLead: onboardingRequest.isLead,
        },
      });
    } else {
      // Create new employee
      employee = await prisma.employee.create({
        data: {
          id: onboardingRequest.userId,
          email: onboardingRequest.email,
          firstName: onboardingRequest.firstName,
          lastName: onboardingRequest.lastName,
          department: onboardingRequest.department,
          role: onboardingRequest.role,
          isManager: onboardingRequest.isManager,
          isLead: onboardingRequest.isLead,
        },
      });
    }

    // Auto-assign manager relation if specified
    if (onboardingRequest.managerEmail) {
      const manager = await prisma.employee.findUnique({
        where: { email: onboardingRequest.managerEmail },
      });

      if (manager) {
        // Use upsert to avoid duplicate relation errors
        await prisma.employeeRelation.upsert({
          where: {
            fromId_toId_type: {
              fromId: manager.id,
              toId: employee.id,
              type: 'MANAGER',
            },
          },
          update: {},
          create: {
            fromId: manager.id,
            toId: employee.id,
            type: 'MANAGER',
          },
        });
      }
    }

    // Auto-assign LEAD relations if employee is a lead
    if (onboardingRequest.isLead) {
      // Find employees in the same department who are not leads
      const departmentEmployees = await prisma.employee.findMany({
        where: {
          department: onboardingRequest.department,
          isLead: false,
          id: { not: employee.id },
        },
      });

      for (const deptEmp of departmentEmployees) {
        await prisma.employeeRelation.upsert({
          where: {
            fromId_toId_type: {
              fromId: employee.id,
              toId: deptEmp.id,
              type: 'LEAD',
            },
          },
          update: {},
          create: {
            fromId: employee.id,
            toId: deptEmp.id,
            type: 'LEAD',
          },
        });
      }
    }

    // Update onboarding request status
    await prisma.onboardingRequest.update({
      where: { id: requestId },
      data: {
        status: 'APPROVED',
        approvedAt: new Date(),
        approvedBy: userId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to approve request:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
