"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { 
  Users, 
  Plus, 
  Calendar, 
  CheckCircle2, 
  Target,
  Zap,
  HandCoins,
  Pencil,
  Trash2,
  AlertCircle
} from "lucide-react";

export default function DebtsPage() {
  const [debts, setDebts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingDebt, setEditingDebt] = useState<any>(null);
  
  // Form states
  const [form, setForm] = useState({
    person: "",
    amount: "",
    due_date: "",
    status: "pending"
  });

  const fetchDebts = () => {
    setLoading(true);
    fetch('/api/debts')
      .then(res => res.json())
      .then(d => {
        setDebts(Array.isArray(d) ? d : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchDebts();
  }, []);

  const handleAdd = async () => {
    try {
      const res = await fetch('/api/debts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          ...form, 
          amount: Number(form.amount),
          due_date: form.due_date || null 
        })
      });
      if (res.ok) {
        setIsAddOpen(false);
        setForm({ person: "", amount: "", due_date: "", status: "pending" });
        fetchDebts();
      } else {
        const error = await res.json();
        alert("Xatolik: " + (error.error || "Saqlashda muammo bo'ldi") + (error.detail ? "\nSabab: " + error.detail : ""));
      }
    } catch (error) {
      console.error("Add error", error);
      alert("Server bilan bog'lanishda xatolik!");
    }
  };

  const handleUpdate = async () => {
    try {
      const res = await fetch(`/api/debts/${editingDebt.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          ...form, 
          amount: Number(form.amount),
          due_date: form.due_date || null 
        })
      });
      if (res.ok) {
        setIsEditOpen(false);
        fetchDebts();
      } else {
        const error = await res.json();
        alert("Xatolik: " + (error.error || "Yangilashda muammo bo'ldi"));
      }
    } catch (error) {
      console.error("Update error", error);
      alert("Server bilan bog'lanishda xatolik!");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Ushbu nasiyani o'chirishni tasdiqlaysizmi?")) return;
    try {
      const res = await fetch(`/api/debts/${id}`, { method: 'DELETE' });
      if (res.ok) fetchDebts();
    } catch (error) {
      console.error("Delete error", error);
    }
  };

  const toggleStatus = async (debt: any) => {
    const newStatus = debt.status === 'paid' ? 'pending' : 'paid';
    try {
      await fetch(`/api/debts/${debt.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...debt, status: newStatus })
      });
      fetchDebts();
    } catch (error) {
      console.error("Status toggle error", error);
    }
  };

  const pendingTotal = debts.filter(d => d.status === 'pending').reduce((acc, d) => acc + Number(d.amount), 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-emerald-400 bg-clip-text text-transparent">
            Nasiya Daftari
          </h2>
          <p className="text-muted-foreground font-medium">Qarzlar va nasiyalarni real vaqtda boshqaring.</p>
        </div>
        <Button 
          onClick={() => setIsAddOpen(true)}
          className="bg-primary text-black font-bold h-12 px-6 hover:bg-emerald-400 shadow-lg shadow-primary/20 rounded-xl"
        >
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
              Jami {debts.filter(d => d.status === 'pending').length} kishi kutilmoqda
            </p>
          </CardContent>
        </Card>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Zap className="h-8 w-8 animate-pulse text-primary" />
        </div>
      ) : (
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
                    Muddat: {debt.due_date ? new Date(debt.due_date).toLocaleDateString() : 'Belgilanmagan'}
                  </div>
                </div>
                <div 
                  onClick={() => toggleStatus(debt)}
                  className={`cursor-pointer rounded-lg px-2.5 py-1.5 text-[10px] font-black uppercase tracking-widest shadow-sm ring-1 transition-all hover:scale-105 ${
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
                    <p className="text-2xl font-black text-white tabular-nums">{Number(debt.amount).toLocaleString()} UZS</p>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-9 w-9 rounded-xl bg-white/5 hover:bg-primary/20 hover:text-primary transition-colors"
                      onClick={() => {
                        setEditingDebt(debt);
                        setForm({
                          person: debt.person,
                          amount: debt.amount.toString(),
                          due_date: debt.due_date ? debt.due_date.split('T')[0] : "",
                          status: debt.status
                        });
                        setIsEditOpen(true);
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-9 w-9 rounded-xl bg-white/5 hover:bg-rose-500/20 hover:text-rose-500 transition-colors"
                      onClick={() => handleDelete(debt.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
              {debt.status === 'paid' && (
                <div className="absolute right-[-20px] bottom-[-20px] opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-700 pointer-events-none">
                  <CheckCircle2 className="h-40 w-40 text-emerald-500" />
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Add Modal */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="border-white/10 bg-black/90 backdrop-blur-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-emerald-400 bg-clip-text text-transparent">
              Yangi Nasiya Qo'shish
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-6 py-6">
            <div className="grid gap-2">
              <Label className="text-xs font-bold uppercase tracking-widest opacity-60">Kimdan (Ism)</Label>
              <Input 
                value={form.person} 
                onChange={(e) => setForm({...form, person: e.target.value})}
                placeholder="Masalan: Anvar aka"
                className="bg-white/5 border-white/10 h-12 rounded-xl"
              />
            </div>
            <div className="grid gap-2">
              <Label className="text-xs font-bold uppercase tracking-widest opacity-60">Summa</Label>
              <Input 
                type="number"
                value={form.amount} 
                onChange={(e) => setForm({...form, amount: e.target.value})}
                placeholder="0"
                className="bg-white/5 border-white/10 h-12 rounded-xl text-lg font-bold"
              />
            </div>
            <div className="grid gap-2">
              <Label className="text-xs font-bold uppercase tracking-widest opacity-60">Muddat</Label>
              <Input 
                type="date"
                value={form.due_date} 
                onChange={(e) => setForm({...form, due_date: e.target.value})}
                className="bg-white/5 border-white/10 h-12 rounded-xl"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsAddOpen(false)} className="h-12 px-8 font-bold">Bekor qilish</Button>
            <Button onClick={handleAdd} className="bg-primary text-black font-bold h-12 px-8 hover:bg-emerald-400 rounded-xl">
              Saqlash
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="border-white/10 bg-black/90 backdrop-blur-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-emerald-400 bg-clip-text text-transparent">
              Nasiyani Tahrirlash
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-6 py-6">
            <div className="grid gap-2">
              <Label className="text-xs font-bold uppercase tracking-widest opacity-60">Kimdan (Ism)</Label>
              <Input 
                value={form.person} 
                onChange={(e) => setForm({...form, person: e.target.value})}
                className="bg-white/5 border-white/10 h-12 rounded-xl"
              />
            </div>
            <div className="grid gap-2">
              <Label className="text-xs font-bold uppercase tracking-widest opacity-60">Summa</Label>
              <Input 
                type="number"
                value={form.amount} 
                onChange={(e) => setForm({...form, amount: e.target.value})}
                className="bg-white/5 border-white/10 h-12 rounded-xl text-lg font-bold"
              />
            </div>
            <div className="grid gap-2">
              <Label className="text-xs font-bold uppercase tracking-widest opacity-60">Muddat</Label>
              <Input 
                type="date"
                value={form.due_date} 
                onChange={(e) => setForm({...form, due_date: e.target.value})}
                className="bg-white/5 border-white/10 h-12 rounded-xl"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsEditOpen(false)} className="h-12 px-8 font-bold">Bekor qilish</Button>
            <Button onClick={handleUpdate} className="bg-primary text-black font-bold h-12 px-8 hover:bg-emerald-400 rounded-xl">
              Yangilash
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
