import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prsima";
import { isCompanyEmail } from "@/lib/emailValidation";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { updateClerkProfilePicture } from "@/lib/clerkUtils";

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
    const phoneNumber = formData.get('phoneNumber') as string;
    const isManager = formData.get('isManager') as string;
    const isLead = formData.get('isLead') as string;
    const manager = formData.get('manager') as string;
    const profilePicture = formData.get('profilePicture') as File | null;

    let profilePictureUrl: string | null = null;

    // Handle profile picture file upload
    if (profilePicture && profilePicture instanceof File) {
      try {
        // Create a unique filename
        const fileExtension = profilePicture.name.split('.').pop();
        const fileName = `${user.id}-${Date.now()}.${fileExtension}`;
        
        // Save to public/uploads directory
        const uploadDir = join(process.cwd(), 'public', 'uploads');
        const filePath = join(uploadDir, fileName);
        
        // Ensure upload directory exists
        await mkdir(uploadDir, { recursive: true });
        
        // Convert File to Buffer and save
        const bytes = await profilePicture.arrayBuffer();
        const buffer = Buffer.from(bytes);
        await writeFile(filePath, buffer);
        
        // Store the URL path
        profilePictureUrl = `/uploads/${fileName}`;
        
        // Automatically update Clerk profile picture
        const fullImageUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}${profilePictureUrl}`;
        await updateClerkProfilePicture(user.id, fullImageUrl);
        
      } catch (error) {
        console.error("Failed to save profile picture:", error);
        // Continue without profile picture
      }
    }

    // Create onboarding request in database
    const onboardingRequest = await prisma.onboardingRequest.create({
      data: {
        userId: user.id,
        email: userEmail,
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        department,
        role,
        phoneNumber: phoneNumber || null,
        isManager: isManager === 'true',
        isLead: isLead === 'true',
        managerEmail: manager || null,
        profilePictureUrl,
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
