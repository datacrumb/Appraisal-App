import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prsima";
import { isAdmin } from "@/lib/isAdmin";
import { z } from "zod";


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

const addEmployeeSchema = z.object({
    id: z.string(),
    email: z.string().email(),
});

export async function POST(req: NextRequest) {
    const { userId } = await auth();
    if (!userId || !(await isAdmin(userId))) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const body = await req.json();
    const parsed = addEmployeeSchema.safeParse(body);
    if (!parsed.success) {
        return NextResponse.json({ error: "Invalid data", details: parsed.error }, { status: 400 });
    }
    const { id, email } = parsed.data;
    const employee = await prisma.employee.upsert({
        where: { id },
        update: { email },
        create: { id, email },
    });
    return NextResponse.json(employee, { status: 201 });
}

const removeEmployeeSchema = z.object({
    id: z.string(),
});

export async function DELETE(req: NextRequest) {
    const { userId } = await auth();
    if (!userId || !(await isAdmin(userId))) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const parsed = removeEmployeeSchema.safeParse(body);

    if (!parsed.success) {
        return NextResponse.json({ error: "Invalid data", details: parsed.error }, { status: 400 });
    }

    const { id } = parsed.data;

    try {
        // Prisma will cascade delete relations, assignments, and responses based on schema
        await prisma.employee.delete({
            where: { id },
        });
        return NextResponse.json({ message: "Employee removed successfully" }, { status: 200 });
    } catch (error) {
        console.error("Failed to remove employee:", error);
        return NextResponse.json({ error: "Failed to remove employee" }, { status: 500 });
    }
}