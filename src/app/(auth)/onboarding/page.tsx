import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { OnboardingForm } from "@/components/auth/OnboardingForm";
import { isCompanyEmail } from "@/lib/emailValidation";
import { SignOutButton } from "@clerk/nextjs";
import { prisma } from "@/lib/prsima";

async function checkApproval(userId: string) {
  try {
    // Check directly in database instead of calling API
    const onboardingRequest = await prisma.onboardingRequest.findUnique({
      where: { userId: userId },
    });
    
    return onboardingRequest?.status === 'APPROVED';
  } catch (error) {
    console.error('Error checking approval:', error);
    return false;
  }
}

export default async function OnboardingPage() {
  const user = await currentUser();
  if (!user) redirect("/sign-in");

  const approved = await checkApproval(user.id);
  if (approved) {
    redirect("/");
  }

  // Get user email
  const userEmail = user.emailAddresses?.[0]?.emailAddress;

  // Check if user has company email
  if (!userEmail || !isCompanyEmail(userEmail)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md dark:bg-gray-800 text-center">
          <div className="text-red-600 dark:text-red-400">
            <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Company Email Required
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Please sign up or log in with your company email address to access this application.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500">
            Current email: {userEmail || "No email found"}
          </p>
          <div className="pt-4">
            <SignOutButton />
          </div>
        </div>
      </div>
    );
  }

  return (
    <OnboardingForm />
  );
}
