import { NextResponse } from "next/server";
import { fetchManagersAndLeads, fetchDepartmentEmployees } from "@/lib/sheets";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const department = searchParams.get('department');

    let managers;
    if (department) {
      // Fetch managers from specific department
      const departmentEmployees = await fetchDepartmentEmployees(department);
      const departmentManagers = departmentEmployees.filter(emp => emp.isManager || emp.isLead);
      
      // Also fetch all managers and leads (including CEO/Admin) for department managers to connect to
      const allManagers = await fetchManagersAndLeads();
      
      // Combine department managers with all managers (CEO/Admin)
      managers = [...departmentManagers, ...allManagers];
      
      // Remove duplicates based on userId
      const uniqueManagers = managers.filter((manager, index, self) => 
        index === self.findIndex(m => m.userId === manager.userId)
      );
      
      managers = uniqueManagers;
    } else {
      // Fetch all managers and leads
      managers = await fetchManagersAndLeads();
    }

    return NextResponse.json({ managers });
  } catch (error) {
    console.error("Error fetching managers:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
