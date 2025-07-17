import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { isAdmin } from "@/lib/isAdmin";
import { fetchUsers } from "@/lib/fetchEmails";

export async function GET(req: NextRequest) {
  const { userId } = await auth(); // no await needed here

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!(await isAdmin(userId))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const filtered = await fetchUsers(userId);
    return NextResponse.json({ users: filtered });
  } catch (e: any) {
    return NextResponse.json(
      { error: e.message || "Failed to fetch users" },
      { status: 500 }
    );
  }
}
