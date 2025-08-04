import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prsima";

export async function GET(request: Request) {
  try {
    const user = await currentUser();
    
    if (!user) {
      return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
    }

    const userId = user.id;
    
    // Check if user has an approved onboarding request
    const onboardingRequest = await prisma.onboardingRequest.findUnique({
      where: { userId: userId },
    });

    const isApproved = onboardingRequest?.status === 'APPROVED';

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