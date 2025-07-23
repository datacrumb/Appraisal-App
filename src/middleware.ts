import { NextResponse } from "next/server";
import type { NextRequest } from 'next/server';
import { clerkClient, clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { isCompanyEmail } from "@/lib/emailValidation";

const isPublicRoute = createRouteMatcher([
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/onboarding(.*)",
  "/api/onboarding(.*)",
  "/api/departments(.*)",
  "/api/managers(.*)",
  "/api/auth/session(.*)",
  "/api/auth/verify(.*)",
  "/api/auth/check-approval(.*)",
]);

const isAdminRoute = createRouteMatcher(["/(Admin)(.*)", "/api/approvals(.*)"]);

export default clerkMiddleware(async (auth, req: NextRequest) => {
  if (isPublicRoute(req)) {
    return NextResponse.next();
  }

  const { userId } = await auth();
  if (!userId) {
    const signInUrl = new URL("/sign-in", req.url);
    signInUrl.searchParams.set("redirect_url", req.url);
    return NextResponse.redirect(signInUrl);
  }

  // Get user details to check email
  const clerk = await clerkClient();
  const user = await clerk.users.getUser(userId);
  const userEmail = user.emailAddresses?.[0]?.emailAddress;

  // If not company email, redirect to onboarding
  if (!userEmail || !isCompanyEmail(userEmail)) {
    const onboardingUrl = new URL("/onboarding", req.url);
    return NextResponse.redirect(onboardingUrl);
  }

  // For admin routes, check if user is admin first
  if (isAdminRoute(req)) {
    const { isAdmin } = await import('./lib/isAdmin');
    const isUserAdmin = await isAdmin(userId);
    console.log(`User ${userId} is admin: ${isUserAdmin}`);
    
    if (!isUserAdmin) {
      const homeUrl = new URL("/", req.url);
      return NextResponse.redirect(homeUrl);
    }
    // If user is admin, allow access to admin routes regardless of approval status
    return NextResponse.next();
  }

  // For non-admin routes, check if user is approved
  const checkApprovalUrl = new URL('/api/auth/check-approval', req.url);
  const approvalResponse = await fetch(checkApprovalUrl, {
    headers: { 'Cookie': req.headers.get('Cookie') || '' },
  });

  if (approvalResponse.ok) {
    const { isApproved } = await approvalResponse.json();
    
    if (!isApproved && req.nextUrl.pathname !== '/onboarding') {
      const onboardingUrl = new URL("/onboarding", req.url);
      return NextResponse.redirect(onboardingUrl);
    } else {
      return NextResponse.next();
    }
  }
  
  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};