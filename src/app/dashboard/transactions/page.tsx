"use client";

import { useState, useEffect } from "react";
import { 
  Search, 
  Plus, 
  Pencil, 
  Trash2, 
  ArrowUpCircle, 
  ArrowDownCircle, 
  Calendar,
  FileText,
  History,
  Download,
  Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState<any>({});

  const fetchTransactions = () => {
    // Keshni cheklash uchun vaqt tamg'asi qo'shamiz
    fetch(`/api/transactions?t=${Date.now()}`)
      .then(res => res.json())
      .then(data => {
        setTransactions(data);
        setLoading(false);
      });
  };

  const handleExport = async () => {
    const { utils, writeFile } = await import('xlsx');
    
    const exportData = transactions.map(t => ({
      'Sana': new Date(t.created_at).toLocaleDateString('uz-UZ'),
      'Vaqt': new Date(t.created_at).toLocaleTimeString('uz-UZ'),
      'Kategoriya': t.category || 'Boshqa',
      'Izoh': t.note || '-',
      'Tur': t.type === 'income' ? 'Kirim' : 'Chiqim',
      'Miqdor (UZS)': Number(t.amount)
    }));

    const ws = utils.json_to_sheet(exportData);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, "Amallar");
    writeFile(wb, `UzFinance_Amallar_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  useEffect(() => {
    fetchTransactions();
    // Ultra-tezkor yangilanish (2 soniya)
    const interval = setInterval(fetchTransactions, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Ushbu amalni o'chirishni xohlaysizmi?")) return;
    await fetch(`/api/transactions/${id}`, { method: 'DELETE' });
    fetchTransactions();
  };

  const handleEdit = (item: any) => {
    setEditForm(item);
    setIsEditDialogOpen(true);
  };

  const handleUpdate = async () => {
    await fetch(`/api/transactions/${editForm.id}`, {
      method: 'PUT',
      body: JSON.stringify(editForm)
    });
    setIsEditDialogOpen(false);
    fetchTransactions();
  };

  const filtered = transactions.filter(t => 
    t.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.note?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tighter bg-gradient-to-r from-primary to-emerald-400 bg-clip-text text-transparent uppercase italic">
            Amallar Tarixi
          </h2>
          <div className="flex items-center gap-2 mt-1">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
            <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">Live Update (2s)</p>
          </div>
        </div>
        <Button 
          onClick={handleExport}
          className="bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold gap-2 rounded-xl"
        >
          <Download className="h-4 w-4" /> Excelga yuklash
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-emerald-500/20 rounded-xl blur opacity-30 group-hover:opacity-100 transition duration-1000"></div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input 
              placeholder="Qidirish (Kategoriya yoki izoh)..." 
              className="pl-10 bg-card/40 border-white/10 backdrop-blur-xl h-12 rounded-xl focus:ring-primary/50 text-sm" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-card/40 backdrop-blur-xl shadow-2xl overflow-hidden ring-1 ring-white/5">
        <Table>
          <TableHeader>
            <TableRow className="border-white/5 hover:bg-transparent bg-white/5">
              <TableHead className="py-4 text-white font-bold uppercase text-[10px] tracking-widest"><Calendar className="inline mr-2 h-3 w-3 text-primary" /> Sana</TableHead>
              <TableHead className="text-white font-bold uppercase text-[10px] tracking-widest"><FileText className="inline mr-2 h-3 w-3 text-primary" /> Kategoriya</TableHead>
              <TableHead className="text-white font-bold uppercase text-[10px] tracking-widest">Izoh</TableHead>
              <TableHead className="text-white font-bold uppercase text-[10px] tracking-widest">Tur</TableHead>
              <TableHead className="text-right text-white font-bold uppercase text-[10px] tracking-widest">Miqdor</TableHead>
              <TableHead className="text-right text-white font-bold uppercase text-[10px] tracking-widest pr-8">Amallar</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-64 text-center">
                  <Zap className="h-8 w-8 animate-pulse text-primary mx-auto" />
                </TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-64 text-center">
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <History className="h-16 w-16 mb-4 opacity-10" />
                    <p className="text-xl font-bold opacity-50 uppercase tracking-tighter">Hech qanday amal topilmadi</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((item) => (
                <TableRow key={item.id} className="border-white/5 group transition-all duration-300 hover:bg-white/5">
                  <TableCell className="font-medium text-white/80 py-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold">{new Date(item.created_at).toLocaleDateString('uz-UZ')}</span>
                      <span className="text-[10px] text-primary font-black opacity-60">
                        {new Date(item.created_at).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="rounded-lg bg-primary/10 border border-primary/20 px-3 py-1.5 text-[9px] font-black uppercase tracking-widest text-primary shadow-[0_0_15px_rgba(var(--primary),0.1)]">
                      {item.category || 'Boshqa'}
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground font-medium group-hover:text-white transition-colors max-w-[200px] truncate">
                    {item.note || '-'}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className={`h-1.5 w-1.5 rounded-full ${item.type === 'income' ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                      <span className={`font-black text-[10px] uppercase tracking-tighter ${item.type === 'income' ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {item.type === 'income' ? 'Kirim' : 'Chiqim'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-black text-white text-lg tabular-nums">
                    <span className={item.type === 'expense' ? 'text-rose-500' : 'text-emerald-500'}>
                      {item.type === 'expense' ? '-' : '+'}{Number(item.amount).toLocaleString()}
                    </span>
                    <span className="text-[10px] ml-1 opacity-40 font-bold uppercase">UZS</span>
                  </TableCell>
                  <TableCell className="text-right pr-8">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(item)} className="h-8 w-8 rounded-lg bg-white/5 hover:bg-primary/20 text-white/40 hover:text-primary border border-white/5">
                        <Pencil className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)} className="h-8 w-8 rounded-lg bg-white/5 hover:bg-rose-500/20 text-white/40 hover:text-rose-500 border border-white/5">
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Edit Modal */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="border-white/10 bg-[#050505] backdrop-blur-2xl rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black bg-gradient-to-r from-primary to-emerald-400 bg-clip-text text-transparent uppercase">
              Tahrirlash
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-6 py-6">
            <div className="grid gap-2">
              <Label className="text-[10px] font-black uppercase tracking-widest opacity-40">Summa</Label>
              <Input type="number" value={editForm.amount} onChange={(e) => setEditForm({...editForm, amount: e.target.value})} className="bg-white/5 border-white/10 h-12 text-lg font-black" />
            </div>
            <div className="grid gap-2">
              <Label className="text-[10px] font-black uppercase tracking-widest opacity-40">Kategoriya</Label>
              <Input value={editForm.category} onChange={(e) => setEditForm({...editForm, category: e.target.value})} className="bg-white/5 border-white/10 h-12 font-bold" />
            </div>
            <div className="grid gap-2">
              <Label className="text-[10px] font-black uppercase tracking-widest opacity-40">Izoh</Label>
              <Input value={editForm.note} onChange={(e) => setEditForm({...editForm, note: e.target.value})} className="bg-white/5 border-white/10 h-12 font-medium" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsEditDialogOpen(false)} className="h-12 px-8 font-bold uppercase text-[10px] tracking-widest">Bekor qilish</Button>
            <Button onClick={handleUpdate} className="bg-primary text-black font-black h-12 px-8 hover:bg-emerald-400 rounded-xl uppercase text-[10px] tracking-widest shadow-[0_10px_20px_rgba(16,185,129,0.2)]">
              Saqlash
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
