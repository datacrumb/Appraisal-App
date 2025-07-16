import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { clerkClient } from "@clerk/nextjs/server";
import { isAdmin } from "@/lib/isAdmin";

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!(await isAdmin(userId))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    // Fetch all users from Clerk
    const client = await clerkClient();

    const users = (await client.users.getUserList()).data;
    // Filter out admin
    const filtered = users.filter((u) => u.id !== userId).map((u) => ({
      id: u.id,
      email: u.emailAddresses?.[0]?.emailAddress || "",
    }));
    return NextResponse.json({ users: filtered });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Failed to fetch users" }, { status: 500 });
  }
} 