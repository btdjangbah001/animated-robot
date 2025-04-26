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
import {usePathname} from 'next/navigation';

const headerNavItems = [
  { href: '/portal/download', label: 'Download', icon: Download, activeSlug: '/downloads' },
];

const dropdownNavItems: any[] = [];


export function AppHeader() {
  const application = useApplicationStore(state => state.application);
  const fetchApplication = useApplicationStore(state => state.fetchApplication);
  const logout = useAuthStore(state => state.logout);
  const pathname = usePathname();

  useEffect(() => {
    if (!application) {
      fetchApplication().then(() => {});
    }
  }, [application, fetchApplication]);


  const handleLogout = () => {
    logout();
  };

  return (
      <header className="flex flex-wrap items-center justify-between gap-y-4 mb-8 pb-4 border-b border-gray-200">
        <Link href="/" className="flex items-center gap-3 group">
          <GraduationCap className="h-8 w-8 text-green-500 group-hover:text-green-600 transition-colors" />
          <div>
            <h1 className="text-xl font-bold text-green-600 group-hover:text-green-700 transition-colors">
              MOH HTI Portal
            </h1>
            <p className="text-sm text-gray-500">HTI Management System</p>
          </div>
        </Link>

        <div className="flex items-center gap-2 md:gap-4">

          <nav className="hidden md:flex items-center gap-1">
            {headerNavItems.map((item) => {
              if (!item.label || !item.icon) return null;

              const isActive = pathname === item.href || (item.activeSlug && pathname.startsWith(item.activeSlug));
              return (
                  <Link key={item.label} href={item.href} legacyBehavior passHref>
                    <Button
                        variant="ghost"
                        size="sm"
                        className={cn(
                            "h-9 px-3 flex items-center gap-2 cursor-pointer",
                            isActive
                                ? "bg-green-50 text-green-700 font-semibold"
                                : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                        )}
                    >
                      <item.icon className="h-4 w-4" />
                      <span className="text-sm">{item.label}</span>
                    </Button>
                  </Link>
              );
            })}
          </nav>
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
                  <p className="text-sm font-medium leading-none truncate">{application?.applicant?.firstName} {application?.applicant?.lastName}</p>
                  <p className="text-xs leading-none text-muted-foreground truncate">
                    {application?.applicant?.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />

              {dropdownNavItems.map((item) => {
                const isActive = pathname === item.href || (item.activeSlug && pathname.startsWith(item.activeSlug));
                return (
                    <DropdownMenuItem key={item.label} asChild className={cn(isActive && 'bg-green-50')}>
                      <Link href={item.href} className={cn("flex items-center gap-2 cursor-pointer w-full", isActive ? 'text-green-700 font-medium' : 'text-gray-700')}>
                        {item.icon && <item.icon className="h-4 w-4" />}
                        <span>{item.label}</span>
                      </Link>
                    </DropdownMenuItem>
                );
              })}

              <div className="md:hidden">
                {(dropdownNavItems.length > 0 || headerNavItems.filter(item => item.icon).length > 0) && <DropdownMenuSeparator />}
                {headerNavItems.map((item) => {
                  if (!item.label || !item.icon) return null;
                  const isActive = pathname === item.href || (item.activeSlug && pathname.startsWith(item.activeSlug));
                  return (
                      <DropdownMenuItem key={`mobile-${item.label}`} asChild className={cn(isActive && 'bg-green-50')}>
                        <Link href={item.href} className={cn("flex items-center gap-2 cursor-pointer w-full", isActive ? 'text-green-700 font-medium' : 'text-gray-700')}>
                          <item.icon className="h-4 w-4" />
                          <span>{item.label}</span>
                        </Link>
                      </DropdownMenuItem>
                  );
                })}
              </div>


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
