"use client"; // If using hooks like usePathname

import Link from "next/link";
// import { usePathname } from 'next/navigation'; // Use this for active state logic
import {
  LayoutDashboard,
  FileText,
  Download,
  Bell,
  Printer,
} from "lucide-react";
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
  }, // Example: Match broader path
  {
    href: "/downloads",
    label: "Download",
    icon: Download,
    activeSlug: "/downloads",
  },
  {
    href: "/notifications",
    label: "Notifications",
    icon: Bell,
    activeSlug: "/notifications",
  },
  { href: "/print", label: "Print Form", icon: Printer, activeSlug: "/print" },
];

export function SidebarNav() {
  // TODO: Implement proper active state detection, e.g., using usePathname
  // const pathname = usePathname();
  const currentPath = "/application/form";

  return (
    <aside className="bg-white rounded-lg shadow-sm p-4 md:p-6 h-fit">
      <nav>
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = currentPath.startsWith(item.activeSlug);
            return (
              <li key={item.label}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                    isActive
                      ? "bg-[#e1ebf8] text-[#131236]"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
