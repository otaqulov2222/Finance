"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  History, 
  Settings,
  TrendingUp,
  Zap,
  Target,
  ChevronRight
} from "lucide-react";

const menuItems = [
  { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { name: "Transactions", href: "/dashboard/transactions", icon: History },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-64 flex-col border-r border-white/5 bg-black/40 backdrop-blur-2xl">
      <div className="flex h-20 items-center px-6">
        <div className="flex items-center gap-3 group cursor-pointer">
          <div className="rounded-xl bg-gradient-to-br from-primary to-emerald-400 p-2 shadow-[0_0_15px_rgba(var(--primary),0.5)] group-hover:scale-110 transition-transform duration-300">
            <TrendingUp className="h-5 w-5 text-black" />
          </div>
          <span className="text-xl font-black tracking-tighter bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            UzFinance
          </span>
        </div>
      </div>

      <div className="flex-1 px-4 py-6 space-y-2">
        <p className="px-4 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 mb-4">
          Menu
        </p>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group flex items-center justify-between rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-300",
                isActive 
                  ? "bg-primary/10 text-primary shadow-[inset_0_0_20px_rgba(var(--primary),0.05)] ring-1 ring-primary/20" 
                  : "text-muted-foreground hover:bg-white/5 hover:text-white"
              )}
            >
              <div className="flex items-center gap-3">
                <Icon className={cn("h-5 w-5 transition-transform duration-300 group-hover:scale-110", isActive ? "text-primary" : "opacity-70")} />
                {item.name}
              </div>
              {isActive && <ChevronRight className="h-4 w-4 animate-in slide-in-from-left-2 duration-300" />}
            </Link>
          );
        })}
      </div>

      <div className="p-4 mt-auto">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/20 to-emerald-500/10 p-5 border border-primary/20 group">
          <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
            <Target className="h-24 w-24" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="h-4 w-4 text-primary fill-primary animate-pulse" />
              <p className="text-[10px] font-black uppercase tracking-widest text-primary">Pro Status</p>
            </div>
            <p className="text-xs font-bold text-white mb-3 leading-relaxed">
              Telegram bot orqali moliya tahlilini boshlang.
            </p>
            <button className="w-full py-2 rounded-lg bg-primary text-black text-[10px] font-black uppercase tracking-widest hover:bg-emerald-400 transition-colors">
              Connect Bot
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
