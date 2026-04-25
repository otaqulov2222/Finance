"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  Plus, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  Target,
  Zap,
  ChevronRight,
  HandCoins
} from "lucide-react";

const initialDebts = [
  { id: "1", person: "Anvar aka", amount: 1200000, dueDate: "2024-06-01", status: "pending" },
  { id: "2", person: "Mijoz #42", amount: 450000, dueDate: "2024-05-25", status: "pending" },
  { id: "3", person: "Dilya Opa", amount: 3000000, dueDate: "2024-05-15", status: "paid" },
];

export default function DebtsPage() {
  const [debts, setDebts] = useState(initialDebts);

  const pendingTotal = debts.filter(d => d.status === 'pending').reduce((acc, d) => acc + d.amount, 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-emerald-400 bg-clip-text text-transparent">
            Nasiya Daftari
          </h2>
          <p className="text-muted-foreground font-medium">Biznesingizdan qarzdor bo'lganlar ro'yxati.</p>
        </div>
        <Button className="bg-primary text-black font-bold h-12 px-6 hover:bg-emerald-400 shadow-lg shadow-primary/20 rounded-xl">
          <Plus className="mr-2 h-4 w-4" /> Yangi Nasiya Qo'shish
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-none bg-primary/10 backdrop-blur-xl ring-1 ring-primary/20 shadow-2xl relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
            <HandCoins className="h-24 w-24 text-primary" />
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-black uppercase tracking-widest text-primary opacity-80">Umumiy Nasiyalar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-primary tabular-nums">{pendingTotal.toLocaleString()} UZS</div>
            <p className="text-[10px] font-bold text-muted-foreground mt-2 uppercase tracking-tighter">
              Jami {debts.filter(d => d.status === 'pending').length} kishi qarzdor
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {debts.map((debt) => (
          <Card key={debt.id} className="relative overflow-hidden border-none bg-card/40 backdrop-blur-xl transition-all hover:translate-y-[-4px] hover:shadow-2xl ring-1 ring-white/10 group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <div className="space-y-1.5">
                <CardTitle className="text-xl font-bold text-white group-hover:text-primary transition-colors">
                  {debt.person}
                </CardTitle>
                <div className="flex items-center text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                  <Calendar className="mr-2 h-3.5 w-3.5 text-primary" />
                  Muddat: {debt.dueDate}
                </div>
              </div>
              <div className={`rounded-lg px-2.5 py-1.5 text-[10px] font-black uppercase tracking-widest shadow-sm ring-1 ${
                debt.status === 'paid' 
                  ? 'bg-emerald-500/10 text-emerald-400 ring-emerald-500/20' 
                  : 'bg-amber-500/10 text-amber-400 ring-amber-500/20'
              }`}>
                {debt.status === 'paid' ? 'To\'landi' : 'Kutilmoqda'}
              </div>
            </CardHeader>
            <CardContent>
              <div className="mt-2 flex items-end justify-between border-t border-white/5 pt-6">
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-black mb-1.5">Summa</p>
                  <p className="text-2xl font-black text-white tabular-nums">{debt.amount.toLocaleString()} UZS</p>
                </div>
                {debt.status === 'pending' ? (
                  <Button size="sm" variant="outline" className="h-10 rounded-xl px-4 border-white/10 bg-white/5 hover:bg-primary hover:text-black hover:border-primary transition-all font-bold text-xs">
                    To'landi qilish
                  </Button>
                ) : (
                  <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  </div>
                )}
              </div>
            </CardContent>
            {debt.status === 'paid' && (
              <div className="absolute right-[-20px] bottom-[-20px] opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-700">
                <CheckCircle2 className="h-40 w-40 text-emerald-500" />
              </div>
            )}
          </Card>
        ))}
      </div>

      <div className="pt-8">
        <div className="relative group overflow-hidden rounded-2xl bg-white/5 border border-white/10 p-6 backdrop-blur-md">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-emerald-500/20 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
          <div className="relative flex items-center gap-6">
            <div className="rounded-2xl bg-primary/20 p-4">
              <Zap className="h-6 w-6 text-primary animate-pulse" />
            </div>
            <div>
              <p className="text-sm font-bold text-white mb-1">AI Maslahati:</p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Nasiyalaringizning 30% muddati o'tib ketgan. Mijozlar bilan bog'lanib, to'lovlarni eslatishni tavsiya etamiz.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
