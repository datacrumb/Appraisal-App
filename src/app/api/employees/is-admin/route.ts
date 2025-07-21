import { NextRequest, NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";
import { isAdmin } from "@/lib/isAdmin";

export async function GET(req: NextRequest) {
  try {
    // Get Clerk client
    const client = await clerkClient();
    // Fetch all users from Clerk (paginated response)
    const usersResponse = await client.users.getUserList();
    const users = usersResponse.data;
    for (const user of users) {
      if (await isAdmin(user.id)) {
        return NextResponse.json({ adminId: user.id });
      }
    }
    return NextResponse.json({ error: "No admin found" }, { status: 404 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Failed to fetch admin" }, { status: 500 });
  }
}
