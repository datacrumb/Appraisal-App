"use client";

import React from "react";
import Link from "next/link";
import { useUser, SignInButton, SignOutButton, SignedIn, UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

const adminNav = [
  { name: "Assign", href: "/assign" },
  { name: "Employee Hierarchy", href: "/hierarchy-graph" },
  { name: "Responses", href: "/responses" },
  { name: "Approvals", href: "/approvals" },
]

const Header = () => {
  const { user, isLoaded } = useUser();
  const isAdmin = user?.publicMetadata?.role === "admin";
  const isEmployee = user?.publicMetadata?.role === "employee";

  return (
    <nav className="w-full flex items-center justify-between px-6 py-4 border-b bg-white">
      <div className="flex items-center gap-6">
        <Link href="/">
          <span className="font-bold text-lg">Appraisal App</span>
        </Link>
        {isLoaded && isAdmin && (
          <div className="flex items-center gap-4">
            {adminNav.map((link, index) => (
              <Link key={index} href={link.href}>
                <Button variant="link">{link.name}</Button>
              </Link>
            ))}
          </div>
        )}
      </div>
      <div className="flex items-center gap-6">
        {isLoaded && isEmployee && (
          <Link href="/assignments">
            <Button variant="ghost">Assignments</Button>
          </Link>
        )}
      </div>
      <div className="flex items-center gap-4">
        {isLoaded ? (
          <>
            <SignedIn>
              <UserButton />
            </SignedIn>
            <SignOutButton>
              <Button variant="outline">Sign Out</Button>
            </SignOutButton>
          </>
        ) : (
          <SignInButton>
            <Button>Sign In</Button>
          </SignInButton>
        )}
      </div>
    </nav>
  );
}

export default Header;