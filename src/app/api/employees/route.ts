import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prsima";
import { isAdmin } from "@/lib/isAdmin";


export async function GET(req: NextRequest) {
    const { userId } = await auth();

    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!(await isAdmin(userId))) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    
    // Fetch all employees and their relations
    const employees = await prisma.employee.findMany();
    return NextResponse.json({ employees });
}