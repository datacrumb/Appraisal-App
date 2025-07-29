import { NextRequest, NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prsima";
import { isEmployee } from "@/lib/isEmployee";
import { isAdmin } from "@/lib/isAdmin";

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!(await isEmployee(userId))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    // Find the actual admin in the system
    let adminId: string | null = null;
    
    // Get all employees and find the one with admin role
    const allEmployees = await prisma.employee.findMany();
    
    for (const employee of allEmployees) {
      try {
        const client = await clerkClient();
        const user = await client.users.getUser(employee.id);
        if (user.publicMetadata.role === "admin") {
          adminId = employee.id;
          break;
        }
      } catch (error) {
        console.error(`Error checking admin status for ${employee.id}:`, error);
      }
    }
    
    // If no admin found, return error
    if (!adminId) {
      return NextResponse.json({ error: "No admin found in the system" }, { status: 404 });
    }

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

    // Use profile pictures from database (no need to fetch from Clerk)
    const employeesWithProfiles = employees;

    // Fetch all relations
    const relations = await prisma.employeeRelation.findMany({
      include: {
        from: true,
        to: true,
      },
    });

    return NextResponse.json({
      employees: employeesWithProfiles,
      relations,
      adminId,
    });
  } catch (error) {
    console.error("Failed to fetch hierarchy data:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
} 