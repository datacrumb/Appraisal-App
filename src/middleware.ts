import { NextResponse } from "next/server";
import {
  clerkMiddleware,
  createRouteMatcher,
} from "@clerk/nextjs/server";
import { isAdmin } from "./lib/isAdmin";
import { isEmployee } from "./lib/isEmployee";

// Matchers for admin and employee routes
const isAdminRoute = createRouteMatcher([
  "/api/forms(.*)",
  "/api/users(.*)",
  "/api/summaries(.*)",
  "/app/(Admin)(.*)"
]);
const isEmployeeRoute = createRouteMatcher([
  "/api/assignments(.*)",
  "/app/(Reviewer)(.*)",
  "/app/(Reviewee)(.*)"
]);
const isProtectedRoute = createRouteMatcher(["/api(.*)", "/(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();
  const url = req.nextUrl.clone();
  url.pathname = "/sign-in";

  // Allow sign-in and sign-up pages to be accessed without authentication
  if (req.nextUrl.pathname === "/sign-in" || req.nextUrl.pathname === "/sign-up") {
    return NextResponse.next();
  }

  // If the user is not logged in, redirect to /sign-in
  if (!userId) {
    return NextResponse.redirect(url.toString());
  }

  // Admin-only routes
  if (isAdminRoute(req)) {
    const isUserAdmin = await isAdmin(userId);
    if (!isUserAdmin) {
      return NextResponse.redirect(url.toString());
    }
  }

  // Employee-only routes
  if (isEmployeeRoute(req)) {
    const isUserEmployee = await isEmployee(userId);
    if (!isUserEmployee) {
      return NextResponse.redirect(url.toString());
    }
  }

  // For all other protected routes, just require authentication
  if (isProtectedRoute(req)) {
    return NextResponse.next();
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
  publicRoutes: ["/sign-in(.*)", "/sign-up(.*)"],
};