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
  ArrowUpRight 
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
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Nasiya Daftari</h2>
          <p className="text-muted-foreground">Keep track of who owes your business money.</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Record New Debt
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-none bg-primary/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-primary">Total Outstanding</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{pendingTotal.toLocaleString()} UZS</div>
            <p className="text-xs text-muted-foreground mt-1">Across {debts.filter(d => d.status === 'pending').length} people</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {debts.map((debt) => (
          <Card key={debt.id} className="relative overflow-hidden border-none bg-card/50 backdrop-blur-sm transition-all hover:translate-y-[-2px]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div className="space-y-1">
                <CardTitle className="text-lg">{debt.person}</CardTitle>
                <div className="flex items-center text-xs text-muted-foreground">
                  <Calendar className="mr-1 h-3 w-3" />
                  Due: {debt.dueDate}
                </div>
              </div>
              <div className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase ${
                debt.status === 'paid' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'
              }`}>
                {debt.status}
              </div>
            </CardHeader>
            <CardContent>
              <div className="mt-4 flex items-end justify-between">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Amount</p>
                  <p className="text-xl font-bold">{debt.amount.toLocaleString()} UZS</p>
                </div>
                {debt.status === 'pending' && (
                  <Button size="sm" variant="outline" className="h-8 text-xs">
                    Mark as Paid
                  </Button>
                )}
              </div>
            </CardContent>
            {debt.status === 'paid' && (
              <div className="absolute right-[-10px] bottom-[-10px] opacity-10">
                <CheckCircle2 className="h-24 w-24 text-emerald-500" />
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
