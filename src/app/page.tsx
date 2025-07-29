import Dashboard from "@/components/dashboard/Dashboard";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prsima";
import { redirect } from "next/navigation";

export default async function Home() {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }

  // Fetch user profile and employee data server-side
  const [userProfile, employeeData] = await Promise.all([
    prisma.employee.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        department: true,
        role: true,
        isManager: true,
        isLead: true,
        profilePictureUrl: true,
        createdAt: true,
      }
    }),
    prisma.employee.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        department: true,
        role: true,
        isManager: true,
        isLead: true,
        profilePictureUrl: true,
        createdAt: true,
      }
    })
  ]);

  // Calculate years of experience for user profile
  const yearsOfExperience = userProfile ? Math.floor(
    (Date.now() - new Date(userProfile.createdAt).getTime()) / (1000 * 60 * 60 * 24 * 365)
  ) : 1;

  const transformedUserProfile = userProfile ? {
    ...userProfile,
    yearsOfExperience: Math.max(yearsOfExperience, 1),
    createdAt: userProfile.createdAt.toISOString(),
  } : null;

  const transformedEmployeeData = employeeData.map(emp => ({
    ...emp,
    createdAt: emp.createdAt.toISOString(),
  }));

  return (
    <Dashboard 
      initialUserProfile={transformedUserProfile}
      initialEmployeeData={transformedEmployeeData}
    />
  );
}

// Add ISR for dashboard data
export const revalidate = 300; // Revalidate every 5 minutes
