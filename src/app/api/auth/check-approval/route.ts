import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { isUserApproved } from "@/lib/sheets";

export async function GET(request: Request) {
  try {
    const user = await currentUser();
    
    if (!user) {
      return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
    }

    const userId = user.id;
    const isApproved = await isUserApproved(userId);

    return NextResponse.json({
      isApproved: isApproved,
      userId: userId,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
} 