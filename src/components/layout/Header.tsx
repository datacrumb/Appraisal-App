"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser, SignInButton, SignedIn, UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { FileText, Users, Menu } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

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
  const [sheetOpen, setSheetOpen] = useState(false);

  const NavigationLinks = () => (
    <>
      {adminNav.map((link, index) => {
        const IconComponent = link.icon;
        const isActive = pathname === link.href;

        return (
          <Link key={index} href={link.href} onClick={() => setSheetOpen(false)}>
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
  );

  return (
    <nav className="w-full flex items-center justify-between px-6 py-3 border-b bg-white">
      <div className="flex items-center gap-3">
        {isLoaded && isAdmin && (
          <>
            {/* Desktop Navigation - Hidden on small screens */}
            <div className="hidden md:flex items-center gap-3">
              <NavigationLinks />
            </div>
            
            {/* Mobile Navigation - Sheet */}
            <div className="md:hidden">
              <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="md:hidden">
                    <Menu className="w-5 h-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[250px] sm:w-[300px]">
                  <SheetHeader>
                    <SheetTitle>Navigation</SheetTitle>
                  </SheetHeader>
                  <div className="flex flex-col gap-2 mt-6">
                    <NavigationLinks />
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </>
        )}
      </div>

      <div className="flex items-center gap-4">
        {isLoaded ? (
          <>
          <SignedIn>
            <UserButton />
          </SignedIn>
          <Link href="/assignments">
            <Button variant="link">
              Assignments
            </Button>
          </Link>
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