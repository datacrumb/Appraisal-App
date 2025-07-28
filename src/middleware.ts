import { NextResponse } from "next/server";
import type { NextRequest } from 'next/server';
import { clerkClient, clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { isCompanyEmail } from "@/lib/emailValidation";

const isPublicRoute = createRouteMatcher([
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/onboarding(.*)",
  "/api/onboarding(.*)",
  "/api/managers(.*)",
  "/api/auth/session(.*)",
  "/api/auth/check-approval(.*)",
]);

const isAdminRoute = createRouteMatcher([
  "/(Admin)(.*)", 
  "/api/approvals(.*)",
  "/forms(.*)",
  "/management(.*)",
  "/responses(.*)"
]);

// TODO: Add employees routes and check if user is employee

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

  // Check if user is admin first (for all routes)
  const { isAdmin } = await import('./lib/isAdmin');
  const isUserAdmin = await isAdmin(userId);
  
  // If user is admin, allow access to all routes regardless of approval status
  if (isUserAdmin) {
    return NextResponse.next();
  }

  // For admin routes, redirect non-admin users to home
  if (isAdminRoute(req)) {
    const homeUrl = new URL("/", req.url);
    return NextResponse.redirect(homeUrl);
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