import { approveRequest } from "@/lib/sheets";
import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/isAdmin";
import { auth } from "@clerk/nextjs/server";

export async function POST(request: Request) {
    const { userId } = await auth();
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const isUserAdmin = await isAdmin(userId);
    if (!isUserAdmin) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
    try {
        const { rowNumber } = await request.json();
        if (!rowNumber || typeof rowNumber !== "number") {
            return NextResponse.json({ error: "Invalid row number" }, { status: 400 });
        }
        await approveRequest(rowNumber);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Failed to approve request:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
