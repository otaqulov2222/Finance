"use client";

import { useState, useEffect } from "react";
import { 
  Target, 
  Plus, 
  Trash2, 
  TrendingUp,
  Calendar,
  Zap,
  Coins,
  ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

export default function GoalsPage() {
  const [goals, setGoals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isAddMoneyDialogOpen, setIsAddMoneyDialogOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<any>(null);
  const [newGoal, setNewGoal] = useState({ name: "", target_amount: "", deadline: "" });
  const [addAmount, setAddAmount] = useState("");

  const fetchGoals = () => {
    fetch('/api/goals')
      .then(res => res.json())
      .then(data => {
        setGoals(data);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const handleAddGoal = async () => {
    await fetch('/api/goals', {
      method: 'POST',
      body: JSON.stringify(newGoal)
    });
    setIsAddDialogOpen(false);
    fetchGoals();
  };

  const handleAddMoney = async () => {
    const newAmount = Number(selectedGoal.current_amount) + Number(addAmount);
    await fetch('/api/goals', {
      method: 'PUT',
      body: JSON.stringify({ id: selectedGoal.id, current_amount: newAmount })
    });
    setIsAddMoneyDialogOpen(false);
    setAddAmount("");
    fetchGoals();
  };

  const handleDelete = async (id: number) => {
    if (!confirm("O'chirishni xohlaysizmi?")) return;
    await fetch(`/api/goals?id=${id}`, { method: 'DELETE' });
    fetchGoals();
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black tracking-tighter bg-gradient-to-r from-primary to-emerald-400 bg-clip-text text-transparent uppercase italic">
            Mening Maqsadlarim
          </h2>
          <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] mt-1 italic">Kelajak uchun jamg'arma</p>
        </div>
        <Button 
          onClick={() => setIsAddDialogOpen(true)}
          className="bg-primary text-black font-black gap-2 rounded-xl hover:bg-emerald-400 shadow-[0_10px_20px_rgba(16,185,129,0.2)]"
        >
          <Plus className="h-4 w-4" /> Maqsad qo'shish
        </Button>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Zap className="h-8 w-8 animate-pulse text-primary" />
        </div>
      ) : goals.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 bg-card/20 rounded-3xl border border-white/5 border-dashed">
          <Target className="h-16 w-16 text-white/10 mb-4" />
          <p className="text-white/40 font-bold uppercase tracking-widest text-sm">Hozircha maqsadlar yo'q</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {goals.map((goal) => {
            const progress = Math.min(Math.round((goal.current_amount / goal.target_amount) * 100), 100);
            return (
              <Card key={goal.id} className="border-none bg-card/40 backdrop-blur-xl ring-1 ring-white/10 overflow-hidden relative group hover:translate-y-[-4px] transition-all duration-300">
                <div className="absolute top-0 left-0 w-full h-1 bg-white/5">
                  <div className="h-full bg-primary" style={{ width: `${progress}%` }} />
                </div>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-black text-white truncate">{goal.name}</CardTitle>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleDelete(goal.id)}
                      className="h-8 w-8 text-white/20 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                      <span className="text-white/40">Progress</span>
                      <span className="text-primary">{progress}%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-white/5 overflow-hidden">
                      <div className="h-full rounded-full bg-gradient-to-r from-primary to-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.5)] transition-all duration-1000" style={{ width: `${progress}%` }} />
                    </div>
                  </div>

                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-[9px] font-black text-white/20 uppercase tracking-widest mb-1">To'plandi</p>
                      <p className="text-xl font-black text-white tabular-nums">{Number(goal.current_amount).toLocaleString()} <span className="text-[10px] text-white/40">UZS</span></p>
                    </div>
                    <div className="text-right">
                      <p className="text-[9px] font-black text-white/20 uppercase tracking-widest mb-1">Maqsad</p>
                      <p className="text-sm font-bold text-white/60 tabular-nums">{Number(goal.target_amount).toLocaleString()} UZS</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-[10px] font-bold text-white/40 bg-white/5 p-2 rounded-lg">
                    <Calendar className="h-3 w-3" />
                    <span>Muddati: {goal.deadline ? new Date(goal.deadline).toLocaleDateString('uz-UZ') : 'Belgilanmagan'}</span>
                  </div>

                  <Button 
                    onClick={() => { setSelectedGoal(goal); setIsAddMoneyDialogOpen(true); }}
                    className="w-full bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold h-11 rounded-xl group-hover:bg-primary group-hover:text-black transition-all"
                  >
                    <Coins className="mr-2 h-4 w-4" /> Pul qo'shish
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Add Goal Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="border-white/10 bg-[#050505] backdrop-blur-2xl rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black bg-gradient-to-r from-primary to-emerald-400 bg-clip-text text-transparent uppercase">Yangi Maqsad</DialogTitle>
          </DialogHeader>
          <div className="grid gap-6 py-6">
            <div className="grid gap-2">
              <Label className="text-[10px] font-black uppercase tracking-widest opacity-40">Maqsad nomi</Label>
              <Input placeholder="Masalan: Yangi Mashina" value={newGoal.name} onChange={(e) => setNewGoal({...newGoal, name: e.target.value})} className="bg-white/5 border-white/10 h-12 font-bold" />
            </div>
            <div className="grid gap-2">
              <Label className="text-[10px] font-black uppercase tracking-widest opacity-40">Kerakli summa</Label>
              <Input type="number" placeholder="50 000 000" value={newGoal.target_amount} onChange={(e) => setNewGoal({...newGoal, target_amount: e.target.value})} className="bg-white/5 border-white/10 h-12 font-black text-lg" />
            </div>
            <div className="grid gap-2">
              <Label className="text-[10px] font-black uppercase tracking-widest opacity-40">Muddati</Label>
              <Input type="date" value={newGoal.deadline} onChange={(e) => setNewGoal({...newGoal, deadline: e.target.value})} className="bg-white/5 border-white/10 h-12 font-bold" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsAddDialogOpen(false)}>Bekor qilish</Button>
            <Button onClick={handleAddGoal} className="bg-primary text-black font-black px-8">Saqlash</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Money Dialog */}
      <Dialog open={isAddMoneyDialogOpen} onOpenChange={setIsAddMoneyDialogOpen}>
        <DialogContent className="border-white/10 bg-[#050505] backdrop-blur-2xl rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-white uppercase tracking-tighter italic">Jamg'armaga pul qo'shish</DialogTitle>
          </DialogHeader>
          <div className="py-6">
            <div className="p-6 rounded-3xl bg-primary/10 border border-primary/20 mb-6 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">Maqsad</p>
                <p className="text-lg font-black text-white">{selectedGoal?.name}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">Joriy holat</p>
                <p className="text-lg font-black text-white">{Number(selectedGoal?.current_amount).toLocaleString()} UZS</p>
              </div>
            </div>
            <div className="grid gap-2">
              <Label className="text-[10px] font-black uppercase tracking-widest opacity-40">Qo'shiladigan summa</Label>
              <Input type="number" placeholder="1 000 000" value={addAmount} onChange={(e) => setAddAmount(e.target.value)} className="bg-white/5 border-white/10 h-14 text-2xl font-black text-primary" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsAddMoneyDialogOpen(false)}>Bekor qilish</Button>
            <Button onClick={handleAddMoney} className="bg-primary text-black font-black px-10 h-12 rounded-xl">Qo'shish <ArrowRight className="ml-2 h-4 w-4" /></Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
