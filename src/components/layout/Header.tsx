"use client";

import React from "react";
import Link from "next/link";
import { useUser, SignInButton, SignOutButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

const Header = () => {
  const { user, isLoaded } = useUser();
  const isAdmin = user?.publicMetadata?.role === "admin";

  return (
    <nav className="w-full flex items-center justify-between px-6 py-4 border-b bg-white">
      <div className="flex items-center gap-6">
        <Link href="/">
          <span className="font-bold text-lg">Appraisal App</span>
        </Link>
        {isLoaded && isAdmin && (
          <Link href="/assign">
            <Button variant="ghost">Assign</Button>
          </Link>
        )}
      </div>
      <div>
        {isLoaded && user ? (
          <SignOutButton>
            <Button variant="outline">Sign Out</Button>
          </SignOutButton>
        ) : (
          <SignInButton>
            <Button>Sign In</Button>
          </SignInButton>
        )}
      </div>
    </nav>
  );
};

export default Header;