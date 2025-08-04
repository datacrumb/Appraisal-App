import { NextResponse } from "next/server";
import { prisma } from "@/lib/prsima";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const department = searchParams.get('department');

    // Build the where clause
    const whereClause: any = {
      isLead: true,
    };

    // Add department filter if provided
    if (department) {
      whereClause.department = department;
    }

    const leads = await prisma.employee.findMany({
      where: whereClause,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        department: true,
        role: true,
      },
      orderBy: {
        firstName: 'asc',
      },
    });

    // Format the response
    const formattedLeads = leads.map(lead => ({
      userId: lead.id,
      name: `${lead.firstName} ${lead.lastName}`.trim() || lead.email,
      email: lead.email,
      department: lead.department,
      role: lead.role,
    }));

    return NextResponse.json({
      leads: formattedLeads,
    });
  } catch (error) {
    console.error("Error fetching leads:", error);
    return NextResponse.json(
      { error: "Failed to fetch leads" },
      { status: 500 }
    );
  }
} 