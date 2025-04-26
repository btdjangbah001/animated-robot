import Link from "next/link";
import {Download, Printer} from "lucide-react";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {cn} from "@/lib/utils";

const actions = [
  { href: "#", label: "Download", icon: Download },
  { href: "#", label: "Print Form", icon: Printer },
];

export function QuickActions() {
  return (
    <Card className="w-full shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-gray-900">
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {actions.map((action) => (
            <Link
              key={action.label}
              href={action.href}
              className={cn(
                "flex flex-col items-center justify-center p-4 rounded-lg transition-colors text-center",
                "bg-gray-50 text-gray-700 hover:bg-green-50 hover:text-green-700",
              )}
            >
              <action.icon className="h-6 w-6 mb-2" />
              <span className="text-sm font-medium">{action.label}</span>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
