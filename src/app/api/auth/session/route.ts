import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { hasUserSubmitted, isUserApproved } from "@/lib/sheets";

export async function GET() {
  try {
    const user = await currentUser();
    
    if (!user) {
      return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
    }

    const userId = user.id;
    const hasSubmitted = await hasUserSubmitted(userId);
    const isApproved = await isUserApproved(userId);

    return NextResponse.json({
      hasSubmitted: hasSubmitted,
      isApproved: isApproved,
    });
  } catch (error) {
    console.error("Error in auth session:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
