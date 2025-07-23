import { NextResponse } from "next/server";
import { prisma } from "@/lib/prsima";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const department = searchParams.get('department');

    let managers;
    if (department) {
      // Fetch managers from specific department
      const departmentEmployees = await prisma.employee.findMany({
        where: {
          department: department,
          OR: [
            { isManager: true },
            { isLead: true }
          ]
        },
      });
      
      // Also fetch all managers and leads (including CEO/Admin) for department managers to connect to
      const allManagers = await prisma.employee.findMany({
        where: {
          OR: [
            { isManager: true },
            { isLead: true }
          ]
        },
      });
      
      // Combine department managers with all managers (CEO/Admin)
      managers = [...departmentEmployees, ...allManagers];
      
      // Remove duplicates based on id
      const uniqueManagers = managers.filter((manager, index, self) => 
        index === self.findIndex(m => m.id === manager.id)
      );
      
      managers = uniqueManagers;
    } else {
      // Fetch all managers and leads
      managers = await prisma.employee.findMany({
        where: {
          OR: [
            { isManager: true },
            { isLead: true }
          ]
        },
      });
    }

    // Transform to match expected format
    const transformedManagers = managers.map(emp => ({
      userId: emp.id,
      name: `${emp.firstName || ''} ${emp.lastName || ''}`.trim() || emp.email,
      email: emp.email,
      department: emp.department || '',
      role: emp.role || '',
      isManager: emp.isManager,
      isLead: emp.isLead,
    }));

    return NextResponse.json({ managers: transformedManagers });
  } catch (error) {
    console.error("Error fetching managers:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
