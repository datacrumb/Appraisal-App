import { NextResponse } from "next/server";
import {
  clerkMiddleware,
  createRouteMatcher,
} from "@clerk/nextjs/server";
import { isAdmin } from "./lib/isAdmin";

const isProtectedRoute = createRouteMatcher(["/api(.*)", "/(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();
  const url = req.nextUrl.clone(); // Clone the current request URL
  url.pathname = "/sign-in"; // Set the new pathname

  // Allow sign-in page to be accessed without authentication
  if (req.nextUrl.pathname === "/sign-in" || req.nextUrl.pathname === '/sign-up') {
    return NextResponse.next();
  }

  // If the user is not logged in, redirect to /sign-in
  if (!userId) {
    return NextResponse.redirect(url.toString()); // Convert to absolute URL
  }

  // For all routes, check if the user is an admin
  if (isProtectedRoute(req)) {
    const isUserAdmin = await isAdmin(userId);
    if (!isUserAdmin) {
      // Deny access if the user is not an admin
      return NextResponse.redirect(url.toString());
    }
  }

  // If the user is authenticated and authorized, proceed with the request
  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
  publicRoutes: ["/sign-in(.*)", "/sign-up(.*)"],
};