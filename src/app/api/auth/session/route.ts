import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prsima";

export async function GET() {
  try {
    const user = await currentUser();
    
    if (!user) {
      return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
    }

    const userId = user.id;
    
    // Check if user has submitted onboarding request
    const onboardingRequest = await prisma.onboardingRequest.findUnique({
      where: { userId: userId },
    });

    const hasSubmitted = !!onboardingRequest;
    const isApproved = onboardingRequest?.status === 'APPROVED';

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
