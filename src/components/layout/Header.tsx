"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser, SignInButton, SignedIn, UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { FileText, Users } from "lucide-react";

const adminNav = [
  { name: "Dashboard", href: "/", icon: null },
  { name: "Assign", href: "/assign", icon: FileText },
  { name: "Employee Hierarchy", href: "/hierarchy-graph", icon: Users },
  { name: "Responses", href: "/responses", icon: FileText },
  { name: "Approvals", href: "/approvals", icon: FileText },
]

const Header = () => {
  const pathname = usePathname();
  const { user, isLoaded } = useUser();
  const isAdmin = user?.publicMetadata?.role === "admin";

  return (
    <nav className="w-full flex items-center justify-between px-6 py-3 border-b bg-white">
      <div className="flex items-center gap-3">
        {isLoaded && isAdmin && (
          <>
            {adminNav.map((link, index) => {
              const IconComponent = link.icon;
              const isActive = pathname === link.href;

              return (
                <Link key={index} href={link.href}>
                  <Button
                    className={`rounded-full transition-colors ${isActive
                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                        : 'hover:bg-gray-100'
                      }`}
                    variant="ghost"
                  >
                    {IconComponent && <IconComponent className="w-4 h-4 mr-2" />}
                    {link.name}
                  </Button>
                </Link>
              );
            })}
          </>
        )}
      </div>

      <div className="flex items-center gap-4">
        {isLoaded ? (
          <SignedIn>
            <UserButton />
          </SignedIn>
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