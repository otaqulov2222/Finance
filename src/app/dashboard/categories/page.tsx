"use client";

import { useState, useEffect } from "react";
import { 
  Tags, 
  Plus, 
  Trash2, 
  Zap,
  ArrowUpCircle,
  ArrowDownCircle,
  Hash
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newCat, setNewCat] = useState({ name: "", type: "expense" });

  const fetchCategories = () => {
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => {
        setCategories(data);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAddCat = async () => {
    if (!newCat.name) return;
    await fetch('/api/categories', {
      method: 'POST',
      body: JSON.stringify(newCat)
    });
    setIsAddDialogOpen(false);
    setNewCat({ ...newCat, name: "" });
    fetchCategories();
  };

  const handleDelete = async (id: number) => {
    if (!confirm("O'chirishni xohlaysizmi?")) return;
    await fetch(`/api/categories?id=${id}`, { method: 'DELETE' });
    fetchCategories();
  };

  const renderList = (type: string) => (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {categories.filter(c => c.type === type).map((cat) => (
        <Card key={cat.id} className="border-none bg-card/40 backdrop-blur-xl ring-1 ring-white/10 group hover:bg-white/5 transition-all">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl ${type === 'income' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                <Hash className="h-4 w-4" />
              </div>
              <span className="font-bold text-white uppercase tracking-tighter">{cat.name}</span>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => handleDelete(cat.id)}
              className="h-8 w-8 text-white/20 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      ))}
      <Button 
        onClick={() => { setNewCat({ ...newCat, type }); setIsAddDialogOpen(true); }}
        variant="outline" 
        className="h-[68px] border-dashed border-white/10 bg-transparent hover:bg-white/5 text-white/40 hover:text-white rounded-2xl flex items-center justify-center gap-2"
      >
        <Plus className="h-4 w-4" /> Qo'shish
      </Button>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div>
        <h2 className="text-3xl font-black tracking-tighter bg-gradient-to-r from-primary to-emerald-400 bg-clip-text text-transparent uppercase italic">
          Kategoriyalar
        </h2>
        <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] mt-1 italic">Tizimni o'zingizga moslang</p>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Zap className="h-8 w-8 animate-pulse text-primary" />
        </div>
      ) : (
        <Tabs defaultValue="expense" className="w-full">
          <TabsList className="bg-white/5 border border-white/10 p-1 rounded-2xl mb-8">
            <TabsTrigger value="expense" className="rounded-xl px-8 py-2.5 data-[state=active]:bg-primary data-[state=active]:text-black font-black uppercase text-[10px] tracking-widest transition-all">
              🔴 Chiqimlar
            </TabsTrigger>
            <TabsTrigger value="income" className="rounded-xl px-8 py-2.5 data-[state=active]:bg-primary data-[state=active]:text-black font-black uppercase text-[10px] tracking-widest transition-all">
              🟢 Kirimlar
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="expense" className="mt-0">
            {renderList('expense')}
          </TabsContent>
          <TabsContent value="income" className="mt-0">
            {renderList('income')}
          </TabsContent>
        </Tabs>
      )}

      {/* Add Category Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="border-white/10 bg-[#050505] backdrop-blur-2xl rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-white uppercase tracking-tighter italic">Yangi Kategoriya</DialogTitle>
          </DialogHeader>
          <div className="py-6">
            <div className="grid gap-2">
              <Label className="text-[10px] font-black uppercase tracking-widest opacity-40">Nomi</Label>
              <Input placeholder="Masalan: Dorixona" value={newCat.name} onChange={(e) => setNewCat({...newCat, name: e.target.value})} className="bg-white/5 border-white/10 h-14 text-xl font-bold text-white rounded-2xl" />
            </div>
            <p className="text-[10px] font-bold text-white/20 mt-4 uppercase tracking-widest italic">
              Turi: <span className={newCat.type === 'income' ? 'text-emerald-500' : 'text-rose-500'}>{newCat.type === 'income' ? 'Kirim' : 'Chiqim'}</span>
            </p>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsAddDialogOpen(false)}>Bekor qilish</Button>
            <Button onClick={handleAddCat} className="bg-primary text-black font-black px-10 h-12 rounded-xl">Saqlash</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
