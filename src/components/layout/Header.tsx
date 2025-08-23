"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser, SignInButton, SignedIn, UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { FileText, Users, Menu, ClipboardList, Home, FileCheck, BookOpen } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useEmployee } from "@/lib/useEmployee";

const adminNav = [
  { name: "Dashboard", href: "/", icon: null },
  { name: "Forms", href: "/forms", icon: ClipboardList },
  { name: "Employee Hierarchy", href: "/hierarchy-graph", icon: Users },
  { name: "My Assignments", href: "/assignments", icon: FileCheck },
  { name: "Responses", href: "/responses", icon: FileText },
  { name: "Employee Management", href: "/management", icon: FileText },
  { name: "Course Management", href: "/courses", icon: BookOpen },
];

const employeeNav = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "Employee Hierarchy", href: "/hierarchy-graph", icon: Users },
  { name: "My Assignments", href: "/assignments", icon: FileCheck },
];

const Header = () => {
  const pathname = usePathname();
  const { user, isLoaded } = useUser();
  const { isEmployee, employeeData, loading: employeeLoading } = useEmployee();
  const isAdmin = user?.publicMetadata?.role === "admin";
  const [sheetOpen, setSheetOpen] = useState(false);

  const NavigationLinks = () => {
    const navItems = isAdmin ? adminNav : isEmployee ? employeeNav : [];
    
    return (
      <>
        {navItems.map((link, index) => {
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
  };

  return (
    <nav className="w-full flex items-center justify-between px-6 py-3 border-b bg-white">
      <div className="flex items-center gap-3">
        {isLoaded && !employeeLoading && (isAdmin || isEmployee) && (
          <>
            {/* Desktop Navigation - Hidden on small screens */}
            <div className="hidden lg:flex items-center gap-2">
              <NavigationLinks />
            </div>
            
            {/* Mobile Navigation - Sheet */}
            <div className="lg:hidden">
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
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-md">Welcome, {user?.firstName}</h1>
            </div>
            <SignedIn>
              <UserButton />
            </SignedIn>
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