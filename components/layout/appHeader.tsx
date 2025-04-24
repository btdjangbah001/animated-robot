"use client";

import Link from "next/link";
import {Download, GraduationCap, LogOut, User,} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Avatar, AvatarFallback} from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {cn} from "@/lib/utils";
import useApplicationStore from "@/store/applicationStore";
import {useEffect} from "react";
import useAuthStore from "@/store/authStore";

const navItems = [
  {
    href: "/downloads",
    label: "Download",
    icon: Download,
    activeSlug: "/downloads",
  },
];

export function AppHeader() {
  const applicationId = useApplicationStore(state => state.applicationId);
  const application = useApplicationStore(state => state.application);
  const fetchApplication = useApplicationStore(state => state.fetchApplication);
  const logout = useAuthStore(state => state.logout);

  useEffect(() => {
    if (!application) fetchApplication().then(()=>{})
  }, [application, applicationId, fetchApplication]);

  const currentPath = "/application/form";

  const handleLogout = () => {
    logout();
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
                <p className="text-sm font-medium leading-none">{application?.applicant?.firstName + " " + application?.applicant?.lastName}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {application?.applicant?.email}
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
                    <span>{item.label}</span>
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
