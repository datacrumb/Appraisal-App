import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prsima";
import { isCompanyEmail } from "@/lib/emailValidation";

export async function POST(request: Request) {
  const user = await currentUser();
  if (!user) {
    return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
  }

  const userEmail = user.emailAddresses?.[0]?.emailAddress;
  if (!userEmail || !isCompanyEmail(userEmail)) {
    return NextResponse.json({ error: "Unauthorized email domain" }, { status: 403 });
  }

  try {
    const formData = await request.formData();
    const department = formData.get('department') as string;
    const role = formData.get('role') as string;
    const isManager = formData.get('isManager') as string;
    const isLead = formData.get('isLead') as string;
    const manager = formData.get('manager') as string;

    // Create onboarding request in database
    const onboardingRequest = await prisma.onboardingRequest.create({
      data: {
        userId: user.id,
        email: userEmail,
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        department,
        role,
        isManager: isManager === 'true',
        isLead: isLead === 'true',
        managerEmail: manager || null,
        status: 'PENDING', // PENDING, APPROVED, REJECTED
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to submit onboarding request:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
