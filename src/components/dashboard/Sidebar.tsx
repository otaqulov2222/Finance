"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  History, 
  Settings, 
  LogOut, 
  TrendingUp,
  CreditCard,
  MessageSquare,
  ShieldCheck,
  X,
  Target,
  Tags
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const menuItems = [
  { icon: LayoutDashboard, label: "Asosiy", href: "/dashboard" },
  { icon: History, label: "Amallar", href: "/dashboard/transactions" },
  { icon: CreditCard, label: "Nasiyalar", href: "/dashboard/debts" },
  { icon: Target, label: "Maqsadlar", href: "/dashboard/goals" },
  { icon: Tags, label: "Kategoriyalar", href: "/dashboard/categories" },
  { icon: Settings, label: "Sozlamalar", href: "/dashboard/settings" },
];

export function Sidebar({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-full flex-col bg-[#050505] border-r border-white/5 p-6 animate-in slide-in-from-left duration-500">
      <div className="flex items-center justify-between mb-10">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute -inset-1 bg-primary blur opacity-20 animate-pulse"></div>
            <div className="relative bg-primary p-2 rounded-xl">
              <TrendingUp className="h-6 w-6 text-black" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="font-black text-xl tracking-tighter text-white leading-none">UzFinance</span>
            <span className="text-[10px] font-bold text-primary uppercase tracking-[0.2em]">Business Pro</span>
          </div>
        </div>
        {onClose && (
          <Button variant="ghost" size="icon" onClick={onClose} className="lg:hidden text-white/40 hover:text-white">
            <X className="h-5 w-5" />
          </Button>
        )}
      </div>

      <div className="space-y-1 flex-1">
        <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] mb-4 px-3">Boshqaruv Paneli</p>
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={onClose}
            className={cn(
              "flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-300 group relative",
              pathname === item.href 
                ? "bg-primary/10 text-primary shadow-[0_0_20px_rgba(var(--primary),0.1)] border border-primary/20" 
                : "text-white/40 hover:text-white hover:bg-white/5"
            )}
          >
            {pathname === item.href && (
              <div className="absolute left-0 w-1 h-6 bg-primary rounded-r-full" />
            )}
            <item.icon className={cn(
              "h-5 w-5 transition-transform duration-300 group-hover:scale-110",
              pathname === item.href ? "text-primary" : "text-inherit"
            )} />
            <span className="font-bold text-sm">{item.label}</span>
            {pathname === item.href && (
              <div className="ml-auto">
                <div className="h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_10px_#10b981]" />
              </div>
            )}
          </Link>
        ))}
      </div>

      <div className="mt-auto space-y-4">
        <div className="rounded-2xl bg-gradient-to-br from-emerald-500/10 to-primary/5 p-5 border border-primary/10 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-125 transition-transform duration-700">
            <MessageSquare className="h-12 w-12" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest text-primary">Status: Aktiv</span>
            </div>
            <p className="text-[11px] text-white/60 font-medium mb-4 leading-relaxed">Bot orqali tahlillarni boshlang.</p>
            <Link 
              href="https://t.me/uz_finance_manager_bot" 
              target="_blank"
              className="block w-full"
            >
              <Button className="w-full bg-primary text-black font-black text-[11px] uppercase tracking-widest h-10 hover:bg-emerald-400 transition-all shadow-[0_10px_20px_rgba(16,185,129,0.2)]">
                Botga o'tish
              </Button>
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-3 px-4 py-4 rounded-2xl bg-white/5 border border-white/5 group hover:bg-white/10 transition-all cursor-pointer">
          <div className="relative">
            <div className="h-10 w-10 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center overflow-hidden">
              <ShieldCheck className="h-6 w-6 text-white/60 group-hover:text-primary transition-colors" />
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-500 border-2 border-[#050505]" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-bold text-white truncate">Admin</span>
            <span className="text-[10px] font-medium text-white/40 uppercase tracking-tighter truncate">Boshqaruvchi</span>
          </div>
        </div>
      </div>
    </div>
  );
}
