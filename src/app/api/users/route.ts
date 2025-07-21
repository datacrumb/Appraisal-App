import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { isAdmin } from "@/lib/isAdmin";
import { clerkClient } from "@clerk/nextjs/server";

export async function GET(req: NextRequest) {
  const { userId } = await auth(); // no await needed here

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!(await isAdmin(userId))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const usersResponse = await (await clerkClient()).users.getUserList();
    const users = usersResponse.data.map((u: any) => ({
      id: u.id,
      email: u.emailAddresses?.[0]?.emailAddress || "",
      firstName: u.firstName,
      lastName: u.lastName,
      imageUrl: u.imageUrl,
    }));
    return NextResponse.json({ users });
  } catch (e: any) {
    return NextResponse.json(
      { error: e.message || "Failed to fetch users" },
      { status: 500 }
    );
  }
}
