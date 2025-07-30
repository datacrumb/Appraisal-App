import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prsima";

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // First check if user exists in Employee table
    const employee = await prisma.employee.findUnique({
      where: { id: userId },
    });

    if (employee) {
      // Calculate years of experience based on createdAt
      const yearsOfExperience = Math.floor(
        (Date.now() - new Date(employee.createdAt).getTime()) / (1000 * 60 * 60 * 24 * 365)
      );

      return NextResponse.json({
        id: employee.id,
        email: employee.email,
        phoneNumber: employee.phoneNumber,
        firstName: employee.firstName,
        lastName: employee.lastName,
        department: employee.department,
        role: employee.role,
        isManager: employee.isManager,
        isLead: employee.isLead,
        profilePictureUrl: employee.profilePictureUrl,
        yearsOfExperience: Math.max(yearsOfExperience, 1), // Minimum 1 year
        createdAt: employee.createdAt,
      });
    }

    // If not in Employee table, check OnboardingRequest
    const onboardingRequest = await prisma.onboardingRequest.findUnique({
      where: { userId: userId },
    });

    console.log('🔍 API: OnboardingRequest found:', !!onboardingRequest);
    if (onboardingRequest) {
      console.log('🔍 API: OnboardingRequest data:', {
        userId: onboardingRequest.userId,
        email: onboardingRequest.email,
        phoneNumber: onboardingRequest.phoneNumber,
        firstName: onboardingRequest.firstName,
        lastName: onboardingRequest.lastName
      });
      // Calculate years of experience based on createdAt
      const yearsOfExperience = Math.floor(
        (Date.now() - new Date(onboardingRequest.createdAt).getTime()) / (1000 * 60 * 60 * 24 * 365)
      );

      return NextResponse.json({
        id: onboardingRequest.userId,
        email: onboardingRequest.email,
        phoneNumber: onboardingRequest.phoneNumber,
        firstName: onboardingRequest.firstName,
        lastName: onboardingRequest.lastName,
        department: onboardingRequest.department,
        role: onboardingRequest.role,
        isManager: onboardingRequest.isManager,
        isLead: onboardingRequest.isLead,
        profilePictureUrl: onboardingRequest.profilePictureUrl,
        yearsOfExperience: Math.max(yearsOfExperience, 1), // Minimum 1 year
        createdAt: onboardingRequest.createdAt,
        status: onboardingRequest.status,
      });
    }

    // If user not found in either table, return basic info
    return NextResponse.json({
      id: userId,
      email: "",
      phoneNumber: "",
      firstName: "",
      lastName: "",
      department: "",
      role: "",
      isManager: false,
      isLead: false,
      profilePictureUrl: null,
      yearsOfExperience: 1,
      createdAt: new Date(),
    });

  } catch (error) {
    console.error("Failed to fetch user profile:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
} 