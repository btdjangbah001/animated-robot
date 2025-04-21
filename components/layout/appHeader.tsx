"use client";

import Link from "next/link";
// import { usePathname } from 'next/navigation'; // Keep for active state if needed
import {
  Bell,
  GraduationCap,
  User,
  LayoutDashboard,
  FileText,
  Download,
  Printer,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const navItems = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    activeSlug: "/dashboard",
  },
  {
    href: "/application/form",
    label: "My Form",
    icon: FileText,
    activeSlug: "/application",
  },
  {
    href: "/downloads",
    label: "Download",
    icon: Download,
    activeSlug: "/downloads",
  },
  { href: "/print", label: "Print Form", icon: Printer, activeSlug: "/print" },
];

export function AppHeader() {
  // TODO: Replace with actual user data and notification count
  const notificationCount = 3;
  const userName = "Applicant Name";
  // const pathname = usePathname(); // Get current path for active state
  const currentPath = "/application/form"; // Placeholder

  const handleLogout = () => {
    console.log("Logging out...");
  };

  return (
    <header className="flex justify-between items-center mb-8 pb-4 border-b border-gray-200">
      <Link href="/" className="flex items-center gap-3 group">
        <GraduationCap className="h-8 w-8 text-green-500 group-hover:text-green-600 transition-colors" />
        <div>
          <h1 className="text-xl font-bold text-green-600 group-hover:text-green-700 transition-colors">
            MOH HTI Portal
          </h1>
          <p className="text-sm text-gray-500">HTI Management System</p>
        </div>
      </Link>

      <div className="flex items-center gap-4 md:gap-6">
        <Button
          variant="ghost"
          size="icon"
          className="relative rounded-full h-10 w-10"
        >
          <Bell className="h-5 w-5 text-gray-600" />
          {notificationCount > 0 && (
            <span className="absolute top-0 right-0 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-medium text-white">
              {notificationCount}
            </span>
          )}
          <span className="sr-only">Notifications</span>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Avatar className="h-10 w-10 cursor-pointer">
              <AvatarFallback className="bg-gray-200 text-gray-600 font-medium">
                <User className="h-5 w-5" />
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>

          <DropdownMenuContent className="w-56 mr-4" align="end">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{userName}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  user@example.com
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {navItems.map((item) => {
              const isActive = currentPath.startsWith(item.activeSlug);
              return (
                <DropdownMenuItem
                  key={item.label}
                  asChild
                  className={cn(isActive && "bg-green-50")}
                >
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-2 cursor-pointer",
                      isActive ? "text-green-700 font-medium" : "text-gray-700",
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Link>
                </DropdownMenuItem>
              );
            })}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleLogout}
              className="flex items-center gap-2 cursor-pointer text-red-600 focus:bg-red-50 focus:text-red-700"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
