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
  "/api/leads(.*)",
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

  // Check if user is approved first (for all routes)
  const checkApprovalUrl = new URL('/api/auth/check-approval', req.url);
  const approvalResponse = await fetch(checkApprovalUrl, {
    headers: { 'Cookie': req.headers.get('Cookie') || '' },
  });

  let isApproved = false;
  if (approvalResponse.ok) {
    const approvalData = await approvalResponse.json();
    isApproved = approvalData.isApproved;
  }

  // Check if user is admin in Clerk metadata
  const { isAdmin } = await import('./lib/isAdmin');
  const isUserAdmin = await isAdmin(userId);
  
  // For admin routes, only allow if user is both approved AND admin
  if (isAdminRoute(req)) {
    if (!isApproved || !isUserAdmin) {
      const homeUrl = new URL("/", req.url);
      return NextResponse.redirect(homeUrl);
    }
    return NextResponse.next();
  }

  // For non-admin routes, check if user is approved
  if (!isApproved && req.nextUrl.pathname !== '/onboarding') {
    const onboardingUrl = new URL("/onboarding", req.url);
    return NextResponse.redirect(onboardingUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};