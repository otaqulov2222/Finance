"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  ArrowLeftRight, 
  History, 
  Wallet, 
  Users, 
  Settings,
  TrendingUp
} from "lucide-react";

const menuItems = [
  { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { name: "Transactions", href: "/dashboard/transactions", icon: History },
  { name: "Nasiya (Debts)", href: "/dashboard/debts", icon: Users },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-64 flex-col border-r bg-card text-card-foreground">
      <div className="flex h-16 items-center border-b px-6">
        <TrendingUp className="mr-2 h-6 w-6 text-primary" />
        <span className="text-xl font-bold tracking-tight">UzFinance</span>
      </div>
      <div className="flex-1 space-y-1 p-4">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                pathname === item.href ? "bg-accent text-accent-foreground" : "text-muted-foreground"
              )}
            >
              <Icon className="mr-3 h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </div>
      <div className="border-t p-4">
        <div className="rounded-lg bg-primary/10 p-3">
          <p className="text-xs font-medium text-primary">Need help?</p>
          <p className="mt-1 text-xs text-muted-foreground leading-tight">
            Connect your Telegram bot to start tracking.
          </p>
        </div>
      </div>
    </div>
  );
}
